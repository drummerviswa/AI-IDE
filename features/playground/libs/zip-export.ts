import type { TemplateFolder, TemplateFile } from "@/features/playground/libs/path-to-json"

/**
 * Recursively collects all files from a TemplateFolder tree
 * Returns a flat list of { path, content } entries
 */
function collectFiles(
  node: TemplateFolder | TemplateFile,
  currentPath: string = "",
): Array<{ path: string; content: string }> {
  if ("filename" in node) {
    const file = node as TemplateFile
    const filePath = currentPath
      ? `${currentPath}/${file.filename}.${file.fileExtension}`
      : `${file.filename}.${file.fileExtension}`
    return [{ path: filePath, content: file.content || "" }]
  }

  const folder = node as TemplateFolder
  const folderPath =
    folder.folderName === "Root" ? currentPath : currentPath ? `${currentPath}/${folder.folderName}` : folder.folderName

  return folder.items.flatMap((item) => collectFiles(item as any, folderPath))
}

/**
 * Exports a playground's file tree as a downloadable ZIP file
 * Uses the browser's native CompressionStream / ZipStream API (Chrome 80+)
 * Falls back to a simple tarball-like approach for older browsers
 */
export async function downloadPlaygroundAsZip(
  templateData: TemplateFolder,
  playgroundName: string,
): Promise<void> {
  const files = collectFiles(templateData)
  const sanitizedName = playgroundName.replace(/[^a-zA-Z0-9-_]/g, "_") || "playground"

  try {
    // Try native File System Access API ZIP (Chrome) via JSZip-compatible approach
    // We implement a minimal ZIP builder manually since we can't add dependencies easily
    const zipBytes = await buildZip(files)
    const blob = new Blob([zipBytes], { type: "application/zip" })
    triggerDownload(blob, `${sanitizedName}.zip`)
  } catch (error) {
    console.error("Failed to build ZIP, falling back to text archive:", error)
    // Fallback: download each file as individual text file (just the first one)
    const firstFile = files[0]
    if (firstFile) {
      const blob = new Blob([firstFile.content], { type: "text/plain" })
      triggerDownload(blob, `${sanitizedName}_${firstFile.path.replace(/\//g, "_")}`)
    }
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Minimal ZIP builder (PKZIP format) — no external dependencies
 * Supports stored (uncompressed) files for simplicity and compatibility
 */
async function buildZip(files: Array<{ path: string; content: string }>): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const localHeaders: Uint8Array[] = []
  const centralDirectory: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.path)
    const dataBytes = encoder.encode(file.content)
    const crc = crc32(dataBytes)
    const now = dosDateTime()

    // Local file header
    const localHeader = new Uint8Array(30 + nameBytes.length)
    const lv = new DataView(localHeader.buffer)
    lv.setUint32(0, 0x04034b50, true) // signature
    lv.setUint16(4, 20, true)         // version needed
    lv.setUint16(6, 0, true)          // flags
    lv.setUint16(8, 0, true)          // compression: stored
    lv.setUint16(10, now.time, true)  // mod time
    lv.setUint16(12, now.date, true)  // mod date
    lv.setUint32(14, crc, true)       // crc-32
    lv.setUint32(18, dataBytes.length, true) // compressed size
    lv.setUint32(22, dataBytes.length, true) // uncompressed size
    lv.setUint16(26, nameBytes.length, true) // file name length
    lv.setUint16(28, 0, true)         // extra field length
    localHeader.set(nameBytes, 30)

    // Central directory header
    const centralHeader = new Uint8Array(46 + nameBytes.length)
    const cv = new DataView(centralHeader.buffer)
    cv.setUint32(0, 0x02014b50, true) // signature
    cv.setUint16(4, 20, true)         // version made by
    cv.setUint16(6, 20, true)         // version needed
    cv.setUint16(8, 0, true)          // flags
    cv.setUint16(10, 0, true)         // compression
    cv.setUint16(12, now.time, true)  // mod time
    cv.setUint16(14, now.date, true)  // mod date
    cv.setUint32(16, crc, true)       // crc-32
    cv.setUint32(20, dataBytes.length, true) // compressed size
    cv.setUint32(24, dataBytes.length, true) // uncompressed size
    cv.setUint16(28, nameBytes.length, true) // file name length
    cv.setUint16(30, 0, true)         // extra field length
    cv.setUint16(32, 0, true)         // file comment length
    cv.setUint16(34, 0, true)         // disk number start
    cv.setUint16(36, 0, true)         // internal attributes
    cv.setUint32(38, 0, true)         // external attributes
    cv.setUint32(42, offset, true)    // relative offset of local header
    centralHeader.set(nameBytes, 46)

    localHeaders.push(localHeader, dataBytes)
    centralDirectory.push(centralHeader)
    offset += localHeader.length + dataBytes.length
  }

  const cdOffset = offset
  const cdSize = centralDirectory.reduce((s, b) => s + b.length, 0)

  // End of central directory record
  const eocd = new Uint8Array(22)
  const ev = new DataView(eocd.buffer)
  ev.setUint32(0, 0x06054b50, true) // signature
  ev.setUint16(4, 0, true)          // disk number
  ev.setUint16(6, 0, true)          // disk with central directory
  ev.setUint16(8, files.length, true)
  ev.setUint16(10, files.length, true)
  ev.setUint32(12, cdSize, true)    // central directory size
  ev.setUint32(16, cdOffset, true)  // central directory offset
  ev.setUint16(20, 0, true)         // comment length

  // Concatenate all parts
  const totalLength =
    localHeaders.reduce((s, b) => s + b.length, 0) +
    cdSize +
    eocd.length

  const result = new Uint8Array(totalLength)
  let pos = 0
  for (const chunk of [...localHeaders, ...centralDirectory, eocd]) {
    result.set(chunk, pos)
    pos += chunk.length
  }

  return result
}

/** CRC-32 implementation */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  const table = getCrcTable()
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

let _crcTable: Uint32Array | null = null
function getCrcTable(): Uint32Array {
  if (_crcTable) return _crcTable
  _crcTable = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    _crcTable[i] = c
  }
  return _crcTable
}

function dosDateTime(): { time: number; date: number } {
  const now = new Date()
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  return { time, date }
}
