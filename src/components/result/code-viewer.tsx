"use client";

import { Highlight, themes } from "prism-react-renderer";
import { useSyncExternalStore } from "react";

const LANGUAGES: Record<string, string> = {
  js: "jsx",
  jsx: "jsx",
  mjs: "javascript",
  ts: "tsx",
  tsx: "tsx",
  json: "json",
  css: "css",
  html: "markup",
  svg: "markup",
  md: "markdown",
  rules: "javascript",
  yml: "yaml",
  yaml: "yaml",
};

export function languageFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGES[ext] ?? "plain";
}

function subscribeDark(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function CodeViewer({ path, code }: { path: string; code: string }) {
  const dark = useSyncExternalStore(subscribeDark, () => window.matchMedia("(prefers-color-scheme: dark)").matches, () => false);
  return (
    <Highlight code={code.replace(/\n$/, "")} language={languageFor(path)} theme={dark ? themes.oneDark : themes.oneLight}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={`${className} overflow-auto p-4 text-[12.5px] leading-relaxed`} style={{ ...style, background: "transparent" }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="table-row">
              <span className="table-cell select-none pr-4 text-right text-muted-foreground/50">{i + 1}</span>
              <span className="table-cell whitespace-pre">
                {line.map((token, k) => (
                  <span key={k} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
