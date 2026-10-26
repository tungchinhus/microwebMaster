import { Suspense } from "react";
import { Spinner } from "@/components/ui/misc";
import { OrderView } from "./order-view";

export default function OrderPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      <OrderView params={params} />
    </Suspense>
  );
}
