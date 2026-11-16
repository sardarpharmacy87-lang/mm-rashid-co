import { ProductCatalogue, type CataloguePageProps } from "@/components/product-catalogue";

export const metadata = {
  title: "Our craft",
  description: "Explore products from the MM Rashid & Co. workshop.",
};

export default function CraftPage(props: CataloguePageProps) {
  return <ProductCatalogue {...props} basePath="/capabilities" title="Our craft" />;
}
