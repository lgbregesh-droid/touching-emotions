// Server-only text extraction for PDF / DOCX / TXT.
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export type FileType = "pdf" | "docx" | "txt";

export function detectFileType(filename: string, contentType?: string): FileType | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf") || contentType === "application/pdf") return "pdf";
  if (lower.endsWith(".docx") || contentType?.includes("officedocument.wordprocessingml")) return "docx";
  if (lower.endsWith(".txt") || contentType?.startsWith("text/")) return "txt";
  return null;
}

function clean(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractTextFromBuffer(buffer: Uint8Array, type: FileType): Promise<string> {
  if (type === "txt") {
    return clean(new TextDecoder("utf-8").decode(buffer));
  }
  if (type === "docx") {
    // mammoth accepts a Node Buffer
    const buf = Buffer.from(buffer);
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return clean(value || "");
  }
  if (type === "pdf") {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    const merged = Array.isArray(text) ? text.join("\n\n") : text;
    return clean(merged || "");
  }
  throw new Error(`Unsupported file type: ${type}`);
}

// Split text into chunks of ~targetChars characters with overlap, preferring sentence boundaries.
export function chunkText(text: string, targetChars = 800, overlap = 150): string[] {
  const cleaned = clean(text);
  if (cleaned.length <= targetChars) return cleaned ? [cleaned] : [];
  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    let end = Math.min(start + targetChars, cleaned.length);
    if (end < cleaned.length) {
      // Try to end on a sentence/paragraph boundary
      const slice = cleaned.slice(start, end + 100);
      const m = slice.match(/[\.\!\?\n][^\.\!\?\n]*$/);
      if (m && m.index !== undefined && m.index > targetChars * 0.5) {
        end = start + m.index + 1;
      }
    }
    const piece = cleaned.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= cleaned.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}
