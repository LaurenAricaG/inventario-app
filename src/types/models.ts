import {
  Product,
  Brand,
  Category,
  GenderSegment,
  CampaignOrder,
  Client,
  Campaign,
  CampaignOrderItem,
  DirectSale,
  DirectSaleItem,
  Payment,
  ExternalDebt,
  Company,
  CatalogPdf,
  User,
  Role,
  ProductImage,
  Permission,
} from "@/generated/prisma";

// ============================================================
// RELATIONAL TYPES
// ============================================================

export type BrandWithCompany = Brand & {
  company: Company;
};

export type CampaignWithCompany = Campaign & {
  company: Company;
};

export type CatalogPdfWithRelations = CatalogPdf & {
  campaign: CampaignWithCompany;
  brand: BrandWithCompany;
};

export type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  genderSegment?: GenderSegment | null;
  images: ProductImage[];
};

export type CampaignOrderWithRelations = CampaignOrder & {
  client: Client;
  campaign: Campaign;
  items: (CampaignOrderItem & {
    brand: Brand;
  })[];
};

export type DirectSaleWithRelations = DirectSale & {
  client: Client;
  items: (DirectSaleItem & {
    product: ProductWithRelations;
  })[];
};

export type ClientWithRelations = Client & {
  campaignOrders?: CampaignOrder[];
  directSales?: DirectSale[];
  payments?: Payment[];
  externalDebts?: ExternalDebt[];
};

export type UserWithRole = User & {
  role: Role;
};
export type { Product, Brand, Category, GenderSegment, CampaignOrder, Client, Campaign, CampaignOrderItem, DirectSale, DirectSaleItem, Payment, ExternalDebt, Company, CatalogPdf, User, Role, ProductImage, Permission };
