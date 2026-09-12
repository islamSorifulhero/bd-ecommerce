// lib/steadfast.ts
// Steadfast Courier API wrapper. Docs: https://developer.steadfast.com.bd/

const STEADFAST_BASE_URL = "https://portal.packzy.com/api/v1";

interface SteadfastOrderInput {
  invoice: string; // your order number
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number; // 0 if already paid online
  note?: string;
}

export async function steadfastCreateOrder(input: SteadfastOrderInput) {
  const res = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": process.env.STEADFAST_API_KEY!,
      "Secret-Key": process.env.STEADFAST_SECRET_KEY!,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error("Steadfast create order failed");
  return res.json();
}

export async function steadfastTrackByCID(consignmentId: string) {
  const res = await fetch(
    `${STEADFAST_BASE_URL}/status_by_cid/${consignmentId}`,
    {
      headers: {
        "Api-Key": process.env.STEADFAST_API_KEY!,
        "Secret-Key": process.env.STEADFAST_SECRET_KEY!,
      },
    }
  );
  if (!res.ok) throw new Error("Steadfast tracking lookup failed");
  return res.json();
}
