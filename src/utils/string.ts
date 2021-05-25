export const tryBase64ToUint8Array = (s: string) => {
  try {
    return Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
  } catch (error) {
    console.error(error)
    return false
  }
}
