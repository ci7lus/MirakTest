import { selectorFamily } from "recoil"
import pkg from "../../package.json"
import { mirakurunProgramsAtom } from "./mirakurun"

const prefix = `${pkg.name}.mirakurun`

export const mirakurunProgramsFamily = selectorFamily({
  key: `${prefix}.programsFamily`,
  get:
    (serviceId: number) =>
    ({ get }) => {
      return (get(mirakurunProgramsAtom) || []).filter(
        (program) => program.serviceId === serviceId
      )
    },
})
