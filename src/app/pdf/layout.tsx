import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogos Digitales en PDF | Lauren Arica",
  description:
    "Consulta y descarga los catálogos en PDF de la campaña activa para Natura, Avon y Belcorp (Ésika, L'Bel, Cyzone). Realiza tus pedidos directo por WhatsApp.",
};

export default function CatalogoPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
