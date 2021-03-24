import React, { useEffect } from "react"
import { toast } from "react-toastify"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import {
  mainPlayerLastSelectedServiceId,
  mainPlayerSelectedService,
  mainPlayerUrl,
} from "../../atoms/mainPlayer"
import {
  mirakurunCompatibility,
  mirakurunServices,
  mirakurunVersion,
} from "../../atoms/mirakurun"
import { mirakurunSetting } from "../../atoms/settings"
import { MirakurunAPI } from "../../infra/mirakurun"
import {
  Service,
  ServicesApiAxiosParamCreator,
} from "../../infra/mirakurun/api"
import { MirakurunSetting } from "../../types/struct"

export const MirakurunManager: React.VFC<{}> = () => {
  const mirakurunSettingValue = useRecoilValue(mirakurunSetting)
  const setCompatibility = useSetRecoilState(mirakurunCompatibility)
  const setVersion = useSetRecoilState(mirakurunVersion)
  const setServices = useSetRecoilState(mirakurunServices)
  const [selectedService, setSelectedService] = useRecoilState(
    mainPlayerSelectedService
  )
  const setUrl = useSetRecoilState(mainPlayerUrl)
  const [lastSelectedServiceId, setLastSelectedServiceId] = useRecoilState(
    mainPlayerLastSelectedServiceId
  )

  const init = async (mirakurunSetting: MirakurunSetting) => {
    if (!mirakurunSetting.baseUrl) {
      toast.info(
        "Mirakurun の設定が行われていません。設定画面から設定を行ってください。",
        { autoClose: false }
      )
      return
    }
    let mirakurun: MirakurunAPI
    try {
      mirakurun = new MirakurunAPI(mirakurunSetting)
      const version = await mirakurun.version.checkVersion()
      let message: string
      if (typeof version.data === "string") {
        setCompatibility("Mirakc")
        setVersion(version.data)
        message = `Mirakc (${version.data})`
      } else {
        setCompatibility("Mirakurun")
        setVersion(version.data.current || null)
        message = `Mirakurun (${version.data.current})`
      }
      toast.info(message)
    } catch (error) {
      console.error(error)
      toast.error("Mirakurun への接続に失敗しました")
      return
    }
    let services: Service[]
    try {
      const servicesReq = await mirakurun.services.getServices()
      setServices(servicesReq.data)
      services = servicesReq.data
    } catch (error) {
      console.error(error)
      toast.error("サービス情報の取得に失敗しました")
      return
    }
    if (lastSelectedServiceId) {
      const service = services.find(
        (service) => service.id === lastSelectedServiceId
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
    init(mirakurunSettingValue)
  }, [mirakurunSettingValue])
  const updateToSelectedService = async (selectedService: Service) => {
    const mirakurun = new MirakurunAPI(mirakurunSettingValue)
    const req = await ServicesApiAxiosParamCreator(
      mirakurun.getConfigure()
    ).getServiceStream(selectedService.id)
    let url = mirakurunSettingValue.baseUrl + req.url
    if (mirakurunSettingValue.username || mirakurunSettingValue.password) {
      const auth = [
        mirakurunSettingValue.username,
        mirakurunSettingValue.password,
      ]
        .filter((s) => s)
        .join(":")
      url = url.replace("//", `//${auth}@`)
    }
    setUrl(url)
    setLastSelectedServiceId(selectedService.id)
  }
  useEffect(() => {
    if (!selectedService) return
    console.log(`表示サービスを変更します:`, selectedService)
    try {
      updateToSelectedService(selectedService)
    } catch (error) {
      console.error(error)
    } finally {
    }
  }, [selectedService])
  return <></>
}
