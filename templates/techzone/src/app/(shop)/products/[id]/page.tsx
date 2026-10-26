import { Suspense } from "react";
import { Spinner } from "@/components/ui/misc";
import { ProductDetail } from "./product-detail";

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
