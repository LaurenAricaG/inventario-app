import { GenderSegment } from "./models";

export type GenderSegmentWithRelations = GenderSegment & {
  // Espacio para relaciones futuras (ej. Products)
};

export type SerializedGenderSegment = Omit<GenderSegment, "createdAt" | "updatedAt" | "deletedAt"> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
};
