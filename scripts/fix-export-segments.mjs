// Sửa tên file prefetch của bản xuất tĩnh khi build trên Windows.
//
// Next ghi file segment theo tên "__next" + đường dẫn segment đổi "/" thành ".",
// nhưng trên Windows đường dẫn dùng "\" nên file bị ghi vào thư mục con
// (out/kho/__next.kho/__PAGE__.txt) thay vì out/kho/__next.kho.__PAGE__.txt.
// Trình duyệt xin tên có dấu chấm nên nhận 404 mỗi lần prefetch link.
// Script này gom các file trong thư mục con về đúng tên. Build trên Linux/macOS thì không có gì để làm.

import { existsSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";

if (process.env.STATIC_EXPORT !== "1") process.exit(0);

const OUT = "out";
if (!existsSync(OUT)) process.exit(0);

let fixed = 0;

function filesUnder(dir, prefix = "") {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? filesUnder(full, `${prefix}${name}.`) : [{ full, flat: `${prefix}${name}` }];
  });
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const f of filesUnder(full)) {
        copyFileSync(f.full, join(dir, `${name}.${f.flat}`));
        fixed++;
      }
      rmSync(full, { recursive: true, force: true });
    } else {
      walk(full);
    }
  }
}

walk(OUT);
if (fixed) console.log(`fix-export-segments: đã đổi tên ${fixed} file prefetch trong ${OUT}/`);
