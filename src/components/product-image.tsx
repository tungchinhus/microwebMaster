import Image from "next/image";
import { ImageOff } from "lucide-react";

/** Ảnh sản phẩm: tối ưu ảnh Firebase Storage, ảnh ngoài hiển thị nguyên bản. */
export function ProductImage({
  src,
  alt,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex size-full items-center justify-center bg-muted text-muted-foreground ${className}`}>
        <ImageOff className="size-8" />
      </div>
    );
  }
  const optimizable = src.startsWith("https://firebasestorage.googleapis.com/");
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!optimizable}
      className={`object-cover ${className}`}
    />
  );
}
