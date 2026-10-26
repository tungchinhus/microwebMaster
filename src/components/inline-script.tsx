/** Script chạy đồng bộ trước lần vẽ đầu tiên (xem hướng dẫn "Preventing Flash" của Next.js). */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
