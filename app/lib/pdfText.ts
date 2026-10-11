// Reads the text out of a PDF, inside the browser. Nothing is uploaded here.

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist")
      .then((mod) => {
        // the helper file is served from our own site (public folder)
        mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        return mod;
      })
      .catch((err) => {
        pdfjsPromise = null;
        throw err;
      });
  }
  return pdfjsPromise;
}

// Returns the text of every page, one string per page.
export async function extractPdfText(file: File): Promise<string[]> {
  const pdfjs = await loadPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const task = pdfjs.getDocument({ data });

  try {
    const doc = await task.promise;
    const pages: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();

      let text = "";
      for (const item of content.items) {
        if ("str" in item) {
          text += item.str;
          if (item.hasEOL) text += "\n";
        }
      }

      pages.push(
        text
          .replace(/[ \t]+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim()
      );
      page.cleanup();
    }
    return pages;
  } finally {
    void task.destroy();
  }
}

// Keeps whole pages until the character limit is reached, and says clearly
// when something was left out, so nothing is cut silently.
export function capPages(pages: string[], maxChars: number) {
  const included: string[] = [];
  let used = 0;

  for (const page of pages) {
    if (included.length > 0 && used + page.length > maxChars) break;
    included.push(page);
    used += page.length;
  }

  let text = included.join("\n\n");
  const cutInsidePage = text.length > maxChars;
  if (cutInsidePage) text = text.slice(0, maxChars);

  let note: string | null = null;
  if (included.length < pages.length) {
    note = `Only the first ${included.length} of ${pages.length} pages were processed.`;
  } else if (cutInsidePage) {
    note = "This document is very long, so only the first part was processed.";
  }

  return { text, includedPages: included.length, totalPages: pages.length, note };
}

// Splits text into parts of at most maxChars, preferably at line breaks.
export function splitIntoParts(text: string, maxChars: number): string[] {
  const parts: string[] = [];
  let current = "";

  for (const line of text.split("\n")) {
    let rest = line;

    // a single very long line is cut into pieces
    while (rest.length > maxChars) {
      if (current) {
        parts.push(current);
        current = "";
      }
      parts.push(rest.slice(0, maxChars));
      rest = rest.slice(maxChars);
    }

    if (!current) {
      current = rest;
    } else if (current.length + rest.length + 1 > maxChars) {
      parts.push(current);
      current = rest;
    } else {
      current += "\n" + rest;
    }
  }

  if (current.trim()) parts.push(current);
  return parts;
}
