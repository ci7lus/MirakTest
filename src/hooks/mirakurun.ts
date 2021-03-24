import { useRecoilValue } from "recoil"
import { mirakurunSetting } from "../atoms/settings"
import { MirakurunAPI } from "../infra/mirakurun"

export const useMirakurun = () => {
  const mirakurun = useRecoilValue(mirakurunSetting)
  return new MirakurunAPI(mirakurun)
}
