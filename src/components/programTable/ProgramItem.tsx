import dayjs from "dayjs"
import React, { memo, useState } from "react"
import { Genre, SubGenre } from "../../constants/genre"
import { GenreColors } from "../../constants/genreColor"
import { Program, Service } from "../../infra/mirakurun/api"

export const ProgramItem: React.FC<{
  program: Program
  service: Service
  displayStartTimeInString: string
}> = memo(({ program, service, displayStartTimeInString }) => {
  const startAt = dayjs(program.startAt)
  //const remain = startAt.diff(now, "minute")
  const displayStartTime = dayjs(displayStartTimeInString)
  const diffInMinutes = startAt.diff(displayStartTime, "minute")
  const top = (diffInMinutes / 60) * 180
  const duration = program.duration / 1000
  const height = (duration / 3600) * 180

  const firstGenre = program.genres?.[0]
  const lv1 = firstGenre?.lv1
  const genre = lv1 !== undefined && Genre[lv1]
  const lv2 = firstGenre?.lv2
  const subGenre = lv1 !== undefined && lv2 !== undefined && SubGenre[lv1][lv2]
  const genreColor =
    genre && ((subGenre && GenreColors[subGenre]) || GenreColors[genre])

  const [isHovering, setIsHovering] = useState(false)

  const calcHeight = 0 < top ? height : height + top

  return (
    <div
      id={`${service.id}-${program.id}`}
      style={{
        top: `${Math.max(top, 0)}px`,
        height: isHovering ? "auto" : `${calcHeight}px`,
        minHeight: `${calcHeight}px`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        containIntrinsicSize: `10rem ${calcHeight}px`,
        maxHeight: isHovering ? `${180 * 24}px` : `${calcHeight}px`,
      }}
      className={`absolute truncate w-40 ${
        genreColor || "bg-gray-100"
      } border border-gray-400 cursor-pointer select-none content-visibility-auto contain-paint transition-maxHeight ${
        isHovering && "z-50"
      }`}
      title={[program.name, program.description]
        .filter((s) => !!s)
        .join("\n\n")}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <p className="whitespace-pre-wrap leading-snug">
        {startAt.format("HH:mm")} {program.name}
      </p>
      <p
        className="whitespace-pre-wrap pt-1 px-2 pb-2 text-xs text-gray-600"
        /*dangerouslySetInnerHTML={{
                                __html: program.detail,
                              }}*/
      >
        {program.description}
      </p>
    </div>
  )
})
