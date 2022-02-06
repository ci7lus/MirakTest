import dayjs from "dayjs"
import ja from "dayjs/locale/ja"
import { useEffect, useState } from "react"
dayjs.locale(ja)

export const useNow = () => {
  const [now, setNow] = useState(dayjs())

  useEffect(() => {
    const update = () => {
      setNow(dayjs())
      timeout = setTimeout(update, (60 - new Date().getSeconds()) * 1000)
    }
    let timeout = setTimeout(() => {
      update()
    }, (60 - new Date().getSeconds()) * 1000)
    return () => {
      timeout && clearTimeout(timeout)
    }
  }, [])

  return now
}
