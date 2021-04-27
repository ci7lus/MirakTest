import { Dayjs } from "dayjs"
import { Program } from "../infra/mirakurun/api"

export const getCurrentProgramOfService = ({
  programs,
  serviceId,
  now,
}: {
  programs: Program[]
  serviceId: number
  now: Dayjs
}) => {
  return programs.find(
    (program) =>
      program.serviceId === serviceId &&
      now.isAfter(program.startAt) &&
      now.isBefore(program.startAt + program.duration)
  )
}
