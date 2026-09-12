// lib/sslcommerz.ts
// Refund support for SSLCommerz. A refund needs the bank_tran_id captured
// during IPN validation (stored in Payment.rawResponse.bank_tran_id).

const SSLCOMMERZ_REFUND_URL =
  process.env.SSLCOMMERZ_IS_LIVE === "true"
    ? "https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php"
    : "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php";

export async function sslcommerzRefund(params: {
  bankTranId: string;
  refundAmount: number;
  refundRemarks?: string;
}) {
  const payload = new URLSearchParams({
    bank_tran_id: params.bankTranId,
    refund_amount: params.refundAmount.toString(),
    refund_remarks: params.refundRemarks || "Order cancelled",
    store_id: process.env.SSLCOMMERZ_STORE_ID!,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
    format: "json",
  });

  const res = await fetch(`${SSLCOMMERZ_REFUND_URL}?${payload.toString()}`, {
    method: "GET",
  });

  if (!res.ok) throw new Error("SSLCommerz refund failed");
  return res.json();
}
