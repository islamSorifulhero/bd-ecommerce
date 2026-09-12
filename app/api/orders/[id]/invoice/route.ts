// app/api/orders/[id]/invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

interface Props {
  params: { id: string };
}

// Optional: drop a Unicode font that supports Bangla glyphs (e.g. Noto Sans
// Bengali, https://fonts.google.com/noto/specimen/Noto+Sans+Bengali) at
// fonts/NotoSansBengali-Regular.ttf and the invoice will pick it up
// automatically and render Bangla product names/addresses correctly.
// Without it, pdfkit falls back to Helvetica, which has no Bangla glyphs —
// any Bangla text will render blank/garbled.
const BANGLA_FONT_PATH = path.join(process.cwd(), "fonts", "NotoSansBengali-Regular.ttf");

function registerFontIfAvailable(doc: PDFKit.PDFDocument): string {
  try {
    if (fs.existsSync(BANGLA_FONT_PATH)) {
      doc.registerFont("Bangla", BANGLA_FONT_PATH);
      return "Bangla";
    }
  } catch {
    // ignore — fall back below
  }
  return "Helvetica";
}

export async function GET(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: true } },
      address: true,
      user: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isOwner = order.userId === session.user.id;
  const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const fontName = registerFontIfAvailable(doc);
  doc.font(fontName);

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const donePromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // --- Header ---
  // Bangla text (product names, address, etc.) only renders correctly if a
  // Unicode font was found and registered above; otherwise stick to English
  // labels here to avoid blank/garbled glyphs from the Helvetica fallback.
  doc.fontSize(20).text("BD Shop", { continued: false });
  doc.fontSize(10).fillColor("#666").text("Invoice");
  doc.moveDown(1);

  doc.fillColor("#000").fontSize(12);
  doc.text(`Order #: ${order.orderNumber}`);
  doc.text(`Date: ${order.createdAt.toLocaleDateString("en-GB")}`);
  doc.text(`Payment method: ${order.paymentMethod} (${order.paymentStatus})`);
  doc.moveDown(1);

  // --- Customer / shipping ---
  doc.fontSize(13).text("Ship To:", { underline: true });
  doc.fontSize(11).fillColor("#333");
  doc.text(order.user.name);
  if (order.user.phone) doc.text(order.user.phone);
  doc.text(`${order.address.fullAddress}, ${order.address.thana}, ${order.address.district}`);
  doc.moveDown(1.5);

  // --- Items table (simple manual layout) ---
  doc.fillColor("#000").fontSize(12).text("Items", { underline: true });
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const col = { name: 50, qty: 320, price: 390, total: 470 };

  doc.fontSize(10).fillColor("#666");
  doc.text("Item", col.name, tableTop);
  doc.text("Qty", col.qty, tableTop);
  doc.text("Price", col.price, tableTop);
  doc.text("Total", col.total, tableTop);
  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor("#ddd").stroke();

  let y = tableTop + 22;
  doc.fillColor("#000").fontSize(10);
  for (const item of order.items) {
    const label = item.variantLabel ? `${item.product.name} (${item.variantLabel})` : item.product.name;
    const lineTotal = Number(item.price) * item.quantity;

    doc.text(label, col.name, y, { width: 260 });
    doc.text(String(item.quantity), col.qty, y);
    doc.text(`৳${Number(item.price).toLocaleString()}`, col.price, y);
    doc.text(`৳${lineTotal.toLocaleString()}`, col.total, y);
    y += 20;
  }

  doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor("#ddd").stroke();
  y += 15;

  const subtotal = Number(order.totalAmount) - Number(order.shippingCharge) + Number(order.discountAmount);

  doc.text("Subtotal:", col.price - 60, y);
  doc.text(`৳${subtotal.toLocaleString()}`, col.total, y);
  y += 16;

  doc.text("Shipping:", col.price - 60, y);
  doc.text(`৳${Number(order.shippingCharge).toLocaleString()}`, col.total, y);
  y += 16;

  if (Number(order.discountAmount) > 0) {
    doc.text("Discount:", col.price - 60, y);
    doc.text(`-৳${Number(order.discountAmount).toLocaleString()}`, col.total, y);
    y += 16;
  }

  doc.fontSize(12).text("Total:", col.price - 60, y);
  doc.text(`৳${Number(order.totalAmount).toLocaleString()}`, col.total, y);

  doc.moveDown(3);
  doc.fontSize(9).fillColor("#999").text("Thank you for shopping with BD Shop.", { align: "center" });

  doc.end();
  const pdfBuffer = await donePromise;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  });
}
