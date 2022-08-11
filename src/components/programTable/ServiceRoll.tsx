import { css, StyleSheet } from "aphrodite"
import clsx from "clsx"
import React from "react"
import { HOUR_HEIGHT } from "../../constants/style"
import { Service, Program } from "../../infra/mirakurun/api"
import { ProgramItem } from "./ProgramItem"

const style = StyleSheet.create({
  containIntrinsicSize: {
    containIntrinsicSize: `10rem ${HOUR_HEIGHT * 24}rem`,
    height: `${HOUR_HEIGHT * 24}rem`,
  },
})

export const ServiceRoll: React.FC<{
  service: Service
  programs: Program[]
  displayStartTimeInString: string
  setSelectedProgram: (program: Program | null) => void
}> = ({ service, programs, displayStartTimeInString, setSelectedProgram }) => (
  <div
    id={service.id.toString()}
    className={clsx(
      "relative",
      "content-visibility-auto",
      "w-48",
      "shrink-0",
      css(style.containIntrinsicSize)
    )}
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
