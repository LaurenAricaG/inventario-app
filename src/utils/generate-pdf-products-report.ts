import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { formatDateTime } from "@/utils/date.utils";

// Initialize vfs fonts for client-side
if (typeof window !== "undefined") {
  const fonts = pdfFonts as any;
  const vfs = fonts?.pdfMake?.vfs || fonts?.vfs;
  if (vfs) {
    (pdfMake as any).vfs = vfs;
  }
}

export interface ReportProductItem {
  id: number;
  code: string | null;
  name: string;
  description: string | null;
  price: number;
  catalogPrice: number | null;
  costPrice?: number | null;
  stock: number;
  isAvailable: boolean;
  brand: {
    name: string;
    company: {
      name: string;
    };
  };
  category: {
    name: string;
  };
  genderSegment: {
    name: string;
  } | null;
}

async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generatePdfProductsReport(
  products: ReportProductItem[],
  systemName: string = "Eva's Shop",
  systemLogoUrl?: string | null,
) {
  if (typeof window === "undefined") return;

  let logoBase64: string | null = null;
  if (systemLogoUrl) {
    logoBase64 = await getBase64ImageFromUrl(systemLogoUrl);
  }

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalSaleValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const totalCatalogValue = products.reduce(
    (acc, p) => acc + p.stock * (p.catalogPrice ?? p.price),
    0,
  );

  const nowFormatted = formatDateTime(new Date()) || new Date().toLocaleDateString("es-PE");

  const words = systemName.trim().split(" ");
  const nameFirstPart = words.length > 1 ? words.slice(0, -1).join(" ") + " " : "";
  const nameLastPart = words.length > 1 ? words[words.length - 1] : systemName;

  const brandStack = [
    {
      text: [
        { text: nameFirstPart.toUpperCase(), color: "#18181b", bold: true, fontSize: 13 },
        { text: nameLastPart.toUpperCase(), color: "#993556", bold: true, fontSize: 13 },
      ],
      margin: [0, 0, 0, 2],
    },
    {
      text: "REPORTE GENERAL DE PRODUCTOS E INVENTARIO",
      fontSize: 9,
      bold: true,
      color: "#3f3f46",
    },
    {
      text: `Generado el: ${nowFormatted}`,
      fontSize: 7.5,
      color: "#71717a",
      margin: [0, 2, 0, 0],
    },
  ];

  const leftHeaderContent = logoBase64
    ? {
        columns: [
          {
            image: logoBase64,
            width: 38,
            height: 38,
            margin: [0, 0, 10, 0],
          },
          {
            stack: brandStack,
            width: "*",
          },
        ],
        width: "*",
      }
    : {
        columns: [
          {
            table: {
              widths: [34],
              body: [
                [
                  {
                    text: systemName.charAt(0).toUpperCase(),
                    fontSize: 15,
                    bold: true,
                    color: "#ffffff",
                    fillColor: "#993556",
                    alignment: "center",
                    margin: [0, 7, 0, 7],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
            },
            width: 38,
            margin: [0, 0, 10, 0],
          },
          {
            stack: brandStack,
            width: "*",
          },
        ],
        width: "*",
      };

  // Construir las filas de la tabla de productos
  const tableBody: any[] = [
    [
      { text: "#", style: "tableHeader", alignment: "center" },
      { text: "CÓDIGO", style: "tableHeader", alignment: "center" },
      { text: "CATÁLOGO", style: "tableHeader" },
      { text: "PRODUCTO / DESCRIPCIÓN", style: "tableHeader" },
      { text: "CATEGORÍA / GÉNERO", style: "tableHeader" },
      { text: "P. CATÁLOGO", style: "tableHeader", alignment: "right" },
      { text: "P. VENTA", style: "tableHeader", alignment: "right" },
      { text: "STOCK", style: "tableHeader", alignment: "center" },
      { text: "ESTADO", style: "tableHeader", alignment: "center" },
    ],
  ];

  products.forEach((product, idx) => {
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? "#ffffff" : "#fdf8fa";

    const genderText = product.genderSegment?.name || "Todos / Unisex";
    const categoryGender = `${product.category.name} • ${genderText}`;

    tableBody.push([
      { text: (idx + 1).toString(), style: "tableCell", alignment: "center", fillColor: rowBg },
      {
        text: product.code || "S/C",
        style: "tableCellCode",
        alignment: "center",
        fillColor: rowBg,
      },
      {
        text: product.brand.name,
        style: "tableCellBold",
        fillColor: rowBg,
      },
      {
        stack: [
          { text: product.name, bold: true, fontSize: 8.5, color: "#18181b" },
          product.description
            ? {
                text: product.description,
                fontSize: 7,
                color: "#71717a",
                margin: [0, 1, 0, 0],
              }
            : { text: "" },
        ],
        fillColor: rowBg,
      },
      {
        text: categoryGender,
        style: "tableCellMuted",
        fillColor: rowBg,
      },
      {
        text: product.catalogPrice
          ? `S/ ${product.catalogPrice.toFixed(2)}`
          : "-",
        style: "tableCellMuted",
        alignment: "right",
        fillColor: rowBg,
      },
      {
        text: `S/ ${product.price.toFixed(2)}`,
        style: "tableCellPrice",
        alignment: "right",
        fillColor: rowBg,
      },
      {
        text: product.stock.toString(),
        style: "tableCellBold",
        alignment: "center",
        fillColor: rowBg,
      },
      {
        text: product.stock > 0 && product.isAvailable ? "En Stock" : "Agotado",
        style:
          product.stock > 0 && product.isAvailable
            ? "badgeInStock"
            : "badgeOutOfStock",
        alignment: "center",
        fillColor: rowBg,
      },
    ]);
  });

  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 30, 30, 35],
    footer: (currentPage: number, pageCount: number) => {
      return {
        columns: [
          {
            text: `${systemName} • Reporte de Inventario de Productos`,
            fontSize: 7.5,
            color: "#a1a1aa",
            margin: [30, 10, 0, 0],
          },
          {
            text: `Página ${currentPage} de ${pageCount}`,
            alignment: "right",
            fontSize: 7.5,
            color: "#a1a1aa",
            margin: [0, 10, 30, 0],
          },
        ],
      };
    },
    content: [
      // 1. HEADER SECTION
      {
        columns: [
          leftHeaderContent,
          // Summary KPI Mini Box
          {
            table: {
              widths: [80, 80, 95, 95],
              body: [
                [
                  {
                    text: "TOTAL PRODUCTOS",
                    style: "kpiLabel",
                    alignment: "center",
                  },
                  {
                    text: "STOCK FÍSICO",
                    style: "kpiLabel",
                    alignment: "center",
                  },
                  {
                    text: "VALOR CATÁLOGO",
                    style: "kpiLabel",
                    alignment: "center",
                  },
                  {
                    text: "VALOR VENTA",
                    style: "kpiLabel",
                    alignment: "center",
                  },
                ],
                [
                  {
                    text: totalProducts.toString(),
                    style: "kpiValue",
                    alignment: "center",
                  },
                  {
                    text: `${totalStock} un.`,
                    style: "kpiValue",
                    alignment: "center",
                  },
                  {
                    text: `S/ ${totalCatalogValue.toFixed(2)}`,
                    style: "kpiValue",
                    alignment: "center",
                  },
                  {
                    text: `S/ ${totalSaleValue.toFixed(2)}`,
                    style: "kpiValuePink",
                    alignment: "center",
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 1,
              hLineColor: () => "#f472b6",
              vLineColor: () => "#f472b6",
              fillColor: (rowIndex: number) =>
                rowIndex === 0 ? "#fdf2f7" : "#ffffff",
            },
            width: "auto",
          },
        ],
        margin: [0, 0, 0, 15],
      },

      // 2. PRODUCT TABLE
      {
        table: {
          headerRows: 1,
          widths: [20, 50, 75, "*", 110, 65, 65, 45, 55],
          body: tableBody,
        },
        layout: {
          hLineWidth: (i: number, node: any) =>
            i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => "#e4e4e7",
          vLineColor: () => "#f4f4f5",
        },
      },
    ],
    styles: {
      kpiLabel: {
        fontSize: 6.5,
        bold: true,
        color: "#831843",
        margin: [2, 3, 2, 2],
      },
      kpiValue: {
        fontSize: 9.5,
        bold: true,
        color: "#18181b",
        margin: [2, 2, 2, 3],
      },
      kpiValuePink: {
        fontSize: 9.5,
        bold: true,
        color: "#993556",
        margin: [2, 2, 2, 3],
      },
      tableHeader: {
        fontSize: 7.5,
        bold: true,
        color: "#ffffff",
        fillColor: "#993556",
        margin: [0, 5, 0, 5],
      },
      tableCell: {
        fontSize: 8,
        color: "#3f3f46",
        margin: [0, 3, 0, 3],
      },
      tableCellCode: {
        fontSize: 7.5,
        color: "#71717a",
        margin: [0, 3, 0, 3],
      },
      tableCellBold: {
        fontSize: 8,
        bold: true,
        color: "#18181b",
        margin: [0, 3, 0, 3],
      },
      tableCellMuted: {
        fontSize: 7.5,
        color: "#52525b",
        margin: [0, 3, 0, 3],
      },
      tableCellPrice: {
        fontSize: 8,
        bold: true,
        color: "#993556",
        margin: [0, 3, 0, 3],
      },
      badgeInStock: {
        fontSize: 7.5,
        bold: true,
        color: "#15803d",
        margin: [0, 3, 0, 3],
      },
      badgeOutOfStock: {
        fontSize: 7.5,
        bold: true,
        color: "#b91c1c",
        margin: [0, 3, 0, 3],
      },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  const cleanDate = new Date().toISOString().slice(0, 10);
  pdfMake.createPdf(docDefinition).download(`reporte_productos_${cleanDate}.pdf`);
}
