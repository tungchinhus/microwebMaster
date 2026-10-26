import { Suspense } from "react";
import { Spinner } from "@/components/ui/misc";
import { AdminOrder } from "./admin-order";

export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminOrder params={params} />
    </Suspense>
  );
}
