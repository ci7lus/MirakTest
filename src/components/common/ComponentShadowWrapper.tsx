import React, { useEffect, useRef } from "react"
import ReactDOM from "react-dom"

export const ComponentShadowWrapper: React.VFC<{
  Component: React.VFC<{}>
  _id?: string
  className?: string
}> = ({ Component, _id, className }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const div = ref.current
    if (div) {
      let root: ShadowRoot
      if (div.shadowRoot) {
        root = div.shadowRoot
      } else {
        root = div.attachShadow({ mode: "open" })
      }
      ReactDOM.render(<Component />, root)
    }
  }, [ref, _id])
  return <div ref={ref} id={_id} className={className} />
}
