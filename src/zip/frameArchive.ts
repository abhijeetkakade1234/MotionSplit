import JSZip from 'jszip'

export function createFrameArchive() {
  return new JSZip()
}

export function finalizeFrameArchive(
  archive: JSZip,
  isCancelled: () => boolean,
) {
  const stream = archive.generateInternalStream({
    streamFiles: true,
    type: 'uint8array',
  })

  return new Promise<Blob>((resolve, reject) => {
    const chunks: BlobPart[] = []
    let settled = false

    const cancel = () => {
      if (settled) {
        return
      }

      settled = true
      stream.pause()
      reject(new Error('Extraction cancelled.'))
    }

    stream
      .on('data', (chunk) => {
        if (isCancelled()) {
          cancel()
          return
        }

        chunks.push(chunk as Uint8Array<ArrayBuffer>)
      })
      .on('error', (error) => {
        if (!settled) {
          settled = true
          reject(error)
        }
      })
      .on('end', () => {
        if (isCancelled()) {
          cancel()
          return
        }

        if (!settled) {
          settled = true
          resolve(new Blob(chunks, { type: 'application/zip' }))
        }
      })
      .resume()
  })
}
