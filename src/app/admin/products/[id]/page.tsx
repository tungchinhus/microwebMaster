import { Suspense } from "react";
import { Spinner } from "@/components/ui/misc";
import { EditProduct } from "./edit-product";

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      <EditProduct params={params} />
    </Suspense>
  );
}
