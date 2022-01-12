import { ENCLOSED_CHARACTERS } from "../constants/enclosed"

export const convertVariationSelectedClosed = (s: string) =>
  Array.from(s)
    .map((char) =>
      ENCLOSED_CHARACTERS.includes(char) ? char + "\u{fe0e}" : char
    )
    .join("")
