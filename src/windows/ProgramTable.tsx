import { Dialog } from "@headlessui/react"
import clsx from "clsx"
import React, { useEffect, useMemo, useState } from "react"
import { useSetRecoilState, useRecoilValue } from "recoil"
import pkg from "../../package.json"
import { globalContentPlayerSelectedServiceFamily } from "../atoms/globalFamilies"
import { globalActiveContentPlayerIdSelector } from "../atoms/globalSelectors"
import { mirakurunServicesAtom } from "../atoms/mirakurun"
import { mirakurunSetting } from "../atoms/settings"
import { CoiledEpgUpdatedObserver } from "../components/global/EpgUpdatedObserver"
import { ProgramModal } from "../components/programTable/ProgramModal"
import { ScrollArea } from "../components/programTable/ScrollArea"
import { WeekdaySelector } from "../components/programTable/WeekdaySelector"
import { useNow } from "../hooks/date"
import { Program } from "../types/plugin"

export const CoiledProgramTable: React.VFC<{}> = () => {
  const now = useNow()
  const [add, setAdd] = useState(0)
  const activePlayerId = useRecoilValue(globalActiveContentPlayerIdSelector)
  const setSelectedService = useSetRecoilState(
    globalContentPlayerSelectedServiceFamily(activePlayerId ?? 0)
  )
  const services = useRecoilValue(mirakurunServicesAtom)
  const mirakurunSettingValue = useRecoilValue(mirakurunSetting)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const selectedService = useMemo(
    () =>
      services?.find(
        (service) =>
          service.serviceId === selectedProgram?.serviceId &&
          service.networkId === selectedProgram.networkId
      ),
    [selectedProgram]
  )

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
      <CoiledEpgUpdatedObserver />
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
          setSelectedProgram={setSelectedProgram}
        />
      ) : (
        <p>URLが設定されていません</p>
      )}
      <Dialog
        className={clsx(
          "fixed",
          "z-20",
          "inset-0",
          "flex",
          "justify-center",
          "items-center"
        )}
        open={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
      >
        <Dialog.Overlay
          className={clsx(
            "fixed",
            "z-20",
            "inset-0",
            "overflow-auto",
            "bg-black",
            "bg-opacity-50"
          )}
        />
        {selectedProgram && selectedService && (
          <ProgramModal
            program={selectedProgram}
            service={selectedService}
            setSelectedProgram={setSelectedProgram}
          />
        )}
      </Dialog>
    </div>
  )
}
