interface ClipboardItem {
  new (input: { [contentType: string]: Blob }): ClipboardItem
}

type AsyncClipboardWriteFunction = (
  input: ClipboardItem[] | string
) => Promise<void>

export declare global {
  interface Window {
    ClipboardItem: ClipboardItem
  }

  interface Navigator {
    writeText: AsyncClipboardWriteFunction
  }

  interface Clipboard {
    write: AsyncClipboardWriteFunction
  }
}
