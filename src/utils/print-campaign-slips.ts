import { toast } from "sonner";
import { formatDateUTC } from "@/utils/date.utils";

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
  paymentDate?: Date | string | null;
}

export function printCampaignSlips(
  campaign: PrintCampaign,
  orders: PrintOrder[],
  systemName: string,
) {
  if (typeof window === "undefined") return;

  // Filtrar solo pedidos que han sido Empacados o Entregados
  const targetOrders = orders.filter(
    (o) => o.status === "PACKED" || o.status === "DELIVERED",
  );

  if (targetOrders.length === 0) {
    toast.warning("No hay pedidos empacados o entregados para generar fichas.");
    return;
  }

  // Ordenar de mayor a menor cantidad de productos (excluyendo MISSING)
  targetOrders.sort((a, b) => {
    const countA = a.items.filter((i) => i.arrivalStatus !== "MISSING").length;
    const countB = b.items.filter((i) => i.arrivalStatus !== "MISSING").length;
    return countB - countA;
  });

  let iframe = document.getElementById(
    "print-slips-iframe",
  ) as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "print-slips-iframe";
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    document.body.appendChild(iframe);
  }

  const printDocument = iframe.contentWindow?.document;
  if (!printDocument) return;

  const slipsHtml = targetOrders
    .map((order) => {
      // Calcular subtotal omitiendo los ítems que faltaron (MISSING)
      const subtotal = order.items.reduce((s, item) => {
        if (item.arrivalStatus === "MISSING") return s;
        const price =
          item.arrivalStatus === "SUBSTITUTED" && item.substitutePrice !== null
            ? item.substitutePrice
            : item.catalogPrice;
        return s + item.quantity * price;
      }, 0);

      const total = Math.max(0, subtotal - order.discount);

      // Renderizar solo productos que sí llegaron o fueron sustituidos
      const itemsRows = order.items
        .filter((item) => item.arrivalStatus !== "MISSING")
        .map((item) => {
          const isSub = item.arrivalStatus === "SUBSTITUTED";
          const name = isSub ? item.substituteName : item.productName;
          const price = isSub ? item.substitutePrice : item.catalogPrice;

          return `
          <tr>
            <td style="padding: 4px; border-bottom: 1px dashed #f4f4f5; font-weight: 500; color: #18181b; font-family: monospace">${name}</td>
            <td style="padding: 4px; border-bottom: 1px dashed #f4f4f5; text-align: center; font-weight: 500; color: #18181b; font-family: monospace">${item.quantity}</td>
            <td style="padding: 4px; border-bottom: 1px dashed #f4f4f5; text-align: right; font-family: monospace; color: #52525b;">${price?.toFixed(2) || "0.00"}</td>
            <td style="padding: 4px; border-bottom: 1px dashed #f4f4f5; text-align: right; font-family: monospace; font-weight: bold; color: #18181b;">
              ${(item.quantity * (price || 0)).toFixed(2)}
            </td>
          </tr>
        `;
        })
        .join("");

      return `
      <div class="slip-card">
        <div class="scissors-icon">✂ Recortar</div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="logo">${systemName}</span>
            <div class="meta">Campaña: ${campaign.company.name} - ${campaign.number}</div>
          </div>
        </div>
        
        <div class="client-name">Cliente: ${order.client.name}</div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th style="text-align: left; ">Producto</th>
              <th style="text-align: center; width: 30px; ">Cant.</th>
              <th style="text-align: right; width: 45px; ">P. Unit</th>
              <th style="text-align: right; width: 50px; ">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        
        <div class="totals-section">
          <div class="totals-box">
            <div class="total-row" style="color: #71717a;">
              <span>Subtotal:</span>
              <span style="font-family: monospace;">S/ ${subtotal.toFixed(2)}</span>
            </div>

            ${order.discount > 0
          ? `
              <div class="total-row" style="color: #ef4444;">
                <span>Descuento:</span>
                <span style="font-family: monospace;">-S/ ${order.discount.toFixed(2)}</span>
              </div>
            `
          : ""
        }
            <div class="total-row" style="font-weight: 800; color: #be185d; font-size: 11px; margin-top: 2px; border-top: 1px solid #fbcfe8; padding-top: 2px;">
              <span>Total Neto:</span>
              <span style="font-family: monospace;">S/ ${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        ${order.notes
          ? `
          <div class="slip-notes" style="margin-top: 8px; font-size: 8px; color: #4b5563; border-left: 2px solid #be185d; padding-left: 6px; font-style: italic; margin-bottom: 4px; text-align: left;">
            <strong>Nota:</strong> ${order.notes}
          </div>
        `
          : ""
        }
        
        ${order.paymentDate
          ? `
          <div class="payment-date-info">
            Fecha límite de pago: <strong>${formatDateUTC(order.paymentDate)}</strong>
          </div>
        `
          : ""
        }
        
        <div class="thanks-msg">¡Gracias por tu preferencia!</div>
      </div>
    `;
    })
    .join("");

  printDocument.open();
  printDocument.write(`
    <html>
      <head>
        <title>Fichas de Pedidos - Lauren Arica</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { 
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; 
            padding: 10px; 
            margin: 0;
            background-color: #ffffff;
          }
          .slips-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .slip-card {
            border: 2px dashed #be185d;
            border-radius: 12px;
            padding: 16px;
            background: #ffffff;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            font-size: 11px;
            box-sizing: border-box;
          }
          .scissors-icon {
            position: absolute;
            top: -9px;
            right: 15px;
            background: #ffffff;
            padding: 0 4px;
            font-size: 9px;
            font-weight: 700;
            color: #be185d;
            border: 1px solid #fbcfe8;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .logo {
            font-size: 12px;
            font-weight: 850;
            color: #993556;
            margin: 0;
            letter-spacing: -0.3px;
          }
          .meta {
            font-size: 8px;
            color: #71717a;
            margin-top: 1px;
          }
          .client-name {
            font-size: 13px;
            font-weight: 800;
            color: #18181b;
            margin: 6px 0 6px 0;
            padding-bottom: 4px;
            border-bottom: 1.5px solid #f4f4f5;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
          }
          .items-table th {
            font-size: 10px;
            color: #71717a;
            text-transform: uppercase;
            border-bottom: 1.5px solid #f4f4f5;
            padding: 4px;
            font-weight: 800;
            letter-spacing: 0.5px;
          }
          .totals-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            margin-top: 6px;
            font-size: 10px;
          }
          .totals-box {
            width: 130px;
            border-top: 1px dashed #e4e4e7;
            padding-top: 4px;
            line-height: 1.5;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
          }
          .thanks-msg {
            text-align: center;
            font-size: 9px;
            color: #be185d;
            font-weight: 700;
            margin-top: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-top: 1px dashed #fbcfe8;
            padding-top: 8px;
          }
          .payment-date-info {
            text-align: center;
            font-size: 8px;
            color: #be185d;
            font-weight: 800;
            margin-top: 10px;
            background-color: #fdf2f8;
            border: 1px dashed #fbcfe8;
            padding: 4px 6px;
            border-radius: 6px;
            letter-spacing: 0.3px;
          }
          @media print {
            body { 
              padding: 0; 
            }
          }
        </style>
      </head>
      <body>
        <div class="slips-container">
          ${slipsHtml}
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
