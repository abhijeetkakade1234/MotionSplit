import JSZip from 'jszip'

export function createFrameArchive() {
  return new JSZip()
}

export function finalizeFrameArchive(archive: JSZip) {
  return archive.generateAsync({ type: 'blob' })
}
