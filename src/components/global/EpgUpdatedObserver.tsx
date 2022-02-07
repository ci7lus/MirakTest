import React, { useEffect, useState } from "react"
import { useThrottleFn } from "react-use"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { lastEpgUpdatedAtom } from "../../atoms/contentPlayer"
import { globalLastEpgUpdatedAtom } from "../../atoms/global"

export const CoiledEpgUpdatedObserver = () => {
  const globalLastEpgUpdated = useRecoilValue(globalLastEpgUpdatedAtom)
  const setLastEpgUpdated = useSetRecoilState(lastEpgUpdatedAtom)
  const [isFirst, setIsFirst] = useState(true)
  // 初回更新
  useEffect(() => {
    if (globalLastEpgUpdated === 0 || isFirst === false) {
      return
    }
    setIsFirst(false)
    setLastEpgUpdated(globalLastEpgUpdated)
    console.info("番組表が更新されました:", globalLastEpgUpdated)
  }, [globalLastEpgUpdated])
  // 継続更新
  useThrottleFn(
    (globalLastEpgUpdated) => {
      if (globalLastEpgUpdated === 0) {
        return
      }
      setLastEpgUpdated(globalLastEpgUpdated)
      console.info("番組表が更新されました:", globalLastEpgUpdated)
    },
    1000 * 30,
    [globalLastEpgUpdated]
  )
  return <></>
}
