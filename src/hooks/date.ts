import dayjs from "dayjs"
import { useEffect, useState } from "react"
import ja from "dayjs/locale/ja"
dayjs.locale(ja)

export const useNow = () => {
  const [now, setNow] = useState(dayjs())

  useEffect(() => {
    let interval: null | NodeJS.Timeout = null
    const update = () => setNow(dayjs())
    let timeout: null | NodeJS.Timeout = setTimeout(() => {
      update()
      interval = setInterval(update, 60 * 1000)
      timeout = null
    }, (60 - new Date().getSeconds()) * 1000)
    return () => {
      timeout && clearTimeout(timeout)
      interval && clearInterval(interval)
    }
  }, [])

  return now
}
