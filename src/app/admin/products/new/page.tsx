import { PageHeader } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="Thêm sản phẩm" />
      <ProductForm />
    </div>
  );
}
