function escapeHtml(value: string): string {
  // Escapes quotes too — runs before inline(), so a URL can't break out of href="...".
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(value: string): string {
  return value
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-text hover:underline">$1</a>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-canvas-bg px-1 py-0.5 font-mono text-[0.85em]">$1</code>'
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

/**
 * Compact, escape-first Markdown → HTML for AI-generated docs (headings, lists,
 * fenced code, inline code, bold, safe links). Returns Designrift-styled HTML.
 */
export function renderMarkdown(markdown: string): string {
  const lines = escapeHtml(markdown).split("\n");
  const html: string[] = [];
  const code: string[] = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;

  const closeLists = () => {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(
          `<pre class="my-3 overflow-x-auto rounded-lg bg-canvas-bg-subtle p-3 text-xs text-canvas-text-contrast"><code>${code.join("\n")}</code></pre>`
        );
        code.length = 0;
        inCode = false;
      } else {
        closeLists();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }

    const text = line.trim();
    if (!text) {
      closeLists();
      continue;
    }

    const heading = text.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeLists();
      const level = Math.min(heading[1].length, 4);
      const cls =
        heading[1].length <= 2
          ? "mt-5 mb-2 text-lg font-semibold text-canvas-text-contrast"
          : "mt-4 mb-1 text-base font-semibold text-canvas-text-contrast";
      html.push(`<h${level} class="${cls}">${inline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = text.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push('<ul class="my-2 list-disc space-y-1 pl-5 text-canvas-text-contrast">');
        inUl = true;
      }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    const ordered = text.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push('<ol class="my-2 list-decimal space-y-1 pl-5 text-canvas-text-contrast">');
        inOl = true;
      }
      html.push(`<li>${inline(ordered[1])}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p class="my-2 leading-relaxed text-canvas-text-contrast">${inline(text)}</p>`);
  }

  if (inCode) {
    html.push(
      `<pre class="my-3 overflow-x-auto rounded-lg bg-canvas-bg-subtle p-3 text-xs text-canvas-text-contrast"><code>${code.join("\n")}</code></pre>`
    );
  }
  closeLists();
  return html.join("");
}
