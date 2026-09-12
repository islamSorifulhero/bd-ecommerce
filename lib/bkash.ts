// lib/bkash.ts
// Thin wrapper around the bKash Merchant Checkout (Tokenized) REST API.
// Docs: https://developer.bka.sh/  (Sandbox base shown below; swap for live URL in prod)

const BKASH_BASE_URL =
  process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

interface TokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getBkashToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: process.env.BKASH_USERNAME!,
      password: process.env.BKASH_PASSWORD!,
    },
    body: JSON.stringify({
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    }),
  });

  if (!res.ok) throw new Error("bKash token grant failed");
  const data: TokenResponse = await res.json();

  cachedToken = {
    token: data.id_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.id_token;
}

export async function bkashCreatePayment(params: {
  amount: number;
  orderId: string;
  callbackURL: string;
}) {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "X-APP-Key": process.env.BKASH_APP_KEY!,
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: params.orderId,
      callbackURL: params.callbackURL,
      amount: params.amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: params.orderId,
    }),
  });

  if (!res.ok) throw new Error("bKash create payment failed");
  return res.json();
}

export async function bkashExecutePayment(paymentID: string) {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "X-APP-Key": process.env.BKASH_APP_KEY!,
    },
    body: JSON.stringify({ paymentID }),
  });

  if (!res.ok) throw new Error("bKash execute payment failed");
  return res.json();
}

export async function bkashQueryPayment(paymentID: string) {
  const token = await getBkashToken();

  const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/payment/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "X-APP-Key": process.env.BKASH_APP_KEY!,
    },
    body: JSON.stringify({ paymentID }),
  });

  if (!res.ok) throw new Error("bKash query payment failed");
  return res.json();
}

export async function bkashRefundTransaction(params: {
  paymentID: string;
  trxID: string;
  amount: number;
  sku?: string;
}) {
  const token = await getBkashToken();

  const res = await fetch(
    `${BKASH_BASE_URL}/tokenized/checkout/payment/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "X-APP-Key": process.env.BKASH_APP_KEY!,
      },
      body: JSON.stringify({
        paymentID: params.paymentID,
        amount: params.amount.toString(),
        trxID: params.trxID,
        sku: params.sku || "refund",
        reason: "Order cancelled",
      }),
    }
  );

  if (!res.ok) throw new Error("bKash refund failed");
  return res.json();
}
