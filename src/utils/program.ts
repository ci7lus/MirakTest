import { ipcRenderer } from "electron"
import { EPG_MANAGER } from "../constants/ipc"
import { Program } from "../infra/mirakurun/api"
import { QuerySchema, RegisterSchema } from "../main/epgManager"

export const registerEpgManager = (arg: RegisterSchema) => {
  return ipcRenderer.invoke(EPG_MANAGER.REGISTER, arg)
}

export const unregisterEpgManager = (arg: RegisterSchema) => {
  return ipcRenderer.invoke(EPG_MANAGER.UNREGISTER, arg)
}

export const queryPrograms = (arg: QuerySchema): Promise<Program[]> => {
  return ipcRenderer.invoke(EPG_MANAGER.QUERY, arg)
}
