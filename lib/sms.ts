// lib/sms.ts
// Generic wrapper for a Bangladeshi SMS gateway. Most local providers
// (BulkSMSBD, Alpha SMS, Mimsms, etc.) expose a simple GET/POST endpoint
// like the one below — adjust SMS_API_URL / the param names to match
// whichever provider you sign up with; the rest of the app just calls
// sendSMS() and never needs to know which provider is behind it.

function toBDMsisdn(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `88${digits}`;
  return `880${digits}`;
}

export async function sendSMS(phone: string, message: string) {
  if (!process.env.SMS_API_KEY) {
    console.warn(`[sms] SMS_API_KEY not set. Would send to ${phone}: ${message}`);
    return;
  }

  const params = new URLSearchParams({
    api_key: process.env.SMS_API_KEY,
    senderid: process.env.SMS_SENDER_ID || "",
    number: toBDMsisdn(phone),
    message,
  });

  try {
    const res = await fetch(`${process.env.SMS_API_URL}?${params.toString()}`, {
      method: "GET",
    });
    if (!res.ok) {
      console.error("SMS send failed:", await res.text());
    }
  } catch (err) {
    console.error("SMS send error:", err);
  }
}

const SMS_STATUS_LABELS_BN: Record<string, string> = {
  CONFIRMED: "কনফার্ম হয়েছে",
  PROCESSING: "প্রসেসিং হচ্ছে",
  SHIPPED: "কুরিয়ারে দেওয়া হয়েছে",
  DELIVERED: "ডেলিভার হয়েছে",
  CANCELLED: "বাতিল হয়েছে",
  RETURNED: "রিটার্ন হয়েছে",
};

export async function sendOrderStatusSMS(phone: string, orderNumber: string, status: string) {
  const label = SMS_STATUS_LABELS_BN[status];
  if (!label) return;
  await sendSMS(phone, `আপনার অর্ডার #${orderNumber} ${label}। ধন্যবাদ - BD Shop`);
}

export async function sendOrderConfirmationSMS(phone: string, orderNumber: string, amount: number) {
  await sendSMS(
    phone,
    `আপনার অর্ডার #${orderNumber} গ্রহণ করা হয়েছে। মোট: ৳${amount}। ধন্যবাদ - BD Shop`
  );
}
