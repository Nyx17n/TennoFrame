import { nativeImage } from 'electron'
import {
  SUPPORT_IMAGE_MAX_DIMENSION,
  SUPPORT_IMAGE_TARGET_MAX_EDGE,
  SUPPORT_RAW_IMAGE_MAX_BYTES,
  SUPPORT_SANITIZED_IMAGE_MAX_BYTES,
  type SupportPrepareAttachmentResult,
  type SupportSanitizedAttachment
} from '@shared/schemas/support.schema'

const MAX_TOTAL_PIXELS = 20_000_000 // 20 megapixels pre-decode ceiling
const PNG_PREFER_MAX_BYTES = 1_800_000 // Prefer lossless PNG up to 1.8 MB for crisp UI text

interface ParsedHeaderGeometry {
  format: 'png' | 'jpeg' | 'webp'
  width: number
  height: number
}

function hasForbiddenExecutableOrScriptPrefix(bytes: Uint8Array): boolean {
  // PE/MZ executable ('MZ') or ZIP/Office/JAR archive ('PK\x03\x04') or GIF ('GIF8')
  if (bytes[0] === 0x4d && bytes[1] === 0x5a) return true
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return true
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true

  const headAscii = Buffer.from(bytes.subarray(0, Math.min(256, bytes.byteLength)))
    .toString('latin1')
    .toLowerCase()
  return (
    headAscii.includes('<svg') ||
    headAscii.includes('<html') ||
    headAscii.includes('<!doc') ||
    headAscii.includes('<script') ||
    headAscii.includes('<?xml') ||
    headAscii.startsWith('%pdf-')
  )
}

function parsePngHeader(bytes: Uint8Array): ParsedHeaderGeometry | null {
  if (bytes.byteLength < 33) return null
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return null
  }
  // Bytes 12..15 must be 'IHDR'
  if (
    bytes[12] !== 0x49 ||
    bytes[13] !== 0x48 ||
    bytes[14] !== 0x44 ||
    bytes[15] !== 0x52
  ) {
    return null
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const width = view.getUint32(16, false)
  const height = view.getUint32(20, false)
  return { format: 'png', width, height }
}

function parseJpegHeader(bytes: Uint8Array): ParsedHeaderGeometry | null {
  if (bytes.byteLength < 32) return null
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return null

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = 2
  while (offset + 9 < bytes.byteLength) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }
    while (offset < bytes.byteLength && bytes[offset] === 0xff) {
      offset += 1
    }
    if (offset >= bytes.byteLength) break
    const marker = bytes[offset] ?? 0
    offset += 1

    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      continue
    }
    if (offset + 2 > bytes.byteLength) break
    const segLength = view.getUint16(offset, false)
    if (segLength < 2 || offset + segLength > bytes.byteLength) break

    // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)
    if (isSof && offset + 7 <= bytes.byteLength) {
      const height = view.getUint16(offset + 3, false)
      const width = view.getUint16(offset + 5, false)
      return { format: 'jpeg', width, height }
    }
    offset += segLength
  }
  return null
}

function parseWebpHeader(bytes: Uint8Array): ParsedHeaderGeometry | null {
  if (bytes.byteLength < 30) return null
  // 'RIFF' .... 'WEBP'
  if (
    bytes[0] !== 0x52 ||
    bytes[1] !== 0x49 ||
    bytes[2] !== 0x46 ||
    bytes[3] !== 0x46 ||
    bytes[8] !== 0x57 ||
    bytes[9] !== 0x45 ||
    bytes[10] !== 0x42 ||
    bytes[11] !== 0x50
  ) {
    return null
  }
  const chunk = String.fromCharCode(
    bytes[12] ?? 0,
    bytes[13] ?? 0,
    bytes[14] ?? 0,
    bytes[15] ?? 0
  )
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  if (chunk === 'VP8X' && bytes.byteLength >= 30) {
    const width = 1 + ((bytes[24] ?? 0) | ((bytes[25] ?? 0) << 8) | ((bytes[26] ?? 0) << 16))
    const height = 1 + ((bytes[27] ?? 0) | ((bytes[28] ?? 0) << 8) | ((bytes[29] ?? 0) << 16))
    return { format: 'webp', width, height }
  }
  if (chunk === 'VP8 ' && bytes.byteLength >= 30) {
    if (bytes[23] !== 0x9d || bytes[24] !== 0x01 || bytes[25] !== 0x2a) return null
    const width = view.getUint16(26, true) & 0x3fff
    const height = view.getUint16(28, true) & 0x3fff
    return { format: 'webp', width, height }
  }
  if (chunk === 'VP8L' && bytes.byteLength >= 25) {
    if (bytes[20] !== 0x2f) return null
    const b0 = bytes[21] ?? 0
    const b1 = bytes[22] ?? 0
    const b2 = bytes[23] ?? 0
    const b3 = bytes[24] ?? 0
    const width = 1 + (b0 | ((b1 & 0x3f) << 8))
    const height = 1 + (((b1 & 0xc0) >> 6) | (b2 << 2) | ((b3 & 0x0f) << 10))
    return { format: 'webp', width, height }
  }
  return null
}

