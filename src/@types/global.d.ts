import _Recoil from "recoil"
import { Preload } from "../types/ipc"
import { PluginDefineInRenderer, DefineAtom } from "../types/plugin"

declare global {
  interface Window {
    atoms?: DefineAtom[]
    plugins?: PluginDefineInRenderer[]
    Preload: Preload
    id?: number
  }

  // eslint-disable-next-line no-var
  declare var Recoil: typeof _Recoil
}

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor()
  }

  export default WebpackWorker
}
