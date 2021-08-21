import dayjs from "dayjs"
import React, { useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import {
  contentPlayerKeyForRestorationAtom,
  contentPlayerPlayingContentAtom,
  contentPlayerSelectedServiceAtom,
  contentPlayerSelectedServiceLogoUrlAtom,
} from "../../atoms/contentPlayer"
import { contentPlayerUrlSelector } from "../../atoms/contentPlayerSelectors"
import {
  mirakurunCompatibility,
  mirakurunPrograms,
  mirakurunServices,
  mirakurunVersion,
} from "../../atoms/mirakurun"
import { mirakurunSetting } from "../../atoms/settings"
import { MirakurunAPI } from "../../infra/mirakurun"
import {
  Service,
  ServicesApiAxiosParamCreator,
} from "../../infra/mirakurun/api"

export const MirakurunManager: React.VFC<{}> = () => {
  const mirakurunSettingValue = useRecoilValue(mirakurunSetting)
  const setCompatibility = useSetRecoilState(mirakurunCompatibility)
  const setVersion = useSetRecoilState(mirakurunVersion)
  const setServices = useSetRecoilState(mirakurunServices)
  const setPrograms = useSetRecoilState(mirakurunPrograms)
  const [selectedService, setSelectedService] = useRecoilState(
    contentPlayerSelectedServiceAtom
  )
  const setPlayingContent = useSetRecoilState(contentPlayerPlayingContentAtom)
  const url = useRecoilValue(contentPlayerUrlSelector)
  const [lastSelectedServiceId, setLastSelectedServiceId] = useRecoilState(
    contentPlayerKeyForRestorationAtom
  )
  const setSelectedServiceLogoUrl = useSetRecoilState(
    contentPlayerSelectedServiceLogoUrlAtom
  )
  const [serviceLogos, setServiceLogos] = useState<{ [key: number]: string }>(
    {}
  )

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
      toast.error("番組情報の取得に失敗しました")
      return
    }
  }

  const [isFirstAppeal, setIsFirstAppeal] = useState(true)

  const init = async (mirakurun: MirakurunAPI) => {
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
        toast.info(message)
      }
      setIsFirstAppeal(false)
    } catch (error) {
      console.error(error)
      toast.error("Mirakurun への接続に失敗しました")
      return
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
      toast.error("サービス情報の取得に失敗しました")
      return
    }
    updatePrograms(mirakurun)
    if (programUpdateTimer.current) {
      clearInterval(programUpdateTimer.current)
    }
    programUpdateTimer.current = setInterval(
      () => updatePrograms(mirakurun),
      1000 * 60 * 60 // 1時間
    )
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
  useEffect(() => {
    if (mirakurunSettingValue.baseUrl) {
      try {
        const mirakurun = new MirakurunAPI(mirakurunSettingValue)
        init(mirakurun)
      } catch (error) {
        console.error(error)
      }
    } else {
      toast.info(
        "Mirakurun の設定が行われていません。設定画面から設定を行ってください。",
        { autoClose: false }
      )
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

  const updateToSelectedService = async (selectedService: Service) => {
    const mirakurun = new MirakurunAPI(mirakurunSettingValue)
    if (selectedService && selectedService.hasLogoData) {
      collectServiceLogo(mirakurun, selectedService)
    } else {
      setSelectedServiceLogoUrl(null)
    }

    const getServiceStreamRequest = await ServicesApiAxiosParamCreator(
      mirakurun.getConfigure()
    ).getServiceStream(selectedService.id)
    const requestUrl =
      mirakurunSettingValue.baseUrl + getServiceStreamRequest.url
    const update = () => {
      setPlayingContent({
        contentType: "Mirakurun",
        isLive: true,
        url: requestUrl,
      })
      setLastSelectedServiceId({
        contentType: "Mirakurun",
        serviceId: selectedService.id,
      })
    }
    if (url && mirakurunSettingValue.isEnableWaitForSingleTuner) {
      setPlayingContent(null)
      setTimeout(update, 1000)
    } else {
      update()
    }
  }

  useEffect(() => {
    if (selectedService) {
      console.info(`表示サービスを変更します:`, selectedService)
      try {
        updateToSelectedService(selectedService)
      } catch (error) {
        console.error(error)
      }
    } else {
      setPlayingContent(null)
    }
  }, [selectedService])
  return <></>
}
