import { GoogleApiError, googleFetch, type ApiOptions } from "./google-api";

const HOSTING = "https://firebasehosting.googleapis.com/v1beta1";

interface Site {
  name: string;
  defaultUrl: string;
  type?: string;
}

/** Site Hosting mặc định của project; tạo mới (siteId = projectId) nếu chưa có. */
export async function getDefaultSite(projectId: string, opts: ApiOptions): Promise<Site> {
  const data = await googleFetch<{ sites?: Site[] }>(`${HOSTING}/projects/${projectId}/sites`, opts);
  const site = data.sites?.find((s) => s.type === "DEFAULT_SITE") ?? data.sites?.[0];
  if (site) return site;
  return googleFetch<Site>(`${HOSTING}/projects/${projectId}/sites?siteId=${projectId}`, opts, { method: "POST", json: {} });
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface DeployProgress {
  uploaded: number;
  total: number;
}

/**
 * Deploy theo Firebase Hosting REST API: tạo version, khai báo hash các file (gzip + SHA-256),
 * tải lên những file Hosting chưa có, chốt version rồi release.
 */
export async function deployToHosting(
  siteName: string,
  files: Map<string, Uint8Array>,
  opts: ApiOptions,
  onProgress?: (p: DeployProgress) => void,
): Promise<{ version: string }> {
  const version = await googleFetch<{ name: string }>(`${HOSTING}/${siteName}/versions`, opts, {
    method: "POST",
    json: {
      config: {
        // Website là SPA: mọi đường dẫn trả về index.html để React Router xử lý.
        rewrites: [{ glob: "**", path: "/index.html" }],
        headers: [
          { glob: "/vendor/**", headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
          { glob: "/assets/**", headers: { "Cache-Control": "public, max-age=300" } },
        ],
      },
    },
  });

  const byHash = new Map<string, Uint8Array>();
  const manifest: Record<string, string> = {};
  for (const [path, bytes] of files) {
    const gz = await gzip(bytes);
    const hash = await sha256Hex(gz);
    manifest[path] = hash;
    byHash.set(hash, gz);
  }

  const populated = await googleFetch<{ uploadRequiredHashes?: string[]; uploadUrl: string }>(
    `${HOSTING}/${version.name}:populateFiles`,
    opts,
    { method: "POST", json: { files: manifest } },
  );
  const required = populated.uploadRequiredHashes ?? [];
  let uploaded = 0;
  onProgress?.({ uploaded, total: required.length });

  const queue = [...required];
  await Promise.all(
    Array.from({ length: Math.min(4, queue.length) }, async () => {
      while (queue.length) {
        const hash = queue.shift()!;
        const body = byHash.get(hash);
        if (!body) throw new GoogleApiError(`Hosting yêu cầu file không có (${hash.slice(0, 8)}).`, 400);
        await googleFetch(`${populated.uploadUrl}/${hash}`, opts, {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: body as BodyInit,
        });
        onProgress?.({ uploaded: ++uploaded, total: required.length });
      }
    }),
  );

  await googleFetch(`${HOSTING}/${version.name}?update_mask=status`, opts, {
    method: "PATCH",
    json: { status: "FINALIZED" },
  });
  await googleFetch(`${HOSTING}/${siteName}/releases?versionName=${encodeURIComponent(version.name)}`, opts, {
    method: "POST",
    json: { message: "Deploy từ Web Master" },
  });
  return { version: version.name };
}
