import clsx from "clsx"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useClickAway } from "react-use"
import { useRecoilValue } from "recoil"
import { lastEpgUpdatedAtom } from "../../../atoms/contentPlayer"
import { useNow } from "../../../hooks/date"
import { ChannelType, Program, Service } from "../../../infra/mirakurun/api"
import { SidebarSelectedServiceList } from "./SidebarSelectedServiceList"

/**
 * BS 放送のサービス ID をワンタッチ選局 ID に変換
 *
 * 一部の局ではサブチャンネルの運用をしているがクイック選局セレクタには表示したくないのでワンタッチ選局 ID ごとに纏める
 *
 * https://www.apab.or.jp/bs/
 */
const BSSidToOneTouch: Record<
  number,
  { service: number; oneTouch: number | null } | undefined
> = {
  101: { service: 101, oneTouch: 1 }, // NHK BS1
  102: { service: 101, oneTouch: 1 }, // NHK BS1
  103: { service: 103, oneTouch: 3 }, // NHK BSP
  104: { service: 103, oneTouch: 3 }, // NHK BSP
  141: { service: 141, oneTouch: 4 }, // BS日テレ
  142: { service: 141, oneTouch: 4 }, // BS日テレ
  143: { service: 141, oneTouch: 4 }, // BS日テレ
  151: { service: 151, oneTouch: 5 }, // BS朝日
  152: { service: 151, oneTouch: 5 }, // BS朝日
  153: { service: 151, oneTouch: 5 }, // BS朝日
  161: { service: 161, oneTouch: 6 }, // BS-TBS
  162: { service: 161, oneTouch: 6 }, // BS-TBS
  163: { service: 161, oneTouch: 6 }, // BS-TBS
  171: { service: 171, oneTouch: 7 }, // BSテレ東
  172: { service: 171, oneTouch: 7 }, // BSテレ東
  173: { service: 171, oneTouch: 7 }, // BSテレ東
  181: { service: 181, oneTouch: 8 }, // BSフジ
  182: { service: 181, oneTouch: 8 }, // BSフジ
  183: { service: 181, oneTouch: 8 }, // BSフジ
  // 以下の放送局はワンタッチ選局対象だけどサブチャンネルの運用をしていないのでサービス単位でよい
  // 191: { service: 191, oneTouch: 9 }, //  WOWOWプライム
  // 192: { service: 191, oneTouch: null }, // WOWOWライブ
  // 193: { service: 191, oneTouch: null }, // WOWOWシネマ
  // 200: { service: 200, oneTouch: 10 }, // スターチャンネル1
  // 201: { service: 200, oneTouch: null }, // スターチャンネル2
  // 202: { service: 200, oneTouch: null }, // スターチャンネル3
  // 211: { service: 211, oneTouch: 11 }, // BS11
  // 222: { service: 222, oneTouch: 12 }, // TwellV
}

export const ControllerSidebar: React.FC<{
  isVisible: boolean
  services: Service[]
  setService: (service: Service) => unknown
  setIsSidebarOpen: (b: boolean) => unknown
}> = ({ isVisible, services, setService, setIsSidebarOpen }) => {
  const ref = useRef<HTMLDivElement>(null)
  useClickAway(ref, () => setIsSidebarOpen(false))
  const serviceTypes = useMemo(
    () =>
      Array.from(
        new Set(
          services.map((service) => service.channel?.type).filter((s) => s)
        )
      ),
    [services]
  )
  const [selectedType, setSelectedType] = useState<ChannelType | undefined>(
    serviceTypes?.[0]
  )
  const targetServices = useMemo(
    () =>
      Object.values(
        services
          .filter((service) => service.channel?.type === selectedType)
          .reduce<Record<string, Service[]>>((services, service) => {
            let identifier = ""
            switch (service.channel?.type) {
              // 区域外再放送などで別な放送局が同じリモコンキー ID を使う可能性があるので、ネットワーク ID とリモコンキー ID で纏める
              case ChannelType.Gr: {
                identifier = [
                  service.networkId,
                  service.remoteControlKeyId ?? -1,
                ].join("_")

                break
              }

              // ワンタッチ選局があればそれで纏める、無い場合はサブチャンネルの運用はないはずなのでサービス単位
              case ChannelType.Bs: {
                const oneTouch = BSSidToOneTouch[service.serviceId]
                identifier = String(oneTouch?.service ?? service.serviceId)
                service.remoteControlKeyId = oneTouch?.oneTouch ?? undefined

                break
              }

              // CS はサービス単位
              case ChannelType.Cs: {
                identifier = String(service.id)

                break
              }

              // SKY などはチャンネル単位で纏める?
              default: {
                identifier = service.channel?.channel ?? ""

                break
              }
            }

            if (identifier === "") {
              return services
            }
            if (!services[identifier]) {
              services[identifier] = [service]
            } else {
              services[identifier].push(service)
            }
            return services
          }, {})
      ).sort(
        (a, b) =>
          (a[0].remoteControlKeyId ?? a[0].serviceId) -
          (b[0].remoteControlKeyId ?? b[0].serviceId)
      ),
    [selectedType, services]
  )
  const now = useNow()
  const [queriedPrograms, setQueriedPrograms] = useState<Program[]>([])
  const lastEpgUpdated = useRecoilValue(lastEpgUpdatedAtom)
  useEffect(() => {
    const unix = now.unix() * 1000
    window.Preload.public.epgManager
      .query({
        startAtLessThan: unix,
        endAtMoreThan: unix + 1,
      })
      .then(async (currentPrograms) => {
        const filter = (program: Program) =>
          services.find(
            (service) =>
              service.serviceId === program.serviceId &&
              service.networkId === program.networkId
          )
        const filtered = currentPrograms.filter(filter).sort()
        const max = Math.max(
          ...filtered.map((program) => program.startAt + program.duration)
        )
        if (!max) {
          setQueriedPrograms((prev) =>
            JSON.stringify(prev) === JSON.stringify(filtered) ? prev : filtered
          )
          return
        }
        const programs = await window.Preload.public.epgManager.query({
          startAtLessThan: max,
          startAt: unix,
        })
        const queriedPrograms = [...programs.filter(filter), ...filtered].sort()
        setQueriedPrograms((prev) =>
          JSON.stringify(prev) === JSON.stringify(queriedPrograms)
            ? prev
            : queriedPrograms
        )
      })
  }, [now, lastEpgUpdated])
  return (
    <div
      ref={ref}
      className={clsx(
        "w-full",
        "h-full",
        "bg-gray-800 bg-opacity-30",
        "duration-150 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0",
        !isVisible && "cursor-none",
        isVisible && "p-4",
        "flex",
        "flex-col"
      )}
      onWheel={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className={clsx("flex", "flex-col", "h-full")}>
        <div
          className={clsx(
            "overflow-auto",
            "flex",
            "pb-2",
            "shrink-0",
            "scrollbar-thin"
          )}
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY
          }}
        >
          {serviceTypes.map((type, idx) => (
            <button
              key={type}
              type="button"
              className={clsx(
                type === selectedType ? "bg-gray-600" : "bg-gray-800",
                "text-gray-100",
                idx === 0 && "rounded-l-md",
                idx === serviceTypes.length - 1 && "rounded-r-md",
                idx !== serviceTypes.length - 1 && "border-r border-gray-100",
                "px-3",
                "py-2",
                "bg-opacity-70"
              )}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <SidebarSelectedServiceList
          services={targetServices}
          queriedPrograms={queriedPrograms}
          setService={setService}
        />
      </div>
    </div>
  )
}
