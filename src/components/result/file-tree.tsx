"use client";

import { AlertTriangle, ChevronRight, FileCode2, FileJson, FileText, Folder, FolderOpen, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { GeneratedFile } from "@/lib/types";

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  file?: GeneratedFile;
  missing?: boolean;
}

function buildTree(files: GeneratedFile[], missing: string[]): TreeNode {
  const root: TreeNode = { name: "", path: "", children: [] };
  const insert = (path: string, file?: GeneratedFile, isMissing?: boolean) => {
    const parts = path.split("/");
    let node = root;
    parts.forEach((part, i) => {
      const sub = parts.slice(0, i + 1).join("/");
      let child = node.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, path: sub, children: [] };
        node.children.push(child);
      }
      if (i === parts.length - 1) Object.assign(child, { file, missing: isMissing });
      node = child;
    });
  };
  files.forEach((f) => insert(f.path, f));
  missing.forEach((p) => insert(p, undefined, true));
  const sort = (n: TreeNode) => {
    n.children.sort((a, b) => Number(a.children.length === 0) - Number(b.children.length === 0) || a.name.localeCompare(b.name));
    n.children.forEach(sort);
  };
  sort(root);
  return root;
}

function hasMissing(node: TreeNode): boolean {
  return node.missing === true || node.children.some(hasMissing);
}

function FileIcon({ name }: { name: string }) {
  if (name.endsWith(".json")) return <FileJson className="size-4 shrink-0 text-amber-500" />;
  if (/\.(jsx?|tsx?|mjs)$/.test(name)) return <FileCode2 className="size-4 shrink-0 text-sky-500" />;
  return <FileText className="size-4 shrink-0 text-muted-foreground" />;
}

function Node({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selected: string;
  onSelect: (path: string) => void;
}) {
  const isDir = node.children.length > 0;
  // Mở sẵn hai cấp đầu và các thư mục chứa file đang chọn hoặc file bị thiếu.
  const [open, setOpen] = useState(() => depth < 2 || selected.startsWith(node.path + "/") || hasMissing(node));
  const pad = { paddingLeft: depth * 12 + 8 };

  if (isDir) {
    return (
      <li>
        <button type="button" style={pad} onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left hover:bg-muted">
          <ChevronRight className={`size-3.5 shrink-0 transition ${open ? "rotate-90" : ""}`} />
          {open ? <FolderOpen className="size-4 shrink-0 text-primary" /> : <Folder className="size-4 shrink-0 text-primary" />}
          <span className="truncate">{node.name}</span>
        </button>
        {open && (
          <ul>
            {node.children.map((c) => (
              <Node key={c.path} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </li>
    );
  }
  return (
    <li>
      <button
        type="button"
        style={{ paddingLeft: depth * 12 + 26 }}
        onClick={() => onSelect(node.path)}
        className={`flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left ${selected === node.path ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
      >
        {node.missing ? <AlertTriangle className="size-4 shrink-0 text-amber-500" /> : <FileIcon name={node.name} />}
        <span className={`truncate ${node.missing ? "text-amber-600 dark:text-amber-400" : ""}`}>{node.name}</span>
        {node.file?.source === "ai" && <Sparkles className="ml-auto size-3 shrink-0 text-fuchsia-500" aria-label="Do AI viết" />}
      </button>
    </li>
  );
}

export function FileTree({
  files,
  missing,
  selected,
  onSelect,
}: {
  files: GeneratedFile[];
  missing: string[];
  selected: string;
  onSelect: (path: string) => void;
}) {
  const tree = useMemo(() => buildTree(files, missing), [files, missing]);
  return (
    <ul className="font-mono text-xs">
      {tree.children.map((n) => (
        <Node key={n.path} node={n} depth={0} selected={selected} onSelect={onSelect} />
      ))}
    </ul>
  );
}
