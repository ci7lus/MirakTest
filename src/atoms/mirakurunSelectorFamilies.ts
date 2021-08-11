import { selectorFamily } from "recoil"
import pkg from "../../package.json"
import { mirakurunPrograms } from "./mirakurun"

const prefix = `${pkg.name}.mirakurun`

export const mirakurunProgramsFamily = selectorFamily({
  key: `${prefix}.programsFamily`,
  get:
    (serviceId: number) =>
    ({ get }) => {
      return (get(mirakurunPrograms) || []).filter(
        (program) => program.serviceId === serviceId
      )
    },
})
