import dayjs from "dayjs"
import { remote } from "electron"
import React, { useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import {
  contentPlayerIsPlayingAtom,
  contentPlayerKeyForRestorationAtom,
  contentPlayerServiceLogoUrlAtom,
} from "../../atoms/contentPlayer"
import {
  contentPlayerPlayingContentAtom,
  contentPlayerSelectedServiceAtom,
} from "../../atoms/contentPlayerResolvedFamilies"
import {
  contentPlayerServiceSelector,
  contentPlayerUrlSelector,
} from "../../atoms/contentPlayerSelectors"
import {
  mirakurunCompatibilityAtom,
  mirakurunProgramsAtom,
  mirakurunServicesAtom,
  mirakurunVersionAtom,
} from "../../atoms/mirakurun"
import { mirakurunProgramsFamily } from "../../atoms/mirakurunSelectorFamilies"
import { mirakurunSetting } from "../../atoms/settings"
import { useNow } from "../../hooks/date"
import { MirakurunAPI } from "../../infra/mirakurun"
import {
  Service,
  ServicesApiAxiosParamCreator,
} from "../../infra/mirakurun/api"
import { getCurrentProgramOfService } from "../../utils/program"

export const MirakurunManager: React.VFC<{}> = () => {
  const mirakurunSettingValue = useRecoilValue(mirakurunSetting)
  const setCompatibility = useSetRecoilState(mirakurunCompatibilityAtom)
  const setVersion = useSetRecoilState(mirakurunVersionAtom)
  const [services, setServices] = useRecoilState(mirakurunServicesAtom)
  const [programs, setPrograms] = useRecoilState(mirakurunProgramsAtom)
  const [playingContent, setPlayingContent] = useRecoilState(
    contentPlayerPlayingContentAtom
  )
  const service = useRecoilValue(contentPlayerServiceSelector)
  const [selectedService, setSelectedService] = useRecoilState(
    contentPlayerSelectedServiceAtom
  )
  const url = useRecoilValue(contentPlayerUrlSelector)
  const [lastSelectedServiceId, setLastSelectedServiceId] = useRecoilState(
    contentPlayerKeyForRestorationAtom
  )
  const setSelectedServiceLogoUrl = useSetRecoilState(
    contentPlayerServiceLogoUrlAtom
  )
  const [serviceLogos, setServiceLogos] = useState<{ [key: number]: string }>(
    {}
  )
  const isPlaying = useRecoilValue(contentPlayerIsPlayingAtom)

  const programUpdateTimer = useRef<NodeJS.Timeout | null>(null)

  const updatePrograms = async (mirakurun: MirakurunAPI) => {
    const tomorrow = dayjs().add(1, "days")
    try {
      const programs = await mirakurun.programs.getPrograms()
      const filtered = programs.data.filter(
        (program) => tomorrow.isAfter(program.startAt) // 直近1日以内のデータのみ抽出
      )
      setPrograms(filtered)
      console.info(
        `番組情報を更新しました。件数: ${filtered.length.toLocaleString()}/${programs.data.length.toLocaleString()}`
      )
    } catch (error) {
      console.error(error)
      new remote.Notification({
        title: "取得に失敗しました",
        body: "Mirakurun からの番組情報の取得に失敗しました",
      }).show()
      return
    }
  }

  const [isFirstAppeal, setIsFirstAppeal] = useState(true)

  const init = async (mirakurun: MirakurunAPI) => {
    const isContentPrepared =
      (isFirstAppeal &&
        playingContent &&
        playingContent.contentType !== "Mirakurun") ||
      isPlaying
    try {
      const version = await mirakurun.version.checkVersion()
      let message: string
      if (typeof version.data === "string") {
        setCompatibility("Mirakc")
        setVersion(version.data)
        message = `Mirakc (${version.data})`
      } else if (typeof version.data.current === "string") {
        setCompatibility("Mirakurun")
        setVersion(version.data.current || null)
        message = `Mirakurun (${version.data.current})`
      } else {
        throw new Error()
      }
      if (!isFirstAppeal) {
        new remote.Notification({
          title: "Mirakurun に接続しました",
          body: message,
        }).show()
      }
      setIsFirstAppeal(false)
    } catch (error) {
      console.error(error)
      new remote.Notification({
        title: "Mirakurun への接続に失敗しました",
        body: error instanceof Error ? error.message : undefined,
      }).show()
      if (!isContentPrepared) {
        return
      }
    }
    let services: Service[]
    try {
      const servicesReq = await mirakurun.services.getServices()
      setServices(
        servicesReq.data.filter(
          (service) =>
            !mirakurunSettingValue.isEnableServiceTypeFilter ||
            service.type === 0x01 // デジタルTVサービス https://github.com/DBCTRADO/LibISDB/blob/ae14668bfc601d1b94851e666c82fe409afd8f31/LibISDB/LibISDBConsts.hpp#L122
        )
      )
      services = servicesReq.data
    } catch (error) {
      console.error(error)
      new remote.Notification({
        title: "Mirakurun サービス情報の取得に失敗しました",
        body: error instanceof Error ? error.message : undefined,
      }).show()
      if (!isContentPrepared) {
        return
      }
      services = []
    }
    updatePrograms(mirakurun)
    if (programUpdateTimer.current) {
      clearInterval(programUpdateTimer.current)
    }
    programUpdateTimer.current = setInterval(
      () => updatePrograms(mirakurun),
      1000 * 60 * 60 // 1時間
    )
    if (!isContentPrepared) {
      if (lastSelectedServiceId) {
        const service = services.find(
          (service) => service.id === lastSelectedServiceId.serviceId
        )
        if (service) {
          setSelectedService(service)
          return
        }
      }
      if (0 < services.length) {
        setSelectedService(services[0])
      }
    }
  }
  useEffect(() => {
    if (mirakurunSettingValue.baseUrl) {
      try {
        const mirakurun = new MirakurunAPI(mirakurunSettingValue)
        init(mirakurun)
      } catch (error) {
        console.error(error)
      }
    } else {
      new remote.Notification({
        title: "Mirakurun の設定が行われていません",
        body: "設定画面から設定を行ってください。",
      }).show()
      setIsFirstAppeal(false)
    }
    return () => {
      if (programUpdateTimer.current) {
        clearInterval(programUpdateTimer.current)
        programUpdateTimer.current = null
      }
    }
  }, [mirakurunSettingValue])

  const collectServiceLogo = async (
    mirakurun: MirakurunAPI,
    service: Service
  ) => {
    if (serviceLogos[service.id]) {
      setSelectedServiceLogoUrl(serviceLogos[service.id])
      return
    }
    try {
      const logoData = await mirakurun.services.getLogoImage(service.id, {
        responseType: "arraybuffer",
      })
      const objUrl = URL.createObjectURL(
        // 自動生成されたクライアントの帰り型がvoidになってしまっている
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new Blob([logoData.data as any], {
          type: logoData.headers?.["content-type"] || "image/png",
        })
      )
      setSelectedServiceLogoUrl(objUrl)
      const copied = Object.assign({}, serviceLogos)
      copied[service.id] = objUrl
      setServiceLogos(copied)
    } catch (error) {
      console.error("ロゴの取得に失敗しました", service, error)
    }
  }

  const updateService = async (service: Service | null) => {
    if (!service) {
      setPlayingContent(null)
      return
    }
    const mirakurun = new MirakurunAPI(mirakurunSettingValue)
    if (service && service.hasLogoData) {
      collectServiceLogo(mirakurun, service)
    } else {
      setSelectedServiceLogoUrl(null)
    }

    const getServiceStreamRequest = await ServicesApiAxiosParamCreator(
      mirakurun.getConfigure()
    ).getServiceStream(service.id)
    const requestUrl =
      mirakurunSettingValue.baseUrl + getServiceStreamRequest.url
    const update = () => {
      setPlayingContent({
        contentType: "Mirakurun",
        url: requestUrl,
        service: service,
      })
      setLastSelectedServiceId({
        contentType: "Mirakurun",
        serviceId: service.id,
      })
    }
    if (url && mirakurunSettingValue.isEnableWaitForSingleTuner) {
      setPlayingContent(null)
      setTimeout(update, 1000)
    } else {
      update()
    }
  }

  // selectedService（切り替え先サービス）->serviceへの反映発火
  useEffect(() => {
    if (
      playingContent &&
      playingContent.contentType !== "Mirakurun" &&
      // 新しいウィンドウで特定のサービスを開くがnull上書きされることへの対策、そもそもサービスをnull上書きしなきゃいけないシーンないかも
      !selectedService // 録画再生からライブサービスへ切り替え出来ないことへの対策
    ) {
      return
    }
    console.info(`表示サービスを変更します:`, selectedService)
    updateService(selectedService).catch(console.error)
  }, [selectedService])

  const now = useNow()
  const programsByService = useRecoilValue(
    mirakurunProgramsFamily(playingContent?.service?.serviceId ?? 0)
  )

  useEffect(() => {
    const mirakurunService = services?.find((s) => s.id === service?.id)
    if (!mirakurunService) return
    const mirakurun = new MirakurunAPI(mirakurunSettingValue)
    if (mirakurunService && mirakurunService.hasLogoData) {
      collectServiceLogo(mirakurun, mirakurunService)
    } else {
      setSelectedServiceLogoUrl(null)
    }
  }, [services, service])

  // programs/playingContent.service->playingContent.programの反映
  useEffect(() => {
    if (playingContent?.contentType !== "Mirakurun" || !service) {
      return
    }
    const program = getCurrentProgramOfService({
      programs: programsByService,
      serviceId: service.serviceId,
      now,
    })
    setPlayingContent((prev) => (prev ? { ...prev, program } : null))
  }, [service, programs, now])
  return <></>
}
