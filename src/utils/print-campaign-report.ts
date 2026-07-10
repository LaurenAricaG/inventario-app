interface PrintCampaign {
  number: string;
  company: { name: string };
}

interface PrintItem {
  productCode: string | null;
  productName: string;
  catalogPrice: number;
  quantity: number;
  arrivalStatus: string;
  substituteCode: string | null;
  substituteName: string | null;
  substitutePrice: number | null;
  brand: { name: string };
}

interface PrintOrder {
  id: number;
  client: { name: string; address: string | null };
  discount: number;
  status: string;
  items: PrintItem[];
  notes?: string | null;
}

const statusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  ARRIVED: "Llegado",
  VERIFIED: "Verificado",
  PACKED: "Empacado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const statusBadgeStyles: Record<string, string> = {
  PENDING: "background-color: #fefbeb; color: #b45309; border: 1px solid #fde68a;",
  ARRIVED: "background-color: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd;",
  VERIFIED: "background-color: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8;",
  PACKED: "background-color: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8;",
  DELIVERED: "background-color: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;",
  CANCELLED: "background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca;",
};

export function printCampaignReport(campaign: PrintCampaign, orders: PrintOrder[]) {
  if (typeof window === "undefined") return;

  let iframe = document.getElementById("print-campaign-iframe") as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "print-campaign-iframe";
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    document.body.appendChild(iframe);
  }

  const printDocument = iframe.contentWindow?.document;
  if (!printDocument) return;

  const totalCampaignAmount = orders.reduce((sum, order) => {
    if (order.status === "CANCELLED") return sum;
    const sub = order.items.reduce((s, item) => {
      if (item.arrivalStatus === "MISSING") return s;
      const price = item.arrivalStatus === "SUBSTITUTED" && item.substitutePrice !== null
        ? item.substitutePrice
        : item.catalogPrice;
      return s + item.quantity * price;
    }, 0);
    return sum + Math.max(0, sub - order.discount);
  }, 0);

  const clientsHtml = orders.map((order) => {
    const isOrderCancelled = order.status === "CANCELLED";
    const subtotal = order.items.reduce((s, item) => {
      if (item.arrivalStatus === "MISSING") return s;
      const price = item.arrivalStatus === "SUBSTITUTED" && item.substitutePrice !== null
        ? item.substitutePrice
        : item.catalogPrice;
      return s + item.quantity * price;
    }, 0);
    
    // Forzar total a 0 si está cancelado
    const total = isOrderCancelled ? 0 : Math.max(0, subtotal - order.discount);

    const itemsRows = order.items.map((item) => {
      const isMissing = item.arrivalStatus === "MISSING";
      const isSub = item.arrivalStatus === "SUBSTITUTED";
      const code = isSub ? item.substituteCode : item.productCode;
      const name = isSub ? `[Sustituto] ${item.substituteName}` : item.productName;
      const price = isSub ? item.substitutePrice : item.catalogPrice;

      return `
        <tr style="${isMissing ? 'text-decoration: line-through; color: #a1a1aa;' : ''}">
          <td style="padding: 8px 10px; border-bottom: 1px solid #f4f4f5; font-family: monospace; font-size: 10px;">${code || "-"}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f4f4f5; color: #52525b;">${item.brand.name}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f4f4f5; font-weight: 500; color: #18181b;">
            ${name} ${isMissing ? '<strong style="display: inline-block; text-decoration: none; color: #ef4444; font-size: 9px; margin-left: 4px; border: 1px solid #fecaca; background: #fef2f2; padding: 1px 4px; border-radius: 4px;">(FALTÓ)</strong>' : ''}
          </td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f4f4f5; text-align: center; font-weight: 600; color: #18181b;">${item.quantity}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f4f4f5; text-align: right; font-family: monospace; color: #52525b;">S/ ${price?.toFixed(2) || "0.00"}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f4f4f5; text-align: right; font-family: monospace; font-weight: 700; color: #18181b;">
            S/ ${(isMissing ? 0 : item.quantity * (price || 0)).toFixed(2)}
          </td>
        </tr>
      `;
    }).join("");

    const badgeStyle = statusBadgeStyles[order.status] || "background-color: #f4f4f5; color: #52525b; border: 1px solid #e4e4e7;";
    const statusText = statusTranslations[order.status] || order.status;

    const notesBlock = (order.notes && order.status === "DELIVERED")
      ? `
        <div style="margin-top: 12px; padding: 10px 14px; bg-color: #fffbeb; background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d97706; border-radius: 8px; font-size: 11px; color: #b45309; font-weight: 500; text-align: left; line-height: 1.4;">
          <span style="font-weight: bold; text-transform: uppercase; font-size: 9px; display: block; margin-bottom: 2px; letter-spacing: 0.5px;">Mensaje de Pago / Plazo:</span>
          ${order.notes}
        </div>
      `
      : "";

    const showTotals = order.status === "DELIVERED" || order.status === "CANCELLED";
    const totalsBlock = !showTotals
      ? ""
      : `
          <div style="margin-top: 15px; display: flex; flex-direction: column; align-items: flex-end; font-size: 11px;">
            <div style="width: 220px; border-top: 1px dashed #e4e4e7; padding-top: 8px; line-height: 1.6;">
              <div style="display: flex; justify-content: space-between; color: #71717a;">
                <span>Subtotal:</span>
                <span style="font-family: monospace;">S/ ${subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #ef4444;">
                <span>Descuento:</span>
                <span style="font-family: monospace;">-S/ ${order.discount.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 800; color: #9d174d; font-size: 12px; margin-top: 4px; border-top: 1px solid #fbcfe8; padding-top: 4px;">
                <span>Total Cliente:</span>
                <span style="font-family: monospace;">S/ ${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        `;

    return `
      <div style="margin-bottom: 30px; page-break-inside: avoid; border: 1px solid #e4e4e7; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div style="background: #fdf2f8; padding: 12px 18px; border-bottom: 1px solid #fbcfe8; border-left: 5px solid #be185d; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #9d174d; letter-spacing: -0.2px;">${order.client.name}</h3>
          <span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; ${badgeStyle}">
            ${statusText}
          </span>
        </div>
        <div style="padding: 18px; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="text-align: left; color: #71717a; border-bottom: 2px solid #f4f4f5; font-size: 10px;">
                <th style="padding: 6px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Código</th>
                <th style="padding: 6px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Marca</th>
                <th style="padding: 6px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Producto</th>
                <th style="padding: 6px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Cant.</th>
                <th style="padding: 6px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Precio Unit.</th>
                <th style="padding: 6px 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          
          ${totalsBlock}
          
          ${notesBlock}
        </div>
      </div>
    `;
  }).join("");

  printDocument.open();
  printDocument.write(`
    <html>
      <head>
        <title>Consolidado - Campaña ${campaign.number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { 
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; 
            padding: 30px; 
            color: #18181b; 
            background-color: #fafafa;
          }
          .summary-container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border: 1px solid #e4e4e7;
            border-radius: 20px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          }
          .summary-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            border-bottom: 3px solid #be185d; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          h1 { 
            margin: 0; 
            font-size: 24px; 
            font-weight: 800; 
            color: #be185d;
            letter-spacing: -0.5px;
          }
          h2 { 
            margin: 0; 
            font-size: 11px; 
            color: #9d174d; 
            margin-top: 6px; 
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            font-weight: 700;
          }
          .header-meta {
            text-align: right; 
            font-size: 11px; 
            line-height: 1.6;
            color: #52525b;
          }
          .header-meta strong {
            color: #18181b;
          }
          .consolidated-badge {
            background: #fdf2f8; 
            border: 1px solid #fbcfe8;
            color: #be185d;
            font-weight: 800;
            font-size: 12px;
            padding: 4px 10px;
            border-radius: 8px;
            display: inline-block;
            margin-top: 4px;
          }
          @media print {
            body { 
              padding: 0; 
              background-color: #ffffff;
            }
            .summary-container {
              border: none;
              padding: 0;
              box-shadow: none;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="summary-container">
          <div class="summary-header">
            <div>
              <h1>LAUREN ARICA</h1>
              <h2>Reporte de Pedidos por Campaña</h2>
            </div>
            <div class="header-meta">
              <strong>Campaña:</strong> ${campaign.company.name} - ${campaign.number}<br/>
              <strong>Total Pedidos:</strong> ${orders.length}<br/>
              <span class="consolidated-badge">
                Monto Consolidado: S/ ${totalCampaignAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <div>
            ${clientsHtml}
          </div>
        </div>
      </body>
    </html>
  `);
  printDocument.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
  }, 100);
}
