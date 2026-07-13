import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { SerializedDirectSaleWithRelations } from "@/types/direct-sale";
import { formatDateTime } from "@/utils/date.utils";

// Initialize vfs fonts for client-side
if (typeof window !== "undefined") {
  const fonts = pdfFonts as any;
  const vfs = fonts?.pdfMake?.vfs || fonts?.vfs;
  if (vfs) {
    (pdfMake as any).vfs = vfs;
  }
}

export function generatePdfDirectSale(
  sale: SerializedDirectSaleWithRelations,
  systemName: string,
) {
  if (typeof window === "undefined") return;

  const calculatedSubtotal = sale.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  // Construir las filas de productos
  const tableBody: any[] = [
    [
      { text: "CÓD. PRODUCTO", style: "tableHeader" },
      { text: "DESCRIPCIÓN DEL PRODUCTO", style: "tableHeader" },
      { text: "CANT.", style: "tableHeader", alignment: "center" },
      { text: "P. UNITARIO", style: "tableHeader", alignment: "right" },
      { text: "SUBTOTAL", style: "tableHeader", alignment: "right" },
    ],
  ];

  sale.items.forEach((item) => {
    tableBody.push([
      { text: item.product.code || "-", style: "tableCell" },
      {
        stack: [
          { text: item.product.name, bold: true, fontSize: 10, color: "#18181b" },
          {
            text: `${item.product.brand.name} • ${item.product.category.name}`,
            fontSize: 8,
            color: "#71717a",
            margin: [0, 2, 0, 0],
          },
        ],
        margin: [0, 2, 0, 2],
      },
      { text: item.quantity.toString(), style: "tableCell", alignment: "center" },
      { text: `S/ ${item.unitPrice.toFixed(2)}`, style: "tableCell", alignment: "right" },
      { text: `S/ ${(item.quantity * item.unitPrice).toFixed(2)}`, style: "tableCell", alignment: "right", bold: true },
    ]);
  });

  // Totales de la venta
  const totalsTableBody = [
    [
      { text: "SUBTOTAL:", style: "totalLabel" },
      { text: `S/ ${calculatedSubtotal.toFixed(2)}`, style: "totalValue" },
    ],
  ];

  if (sale.discount > 0) {
    totalsTableBody.push([
      { text: "DESCUENTO:", style: "totalLabelDiscount" },
      { text: `-S/ ${sale.discount.toFixed(2)}`, style: "totalValueDiscount" },
    ]);
  }

  totalsTableBody.push([
    { text: "TOTAL NETO:", style: "totalLabelNet" },
    { text: `S/ ${sale.total.toFixed(2)}`, style: "totalValueNet" },
  ]);

  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    content: [
      // HEADER SECTION
      {
        columns: [
          // Logo & Name
          {
            stack: [
              { text: systemName, style: "logoText" },
              { text: "CONTROL DE VENTAS", style: "logoSubtext" },
            ],
            width: "*",
          },
          // Boleta Box
          {
            table: {
              widths: [180],
              body: [
                [
                  {
                    stack: [
                      { text: "VENTA DIRECTA", style: "invoiceBoxTitle" },
                      { text: `N° DS-${sale.id.toString().padStart(6, "0")}`, style: "invoiceBoxNumber" },
                    ],
                    alignment: "center",
                    margin: [10, 8, 10, 8],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1.5,
              vLineWidth: () => 1.5,
              hLineColor: () => "#db2777",
              vLineColor: () => "#db2777",
              fillColor: () => "#fdf2f8",
            },
            width: "auto",
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // DETAILS SECTION
      {
        columns: [
          // Client Info
          {
            stack: [
              {
                text: [
                  { text: "CLIENTE: ", style: "detailLabel" },
                  { text: sale.client.name, style: "detailValue" },
                ],
                margin: [0, 2, 0, 2],
              },
              {
                text: [
                  { text: "TELÉFONO: ", style: "detailLabel" },
                  { text: sale.client.phone || "No especificado", style: "detailValue" },
                ],
                margin: [0, 2, 0, 2],
              },
            ],
            width: "55%",
          },
          // Emit Info
          {
            stack: [
              {
                text: [
                  { text: "F. EMISIÓN: ", style: "detailLabel" },
                  { text: formatDateTime(sale.createdAt), style: "detailValue" },
                ],
                margin: [0, 2, 0, 2],
              },
            ],
            width: "45%",
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // ITEMS TABLE
      {
        table: {
          headerRows: 1,
          widths: [80, "*", 45, 80, 80],
          body: tableBody,
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1.5 : 0.5,
          vLineWidth: () => 0,
          hLineColor: () => "#e4e4e7",
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
        margin: [0, 0, 0, 20],
      },

      // FOOTER/SUMMARY SECTION
      {
        columns: [
          // Notes
          {
            stack: sale.notes
              ? [
                {
                  table: {
                    widths: ["*"],
                    body: [
                      [
                        {
                          stack: [
                            { text: "OBSERVACIONES:", bold: true, fontSize: 8, color: "#09090b" },
                            { text: sale.notes, italics: true, fontSize: 9, color: "#4b5563", margin: [0, 4, 0, 0] },
                          ],
                          margin: [10, 8, 10, 8],
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: (i: number) => i === 0 ? 3 : 0.5, // Left thick border
                    hLineColor: () => "#e4e4e7",
                    vLineColor: (i: number) => i === 0 ? "#db2777" : "#e4e4e7", // Pink left border
                    fillColor: () => "#fafafa",
                  },
                },
              ]
              : [],
            width: "55%",
          },
          // Totals
          {
            table: {
              widths: ["*", "auto"],
              body: totalsTableBody,
            },
            layout: {
              hLineWidth: (i: number, node: any) => {
                if (i === node.table.body.length - 1) return 1; // line before TOTAL NETO
                return 0;
              },
              vLineWidth: () => 0,
              hLineColor: () => "#e4e4e7",
              paddingTop: () => 6,
              paddingBottom: () => 6,
            },
            fillColor: "#fafafa",
            width: "40%",
          },
        ],
        margin: [0, 0, 0, 30],
      },

      // THANK YOU
      {
        table: {
          widths: ["*"],
          body: [
            [
              {
                text: "¡GRACIAS POR SU PREFERENCIA!",
                style: "thankYouText",
                color: "#db2777",
                alignment: "center",
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => "#db2777",
          vLineColor: () => "#db2777",
          hLineStyle: () => ({ dash: { length: 4, space: 3 } }),
          vLineStyle: () => ({ dash: { length: 4, space: 3 } }),
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
      },
    ],
    styles: {
      logoText: {
        fontSize: 22,
        bold: true,
        color: "#993556",
        letterSpacing: -0.5,
      },
      logoSubtext: {
        fontSize: 8,
        color: "#71717a",
        bold: true,
        letterSpacing: 2,
        margin: [0, 2, 0, 0],
      },
      invoiceBoxTitle: {
        fontSize: 10,
        bold: true,
        color: "#db2777",
        letterSpacing: 1.5,
      },
      invoiceBoxNumber: {
        fontSize: 16,
        bold: true,
        color: "#db2777",
        margin: [0, 4, 0, 0],
      },
      detailLabel: {
        fontSize: 10,
        color: "#71717a",
        bold: true,
      },
      detailValue: {
        fontSize: 10,
        color: "#09090b",
        bold: true,
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: "#71717a",
        fillColor: "#f4f4f5",
        margin: [0, 4, 0, 4],
      },
      tableCell: {
        fontSize: 10,
        color: "#18181b",
        margin: [0, 4, 0, 4],
      },
      totalLabel: {
        fontSize: 10,
        color: "#71717a",
        bold: true,
      },
      totalValue: {
        fontSize: 10,
        alignment: "right",
      },
      totalLabelDiscount: {
        fontSize: 10,
        color: "#ef4444",
        bold: true,
      },
      totalValueDiscount: {
        fontSize: 10,
        color: "#ef4444",
        alignment: "right",
      },
      totalLabelNet: {
        fontSize: 12,
        color: "#db2777",
        bold: true,
      },
      totalValueNet: {
        fontSize: 12,
        color: "#db2777",
        bold: true,
        alignment: "right",
      },
      thankYouText: {
        fontSize: 9,
        color: "#a1a1aa",
        alignment: "center",
        bold: true,
        letterSpacing: 2,
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  pdfMake.createPdf(docDefinition).download(`venta_directa_DS-${sale.id.toString().padStart(6, "0")}.pdf`);
}
