import clsx from "clsx"
import React, { memo } from "react"
import { ENCLOSED_CHARACTERS } from "../../constants/enclosed"

export const EscapeEnclosed = memo(({ str }: { str: string }) => (
  <>
    {Array.from(str).map((char, idx) => {
      if (ENCLOSED_CHARACTERS.includes(char)) {
        return (
          <span
            className={clsx("WadaLabMaruGo2004ARIBKakomi", "mx-0.5")}
            key={idx}
          >
            {char}
          </span>
        )
      }
      return <React.Fragment key={idx}>{char}</React.Fragment>
    })}
  </>
))
