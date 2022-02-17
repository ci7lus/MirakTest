import clsx from "clsx"
import React from "react"
import { Service, Program } from "../../infra/mirakurun/api"
import { ProgramItem } from "./ProgramItem"

export const ServiceRoll: React.FC<{
  service: Service
  programs: Program[]
  displayStartTimeInString: string
  hourHeight: number
  setSelectedProgram: (program: Program | null) => void
}> = ({
  service,
  programs,
  displayStartTimeInString,
  hourHeight,
  setSelectedProgram,
}) => (
  <div
    id={service.id.toString()}
    className={clsx(
      "relative",
      "h-max",
      "content-visibility-auto",
      "w-48",
      "flex-shrink-0"
    )}
    style={{
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      containIntrinsicSize: `10rem ${hourHeight * 24}px`,
    }}
  >
    {programs.map((program) => (
      <ProgramItem
        key={program.id}
        program={program}
        service={service}
        displayStartTimeInString={displayStartTimeInString}
        setSelectedProgram={setSelectedProgram}
      />
    ))}
  </div>
)
