import React, { useEffect, useRef } from "react"
import { createRoot, Root } from "react-dom/client"

export const ComponentShadowWrapper: React.FC<{
  Component: React.FC<{}>
  _id?: string
  className?: string
}> = ({ Component, _id, className }) => {
  const ref = useRef<HTMLDivElement>(null)
  const rootRef = useRef<Root>()
  useEffect(() => {
    const div = ref.current
    const root = rootRef.current
    if (root) {
      root.render(<Component />)
    } else if (div) {
      let shadow: ShadowRoot
      if (div.shadowRoot) {
        shadow = div.shadowRoot
      } else {
        shadow = div.attachShadow({ mode: "open" })
      }
      const root = createRoot(shadow)
      root.render(<Component />)
      rootRef.current = root
    }
  }, [ref, _id])
  return <div ref={ref} id={_id} className={className} />
}
