import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { useSetRecoilState, useRecoilValue } from "recoil"
import pkg from "../../package.json"
import { globalContentPlayerSelectedServiceFamily } from "../atoms/globalFamilies"
import { globalActiveContentPlayerIdSelector } from "../atoms/globalSelectors"
import { mirakurunServicesAtom } from "../atoms/mirakurun"
import { mirakurunSetting } from "../atoms/settings"
import { ScrollArea } from "../components/programTable/ScrollArea"
import { WeekdaySelector } from "../components/programTable/WeekdaySelector"
import { useNow } from "../hooks/date"

export const CoiledProgramTable: React.VFC<{}> = () => {
  const now = useNow()
  const [add, setAdd] = useState(0)
  const activePlayerId = useRecoilValue(globalActiveContentPlayerIdSelector)
  const setSelectedService = useSetRecoilState(
    globalContentPlayerSelectedServiceFamily(activePlayerId ?? 0)
  )
  const services = useRecoilValue(mirakurunServicesAtom)
  const mirakurunSettingValue = useRecoilValue(mirakurunSetting)

  useEffect(() => {
    window.Preload.public.setWindowTitle(`番組表 - ${pkg.productName}`)
  }, [])

  return (
    <div
      className={clsx(
        "w-full",
        "h-screen",
        "text-gray-100",
        "flex",
        "flex-col",
        "text-lg"
      )}
    >
      <div
        className={clsx(
          "w-full",
          "p-4",
          "bg-gray-800",
          "flex",
          "justify-between",
          "items-center",
          "space-x-4"
        )}
      >
        <h1
          className={clsx("text-2xl", "font-semibold", "flex-shrink-0", "pl-2")}
        >
          番組表
        </h1>
        <div className={clsx()}>
          <WeekdaySelector now={now} add={add} setAdd={setAdd} />
        </div>
      </div>
      {mirakurunSettingValue.baseUrl ? (
        <ScrollArea
          mirakurunSetting={mirakurunSettingValue}
          services={services}
          add={add}
          setService={setSelectedService}
        />
      ) : (
        <p>URLが設定されていません</p>
      )}
    </div>
  )
}
