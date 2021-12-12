import { remote } from "electron"
import React, { useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import {
  contentPlayerIsPlayingAtom,
  contentPlayerKeyForRestorationAtom,
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
import { queryPrograms, registerEpgManager } from "../../utils/program"

export const MirakurunManager: React.VFC<{}> = () => {
  const mirakurunSettingValue = useRecoilValue(mirakurunSetting)
  const setCompatibility = useSetRecoilState(mirakurunCompatibilityAtom)
  const setVersion = useSetRecoilState(mirakurunVersionAtom)
  const setServices = useSetRecoilState(mirakurunServicesAtom)
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
    registerEpgManager({
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
      new remote.Notification({
        title: "Mirakurun サービス情報の取得に失敗しました",
        body: error instanceof Error ? error.message : undefined,
      }).show()
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

  // programs/playingContent.service->playingContent.programの反映
  useEffect(() => {
    if (playingContent?.contentType !== "Mirakurun" || !service) {
      return
    }
    const unix = now.unix() * 1000
    queryPrograms({
      serviceId: service.serviceId,
      networkId: service.networkId,
      startAtLessThan: unix,
      endAtMoreThan: unix,
    }).then((programs) => {
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
  }, [service, now])
  return <></>
}
