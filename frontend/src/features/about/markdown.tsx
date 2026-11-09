import type { ReactNode } from "react";

export type AboutBodyBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string };

export function parseAboutBody(body: string): AboutBodyBlock[] {
  return body
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const heading = /^(#{1,3})\s+([\s\S]+)$/.exec(block);
      if (heading) {
        return {
          type: "heading" as const,
          level: heading[1].length as 1 | 2 | 3,
          text: heading[2].replace(/\r?\n/g, " ").trim(),
        };
      }

      return {
        type: "paragraph" as const,
        text: block.replace(/\r?\n/g, " ").trim(),
      };
    });
}

export function renderAboutInline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}
