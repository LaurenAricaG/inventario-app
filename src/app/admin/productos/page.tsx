import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Products from "@/components/products";

export const metadata = {
  title: "Productos",
};

interface ProductosPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductosPage(props: ProductosPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("products:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros de búsqueda
  const whereClause = {
    deletedAt: null,
    ...(search
      ? {
          name: { contains: search, mode: "insensitive" as const },
        }
      : {}),
  };

  const [products, totalItems, overallCount, genders, categories, brands] =
    await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          price: true,
          costPrice: true,
          stock: true,
          isAvailable: true,
          brandId: true,
          categoryId: true,
          genderSegmentId: true,
          genderSegment: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              isMain: true,
              position: true,
            },
            orderBy: { position: "asc" },
          },
        },
        take: limit,
        skip: skip,
        orderBy: { id: "asc" },
      }),
      prisma.product.count({
        where: whereClause,
      }),
      prisma.product.count({
        where: { deletedAt: null },
      }),
      prisma.genderSegment.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.brand.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

  const totalPages = Math.ceil(totalItems / limit);
  return (
    <Products
      initialProducts={JSON.parse(JSON.stringify(products))}
      genders={genders}
      categories={categories}
      brands={brands}
      overallCount={overallCount}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      permissions={permissions}
    />
  );
}
