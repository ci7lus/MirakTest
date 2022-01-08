import React, { useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import {
  contentPlayerIsPlayingAtom,
  contentPlayerKeyForRestorationAtom,
  lastEpgUpdatedAtom,
} from "../../atoms/contentPlayer"
import {
  contentPlayerServiceSelector,
  contentPlayerUrlSelector,
} from "../../atoms/contentPlayerSelectors"
import {
  globalContentPlayerPlayingContentFamily,
  globalContentPlayerSelectedServiceFamily,
} from "../../atoms/globalFamilies"
import {
  mirakurunCompatibilityAtom,
  mirakurunServicesAtom,
  mirakurunVersionAtom,
} from "../../atoms/mirakurun"
import { mirakurunSetting } from "../../atoms/settings"
import { useNow } from "../../hooks/date"
import { MirakurunAPI } from "../../infra/mirakurun"
import {
  Service,
  ServicesApiAxiosParamCreator,
} from "../../infra/mirakurun/api"

export const MirakurunManager: React.VFC<{}> = () => {
  const mirakurunSettingValue = useRecoilValue(mirakurunSetting)
  const setCompatibility = useSetRecoilState(mirakurunCompatibilityAtom)
  const setVersion = useSetRecoilState(mirakurunVersionAtom)
  const setServices = useSetRecoilState(mirakurunServicesAtom)
  const [playingContent, setPlayingContent] = useRecoilState(
    globalContentPlayerPlayingContentFamily(window.id ?? -1)
  )
  const service = useRecoilValue(contentPlayerServiceSelector)
  const [selectedService, setSelectedService] = useRecoilState(
    globalContentPlayerSelectedServiceFamily(window.id ?? -1)
  )
  const url = useRecoilValue(contentPlayerUrlSelector)
  const [lastSelectedServiceId, setLastSelectedServiceId] = useRecoilState(
    contentPlayerKeyForRestorationAtom
  )
  const isPlaying = useRecoilValue(contentPlayerIsPlayingAtom)

  const programUpdateTimer = useRef<NodeJS.Timeout | null>(null)

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
        window.Preload.public.showNotification({
          title: "Mirakurun に接続しました",
          body: message,
        })
      }
      setIsFirstAppeal(false)
    } catch (error) {
      console.error(error)
      window.Preload.public.showNotification({
        title: "Mirakurun への接続に失敗しました",
        body: error instanceof Error ? error.message : undefined,
      })
      if (!isContentPrepared) {
        return
      }
    }
    window.Preload.public.epgManager.register({
      url: mirakurun.baseUrl,
      userAgent: navigator.userAgent,
    })
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
      window.Preload.public.showNotification({
        title: "Mirakurun サービス情報の取得に失敗しました",
        body: error instanceof Error ? error.message : undefined,
      })
      if (!isContentPrepared) {
        return
      }
      services = []
    }
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
      window.Preload.public.showNotification({
        title: "Mirakurun の設定が行われていません",
        body: "設定画面から設定を行ってください。",
      })
      setIsFirstAppeal(false)
    }
    return () => {
      if (programUpdateTimer.current) {
        clearInterval(programUpdateTimer.current)
        programUpdateTimer.current = null
      }
    }
  }, [mirakurunSettingValue])

  const updateService = async (service: Service | null) => {
    if (!service) {
      setPlayingContent(null)
      return
    }
    const mirakurun = new MirakurunAPI(mirakurunSettingValue)

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
  const lastEpgUpdated = useRecoilValue(lastEpgUpdatedAtom)

  // programs/playingContent.service->playingContent.programの反映
  useEffect(() => {
    if (playingContent?.contentType !== "Mirakurun" || !service) {
      return
    }
    const unix = now.unix() * 1000
    window.Preload.public.epgManager
      .query({
        serviceId: service.serviceId,
        networkId: service.networkId,
        startAtLessThan: unix,
        endAtMoreThan: unix + 1,
      })
      .then((programs) => {
        const program = programs.slice(0).pop()
        if (program) {
          setPlayingContent((prev) =>
            prev
              ? prev.program?.id === program.id
                ? prev
                : { ...prev, program }
              : null
          )
        }
      })
  }, [service, now, lastEpgUpdated])
  return <></>
}
