import { useEffect, useRef } from "react"

export const useRefFromState = <T>(i: T) => {
  const ref = useRef(i)
  useEffect(() => {
    ref.current = i
  }, [i])

  return ref
}
