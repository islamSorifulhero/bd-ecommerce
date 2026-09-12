# Fonts

Drop a Unicode TTF font that supports Bangla glyphs here, named exactly:

    NotoSansBengali-Regular.ttf

Recommended: https://fonts.google.com/noto/specimen/Noto+Sans+Bengali
(download the .ttf, rename if needed, place it in this folder).

Once present, `app/api/orders/[id]/invoice/route.ts` automatically picks it
up and renders Bangla product names/addresses correctly in downloaded
invoices. Without it, invoices fall back to Helvetica (English-only —
Bangla text will render blank/garbled).
