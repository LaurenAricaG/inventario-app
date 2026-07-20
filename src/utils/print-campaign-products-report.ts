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
  substitute?: {
    productName: string;
  } | null;
  brand: { name: string };
}

interface PrintOrder {
  id: number;
  status: string;
  items: PrintItem[];
}

const groupStatusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  RECEIVED: "Completo",
  MISSING: "Faltó",
  SUBSTITUTED: "Sustituido",
  INCOMPLETE: "Incompleto",
};

const groupStatusBadgeStyles: Record<string, string> = {
  PENDING:
    "background-color: #fefbeb; color: #b45309; border: 1px solid #fde68a;",
  RECEIVED:
    "background-color: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;",
  MISSING:
    "background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca;",
  SUBSTITUTED:
    "background-color: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd;",
  INCOMPLETE:
    "background-color: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8;",
};

export function printCampaignProductsReport(
  campaign: PrintCampaign,
  orders: PrintOrder[],
  systemName: string,
  systemLogoUrl?: string | null,
) {
  if (typeof window === "undefined") return;

  let iframe = document.getElementById(
    "print-campaign-products-iframe",
  ) as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "print-campaign-products-iframe";
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    document.body.appendChild(iframe);
  }

  const printDocument = iframe.contentWindow?.document;
  if (!printDocument) return;

  // Consolidar productos
  const groupedProductsMap = new Map<
    string,
    {
      productName: string;
      productCode: string | null;
      brandName: string;
      catalogPrice: number;
      totalQuantity: number;       // cantidad pedida total
      arrivedQuantity: number;     // cantidad que efectivamente llegó (excluye MISSING)
      substituteName: string | null; // nombre del sustituto (si aplica)
      items: {
        arrivalStatus: string;
        orderStatus: string;
      }[];
    }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = `${item.brand.name}-${item.productName}-${item.productCode || ""}-${item.catalogPrice}`;
      if (!groupedProductsMap.has(key)) {
        groupedProductsMap.set(key, {
          productName: item.productName,
          productCode: item.productCode,
          brandName: item.brand.name,
          catalogPrice: item.catalogPrice,
          totalQuantity: 0,
          arrivedQuantity: 0,
          substituteName: null,
          items: [],
        });
      }
      const group = groupedProductsMap.get(key)!;
      group.totalQuantity += item.quantity;
      // Solo cuenta las unidades que llegaron (no las MISSING)
      if (item.arrivalStatus !== "MISSING") {
        group.arrivedQuantity += item.quantity;
      }
      // Guardar el nombre del sustituto si este item fue sustituido
      if (item.arrivalStatus === "SUBSTITUTED" && item.substitute?.productName && !group.substituteName) {
        group.substituteName = item.substitute.productName;
      }
      group.items.push({
        arrivalStatus: item.arrivalStatus,
        orderStatus: order.status,
      });
    });
  });

  const groupedProducts = Array.from(groupedProductsMap.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName),
  );

  const getGroupStatus = (groupItems: { arrivalStatus: string }[]) => {
    if (groupItems.length === 0) return "PENDING";
    const statuses = groupItems.map((i) => i.arrivalStatus);
    if (statuses.every((s) => s === "RECEIVED")) return "RECEIVED";
    if (statuses.every((s) => s === "MISSING")) return "MISSING";
    if (statuses.every((s) => s === "SUBSTITUTED")) return "SUBSTITUTED";
    if (statuses.every((s) => s === "PENDING")) return "PENDING";
    return "INCOMPLETE";
  };

  let totalUnits = 0;
  let totalConsolidatedValue = 0;

  const productRows = groupedProducts
    .map((p) => {
      const status = getGroupStatus(p.items);
      const statusText = groupStatusTranslations[status] || status;
      const badgeStyle =
        groupStatusBadgeStyles[status] ||
        "background-color: #f4f4f5; color: #52525b; border: 1px solid #e4e4e7;";

      // Acumular solo las unidades que llegaron (excluye MISSING)
      totalUnits += p.arrivedQuantity;
      totalConsolidatedValue += p.arrivedQuantity * p.catalogPrice;

      // --- Columna PRODUCTO ---
      // SUSTITUIDO: nombre del sustituto (lo que llegó) arriba
      //             + (nombre original, lo que no llegó) abajo en gris
      const productDisplay =
        status === "SUBSTITUTED" && p.substituteName
          ? `${p.substituteName}<br/><span style="color:#71717a; font-size:9.5px; font-style:italic;">(${p.productName})</span>`
          : p.productName;

      // --- Columna CANTIDAD ---
      // FALTÓ: solo muestra la cantidad pedida (sin "0 u." confuso)
      // INCOMPLETO: cantidad llegada arriba, (ped. X) abajo en línea aparte
      let quantityDisplay: string;
      if (status === "MISSING") {
        quantityDisplay = `${p.totalQuantity} u.`;
      } else if (p.arrivedQuantity !== p.totalQuantity) {
        quantityDisplay = `${p.arrivedQuantity} u.<br/><span style="color:#71717a; font-size:10px; font-weight:400;">(ped. ${p.totalQuantity})</span>`;
      } else {
        quantityDisplay = `${p.totalQuantity} u.`;
      }

      return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; font-family: monospace; font-size: 11px; color: #18181b;">${p.productCode || "-"}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; color: #52525b; font-size: 11px;">${p.brandName}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; font-weight: 600; color: #18181b; font-size: 11.5px;">${productDisplay}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; text-align: center; font-weight: 700; color: #be185d; font-size: 12px; line-height: 1.6;">${quantityDisplay}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; font-family: monospace; color: #52525b; font-size: 11px;">S/ ${p.catalogPrice.toFixed(2)}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; text-align: right; font-family: monospace; font-weight: 700; color: #18181b; font-size: 11px;">
          S/ ${(p.arrivedQuantity * p.catalogPrice).toFixed(2)}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; text-align: center; font-size: 10px;">
          <span style="font-weight: 700; padding: 3px 8px; border-radius: 9999px; text-transform: uppercase; ${badgeStyle}">
            ${statusText}
          </span>
        </td>
      </tr>
    `;
    })
    .join("");

  const formatSystemName = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length <= 1) {
      return `<span style="color: #b53f66; font-weight: 800;">${name}</span>`;
    }
    const lastWord = words.pop();
    const restOfWords = words.join(" ");
    return `<span style="color: #2c2c2a; font-weight: 800;">${restOfWords}</span> <span style="color: #b53f66; font-weight: 800;">${lastWord}</span>`;
  };

  printDocument.open();
  printDocument.write(`
    <html>
      <head>
        <title>Consolidado Productos - Campaña ${campaign.number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body { 
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; 
            padding: 30px; 
            color: #18181b; 
            background-color: #fafafa;
          }
          .summary-container {
            max-width: 900px;
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
            line-height: 1.1;
            letter-spacing: -0.5px;
          }
          h2 { 
           font-size: 8px;
           color: #71717a;
           text-transform: uppercase;
           letter-spacing: 2px;
           margin-top: 4px;
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
            <div style="display: flex; align-items: center; gap: 12px;">
              ${systemLogoUrl ? `<img src="${systemLogoUrl}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1.5px solid #fbcfe8;" />` : ""}
              <div>
                <h1>${formatSystemName(systemName)}</h1>
                <h2>Reporte de Productos Consolidado</h2>
              </div>
            </div>
            <div class="header-meta">
              <strong>Campaña:</strong> ${campaign.company.name} - ${campaign.number}<br/>
              <strong>Variedad de Productos:</strong> ${groupedProducts.length}<br/>
              <strong>Total Unidades:</strong> ${totalUnits}<br/>
              <span class="consolidated-badge">
                Valor Total: S/ ${totalConsolidatedValue.toFixed(2)}
              </span>
            </div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 14px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="text-align: left; color: #71717a; border-bottom: 1px solid #be185d; background: #fdf2f8; font-size: 10px;">
                  <th style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Código</th>
                  <th style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Marca</th>
                  <th style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Producto</th>
                  <th style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Cantidad</th>
                  <th style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">P. Unitario</th>
                  <th style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Total Catálogo</th>
                  <th style="padding: 10px 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">Estado</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>
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
