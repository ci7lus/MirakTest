import { css, StyleSheet } from "aphrodite"
import clsx from "clsx"
import React, { memo } from "react"
import {
  ENCLOSED_CHARACTERS_TABLE,
  ENCLOSED_STYLES,
} from "../../constants/enclosed"

const style = StyleSheet.create<Record<string, string>>({
  enclosed: {
    fontSize: 0,
    lineHeight: 0,
  },
  ...ENCLOSED_STYLES,
})

export const EscapeEnclosed = memo(
  ({ str, size }: { str: string; size: string }) => (
    <>
      {Array.from(str).map((char, idx) => {
        if (ENCLOSED_CHARACTERS_TABLE[char]) {
          return (
            <span
              className={clsx(
                "mx-0.5",
                "select-text",
                "truncate",
                css(style.enclosed),
                css(style[`reverse_${char.codePointAt(0)}`]),
                size
              )}
              key={idx}
            >
              {char}
            </span>
          )
        }
        return <React.Fragment key={idx}>{char}</React.Fragment>
      })}
    </>
  )
)
