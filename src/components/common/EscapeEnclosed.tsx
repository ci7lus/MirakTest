import clsx from "clsx"
import React from "react"
import {
  ENCLOSED_CHARACTERS,
  ENCLOSED_CHARACTERS_TABLE,
} from "../../constants/enclosed"

export const EscapeEnclosed = ({ str }: { str: string }) => (
  <>
    {Array.from(str).map((char, idx) => {
      if (ENCLOSED_CHARACTERS.includes(char)) {
        return (
          <span
            key={idx}
            className={clsx(
              "text-sm",
              "bg-blue-500",
              "text-gray-100",
              "rounded-md",
              "p-1",
              "font-semibold",
              "ml-1"
            )}
          >
            {ENCLOSED_CHARACTERS_TABLE[char]}
          </span>
        )
      }
      return <React.Fragment key={idx}>{char}</React.Fragment>
    })}
  </>
)
