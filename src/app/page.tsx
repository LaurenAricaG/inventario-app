import { prisma } from "@/lib/prisma";
import CatalogPortalClient from "@/components/catalog/CatalogPortalClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo Público de Productos",
  description: "Explora nuestro catálogo de productos Natura & Avon, consulta stock y haz tus pedidos directo por WhatsApp.",
};

export default async function Page() {
  const systemConfig = await prisma.systemConfig.findFirst({
    where: { lock: true },
  });

  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      deletedAt: null,
    },
    include: {
      brand: {
        include: {
          company: true,
        },
      },
      category: true,
      genderSegment: true,
      images: {
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serializar modelos para que se puedan enviar de un Server Component a un Client Component (sin objetos Date)
  const serializedProducts = products.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    brand: {
      id: product.brand.id,
      name: product.brand.name,
      company: {
        id: product.brand.company.id,
        name: product.brand.company.name,
      },
    },
    category: {
      id: product.category.id,
      name: product.category.name,
    },
    genderSegment: product.genderSegment
      ? {
          id: product.genderSegment.id,
          name: product.genderSegment.name,
        }
      : null,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      position: img.position,
      isMain: img.isMain,
    })),
  }));

  const serializedConfig = systemConfig
    ? {
        systemName: systemConfig.systemName,
        systemLogoUrl: systemConfig.systemLogoUrl,
        whatsappNumber: systemConfig.whatsappNumber,
        showPricePublic: systemConfig.showPricePublic,
        showStockPublic: systemConfig.showStockPublic,
        showCatalogsPublic: systemConfig.showCatalogsPublic,
      }
    : null;

  return (
    <CatalogPortalClient
      products={serializedProducts}
      systemConfig={serializedConfig}
    />
  );
}
