import { ProductCatalogue, type CataloguePageProps } from "@/components/product-catalogue";

export const metadata = {
  title: "Products",
  description: "Browse our published products and request a quotation.",
};

export default function ProductsPage(props: CataloguePageProps) {
  return <ProductCatalogue {...props} />;
}
