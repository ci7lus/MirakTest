import { MirakurunAPI } from "../infra/mirakurun"
import { Service, ServicesApiAxiosParamCreator } from "../infra/mirakurun/api"
import { MirakurunSetting } from "../types/setting"

export const generateStreamUrlForMirakurun = async (
  service: Service,
  setting: MirakurunSetting
) => {
  const mirakurun = new MirakurunAPI(setting)

  const getServiceStreamRequest = await ServicesApiAxiosParamCreator(
    mirakurun.getConfigure()
  ).getServiceStream(service.id)
  const requestUrl = mirakurun.baseUrl + getServiceStreamRequest.url
  return requestUrl
}
