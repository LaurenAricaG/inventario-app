import { StockMovement, StockMovementType, StockMovementReason } from "@/generated/prisma";

export type SerializedStockMovement = Omit<
  StockMovement,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    code: string | null;
    brand?: {
      id: number;
      name: string;
    } | null;
    images?: {
      id: number;
      url: string;
      isMain: boolean;
      position: number;
    }[];
  };
  createdBy: {
    id: number;
    name: string;
  };
};

export type { StockMovement, StockMovementType, StockMovementReason };