/**
 * Content Disarm & Reconstruction (CDR) for Support Ticket Images.
 * 1. Verifies binary magic bytes (PNG / JPEG / WebP only — rejects SVG, GIF, EXE, ZIP, HTML, PDF).
 * 2. Enforces pre-decode dimension ceilings (blocks decompression bombs before allocation).
 * 3. Decodes raw RGBA pixels via Skia `nativeImage` and re-encodes a brand-new PNG/JPEG buffer,
 *    physically destroying 100% of EXIF/GPS metadata, hidden chunks, and trailing polyglot payloads.
 */
export function sanitizeSupportImageBuffer(bytes: Uint8Array): SupportPrepareAttachmentResult {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength < 32) {
    return { ok: false, errorMessage: 'Invalid or empty image file.' }
  }
  if (bytes.byteLength > SUPPORT_RAW_IMAGE_MAX_BYTES) {
    return { ok: false, errorMessage: 'Image is too large (maximum 8 MB allowed).' }
  }
  if (hasForbiddenExecutableOrScriptPrefix(bytes)) {
    return {
      ok: false,
      errorMessage: 'Blocked file type: only genuine PNG, JPG, or WebP screenshots are allowed.'
    }
  }

  const header = parsePngHeader(bytes) ?? parseJpegHeader(bytes) ?? parseWebpHeader(bytes)
  if (!header) {
    return {
      ok: false,
      errorMessage: 'Unsupported file format. Only PNG, JPG, and WebP images are accepted.'
    }
  }

  if (
    header.width < 8 ||
    header.height < 8 ||
    header.width > SUPPORT_IMAGE_MAX_DIMENSION ||
    header.height > SUPPORT_IMAGE_MAX_DIMENSION ||
    header.width * header.height > MAX_TOTAL_PIXELS
  ) {
    return {
      ok: false,
      errorMessage: `Image dimensions (${header.width}×${header.height}) are outside safe bounds (8px–8192px).`
    }
  }

  let decoded = nativeImage.createFromBuffer(Buffer.from(bytes))
  if (decoded.isEmpty()) {
    return { ok: false, errorMessage: 'Corrupted or unreadable image data.' }
  }

  const origSize = decoded.getSize()
  if (origSize.width < 8 || origSize.height < 8) {
    return { ok: false, errorMessage: 'Image dimensions are too small (minimum 8×8 px).' }
  }

  if (
    origSize.width > SUPPORT_IMAGE_TARGET_MAX_EDGE ||
    origSize.height > SUPPORT_IMAGE_TARGET_MAX_EDGE
  ) {
    const scale = SUPPORT_IMAGE_TARGET_MAX_EDGE / Math.max(origSize.width, origSize.height)
    const targetW = Math.max(8, Math.round(origSize.width * scale))
    const targetH = Math.max(8, Math.round(origSize.height * scale))
    decoded = decoded.resize({ width: targetW, height: targetH, quality: 'best' })
  }

  const finalSize = decoded.getSize()
  const pngOut = decoded.toPNG()

  let outBuffer: Buffer = pngOut
  let outMime: SupportSanitizedAttachment['mimeType'] = 'image/png'

  if (pngOut.byteLength > PNG_PREFER_MAX_BYTES || header.format === 'jpeg') {
    for (const quality of [86, 74, 62]) {
      const jpgTry = decoded.toJPEG(quality)
      outBuffer = jpgTry
      outMime = 'image/jpeg'
      if (jpgTry.byteLength <= SUPPORT_SANITIZED_IMAGE_MAX_BYTES) {
        break
      }
    }
  }

  if (outBuffer.byteLength < 32 || outBuffer.byteLength > SUPPORT_SANITIZED_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      errorMessage: 'Image remains larger than 2.5 MB after compression. Please crop the screenshot.'
    }
  }

  return {
    ok: true,
    attachment: {
      mimeType: outMime,
      dataBase64: outBuffer.toString('base64'),
      width: finalSize.width,
      height: finalSize.height,
      byteLength: outBuffer.byteLength
    }
  }
}
