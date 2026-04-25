import { promisify } from "node:util";
import { inflateRaw as inflateRawCb } from "node:zlib";

const inflateRaw = promisify(inflateRawCb);

/**
 * Minimal ZIP parser tailored to the soft-launch ebook format: each
 * `*.zip` in the `product-files` bucket wraps exactly one `.html` file
 * (created by PowerShell's `Compress-Archive`). We do not need the
 * full PKZIP spec — just enough to find the first DEFLATE-compressed
 * HTML entry, decompress it, and stream it back as the in-browser
 * reader response. No third-party dependency needed; node:zlib already
 * implements raw deflate, which is what ZIP entries store.
 */

const LOCAL_FILE_HEADER_SIG = 0x04034b50;
const HTML_EXTENSIONS = [".html", ".htm"];

export type ExtractedHtml = {
  filename: string;
  html: string;
};

export async function extractFirstHtmlFromZip(
  zip: Buffer,
): Promise<ExtractedHtml | null> {
  let offset = 0;

  while (offset + 30 <= zip.length) {
    const signature = zip.readUInt32LE(offset);
    if (signature !== LOCAL_FILE_HEADER_SIG) {
      // Reached the central directory or trailing data — stop.
      break;
    }

    const compressionMethod = zip.readUInt16LE(offset + 8);
    const compressedSize = zip.readUInt32LE(offset + 18);
    const filenameLength = zip.readUInt16LE(offset + 26);
    const extraFieldLength = zip.readUInt16LE(offset + 28);

    const filenameStart = offset + 30;
    const filename = zip
      .subarray(filenameStart, filenameStart + filenameLength)
      .toString("utf8");

    const dataStart = filenameStart + filenameLength + extraFieldLength;
    const dataEnd = dataStart + compressedSize;

    const isHtml = HTML_EXTENSIONS.some((ext) =>
      filename.toLowerCase().endsWith(ext),
    );

    if (isHtml) {
      const compressed = zip.subarray(dataStart, dataEnd);
      let decompressed: Buffer;
      if (compressionMethod === 0) {
        decompressed = compressed;
      } else if (compressionMethod === 8) {
        decompressed = await inflateRaw(compressed);
      } else {
        // Compression method we do not handle (bzip2, lzma, …). Skip
        // the entry rather than crash — admin can re-export the ZIP.
        offset = dataEnd;
        continue;
      }
      return {
        filename,
        html: decompressed.toString("utf8"),
      };
    }

    offset = dataEnd;
  }

  return null;
}
