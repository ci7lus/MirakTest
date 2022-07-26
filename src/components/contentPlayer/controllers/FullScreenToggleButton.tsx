import clsx from "clsx"
import React from "react"
import { Maximize } from "react-feather"

export const FullScreenToggleButton: React.FC<{ toggle: Function }> = ({
  toggle,
}) => {
  return (
    <button
      aria-label="フルスクリーン状態を切り替えます"
      title="フルスクリーン"
      type="button"
      className={clsx("focus:outline-none", "p-2", "text-gray-100")}
      onClick={() => toggle()}
    >
      <Maximize className="pointer-events-none" size="1.75rem" />
    </button>
  )
}
