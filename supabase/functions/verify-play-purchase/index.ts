// Supabase Edge Function: verify-play-purchase
// التحقق الأمني الرسمي من إيصالات واشتراكات متجر Google Play مع Google Android Publisher API

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getGooglePlayAccessToken(clientEmail: string, privateKeyPem: string): Promise<string> {
  const cleanPem = privateKeyPem
    .replace(/\\n/g, "\n")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");

  const binaryDer = Uint8Array.from(atob(cleanPem), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodeBase64Url = (obj: any) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const unsignedToken = `${encodeBase64Url(header)}.${encodeBase64Url(claimSet)}`;
  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureBase64Url = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const assertion = `${unsignedToken}.${signatureBase64Url}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(`Google OAuth token failed: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !authUser?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized user session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { purchaseToken, productSku, planDuration, orderId } = await req.json();
    if (!purchaseToken || !productSku) {
      return new Response(JSON.stringify({ error: "Missing purchaseToken or productSku" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const packageName = "com.mawada.rahma";
    const clientEmail = Deno.env.get("PLAY_SERVICE_ACCOUNT_EMAIL");
    const privateKey = Deno.env.get("PLAY_SERVICE_ACCOUNT_PRIVATE_KEY");

    // إذا كانت مفاتيح حساب مطور جوجل مهيأة، نتحقق عبر Android Publisher API
    if (clientEmail && privateKey) {
      const googleToken = await getGooglePlayAccessToken(clientEmail, privateKey);
      const verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptionsv2/tokens/${purchaseToken}`;
      
      const verifyRes = await fetch(verifyUrl, {
        headers: { Authorization: `Bearer ${googleToken}` },
      });

      if (!verifyRes.ok) {
        const errDetail = await verifyRes.text();
        return new Response(JSON.stringify({ error: "فشل التحقق من صحة الاشتراك مع متجر Google Play", details: errDetail }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // تفعيل الاشتراك في قاعدة البيانات عبر دالة السيرفر المحمية بمفتاح الخدمة
    const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc("verify_google_play_purchase_rpc", {
      p_user_id: authUser.user.id,
      p_product_sku: productSku,
      p_plan_duration: planDuration || "month",
      p_purchase_token: purchaseToken,
      p_order_id: orderId || `GPA.${Date.now()}`,
      p_is_native: true,
    });

    if (rpcErr) {
      return new Response(JSON.stringify({ error: rpcErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, data: rpcData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
