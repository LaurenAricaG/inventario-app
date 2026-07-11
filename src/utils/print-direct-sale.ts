import { SerializedDirectSaleWithRelations } from "@/types/direct-sale";

export function printDirectSale(
  sale: SerializedDirectSaleWithRelations,
  systemName: string,
) {
  if (typeof window === "undefined") return;

  // 1. Crear o reutilizar un iframe invisible dentro del documento
  let iframe = document.getElementById(
    "print-invoice-iframe",
  ) as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "print-invoice-iframe";
    // Posicionar y ocultar el iframe fuera del area visible
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    document.body.appendChild(iframe);
  }

  const printDocument = iframe.contentWindow?.document;
  if (!printDocument) return;

  const formatLocalDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const calculatedSubtotal = sale.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const itemsHtml = sale.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e4e4e7;">${item.product.code || "-"}</td>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e4e4e7;">
        <strong>${item.product.name}</strong><br/>
        <small style="color: #71717a; font-size: 11px;">${item.product.brand.name} • ${item.product.category.name}</small>
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e4e4e7; text-align: center; font-family: monospace;">${item.quantity}</td>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e4e4e7; text-align: right; font-family: monospace;">S/ ${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 10px 8px; border-bottom: 1px dashed #e4e4e7; text-align: right; font-family: monospace; font-weight: bold;">S/ ${(
        item.quantity * item.unitPrice
      ).toFixed(2)}</td>
    </tr>
  `,
    )
    .join("");

  const discountHtml =
    sale.discount > 0
      ? `<div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #ef4444; font-family: monospace;">
          <span>DESCUENTO:</span>
          <span>-S/ ${sale.discount.toFixed(2)}</span>
        </div>`
      : "";

  printDocument.open();
  printDocument.write(`
    <html>
      <head>
        <title>Boleta Directa #${sale.id}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #18181b; background-color: #ffffff; }
          .invoice-box { max-width: 650px; margin: auto; border: 1px solid #e4e4e7; padding: 30px; border-radius: 12px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #e4e4e7; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: 900; color: #993556; letter-spacing: -0.5px; }
          .logo-sub { font-size: 8px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700; }
          .boleta-box { border: 2px solid #db2777; border-radius: 10px; padding: 12px; text-align: center; background: #fdf2f8; min-width: 180px; }
          .boleta-title { font-size: 10px; font-weight: 800; color: #db2777; text-transform: uppercase; letter-spacing: 1.5px; margin: 0; }
          .boleta-number { font-size: 16px; font-weight: 900; font-family: monospace; color: #db2777; margin-top: 4px; }
          .details-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 15px; margin-bottom: 20px; font-size: 12px; }
          .details-row { display: flex; margin-bottom: 6px; }
          .details-label { width: 90px; color: #71717a; font-weight: 700; text-transform: uppercase; font-size: 10px; }
          .details-value { color: #09090b; font-weight: 600; }
          .items-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; margin-bottom: 20px; }
          .items-table th { background: #f4f4f5; padding: 10px 8px; font-weight: 700; color: #71717a; border-bottom: 2px dashed #e4e4e7; font-size: 10px; text-transform: uppercase; }
          .footer-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 15px; align-items: start; margin-top: 10px; }
          .totals-box { border: 1px solid #e4e4e7; border-radius: 10px; padding: 12px; background: #fafafa; }
          .note-box { font-size: 11px; color: #71717a; border-left: 3px solid #db2777; padding-left: 10px; margin-top: 8px; }
          .thank-you { text-align: center; font-size: 9px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin-top: 30px; font-weight: 600; border-top: 1px dashed #e4e4e7; padding-top: 15px; }
          @media print {
            body { padding: 0; background-color: transparent; }
            .invoice-box { border: none; box-shadow: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="logo">${systemName}</div>
              <div class="logo-sub">Control de Ventas</div>
            </div>
            <div class="boleta-box">
              <div class="boleta-title">Boleta de Venta Directa</div>
              <div class="boleta-number">N° DS-${sale.id.toString().padStart(6, "0")}</div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="details-row">
                <span class="details-label">Cliente:</span>
                <span class="details-value">${sale.client.name}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Dirección:</span>
                <span class="details-value">${sale.client.address || "No especificada"}</span>
              </div>
            </div>
            <div>
              <div class="details-row">
                <span class="details-label">F. Emisión:</span>
                <span class="details-value">${formatLocalDate(sale.createdAt)}</span>
              </div>
              <div class="details-row">
                <span class="details-label">Teléfono:</span>
                <span class="details-value">${sale.client.phone || "No especificado"}</span>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 100px;">Cód. Producto</th>
                <th>Descripción del Producto</th>
                <th style="text-align: center; width: 60px;">Cant.</th>
                <th style="text-align: right; width: 100px;">P. Unitario</th>
                <th style="text-align: right; width: 110px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="footer-grid">
            <div>
              ${
                sale.notes
                  ? `<div class="note-box">
                      <strong style="color: #09090b; font-size: 10px; text-transform: uppercase;">Observaciones:</strong><br/>
                      <span style="font-style: italic; display: inline-block; margin-top: 4px;">${sale.notes}</span>
                    </div>`
                  : ""
              }
            </div>
            <div class="totals-box">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #71717a; font-family: monospace;">
                <span>SUBTOTAL:</span>
                <span>S/ ${calculatedSubtotal.toFixed(2)}</span>
              </div>
              ${discountHtml}
              <hr style="border: none; border-top: 1px dashed #e4e4e7; margin: 8px 0;"/>
              <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #db2777; font-family: monospace;">
                <span>TOTAL NETO:</span>
                <span>S/ ${sale.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="thank-you">¡Gracias por su preferencia!</div>
        </div>
      </body>
    </html>
  `);
  printDocument.close();

  // Esperar un instante para que el contenido se cargue en el iframe y llamar a print
  setTimeout(() => {
    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  }, 150);
}
