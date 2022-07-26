import { StyleSheet, css } from "aphrodite"
import dayjs from "dayjs"
import React, { memo } from "react"
import { GenreColors } from "../../constants/genreColor"
import { Genre, SubGenre } from "../../constants/program"
import { HOUR_HEIGHT } from "../../constants/style"
import { Program, Service } from "../../infra/mirakurun/api"
import { convertVariationSelectedClosed } from "../../utils/enclosed"
import { EscapeEnclosed } from "../common/EscapeEnclosed"

const { hover } = StyleSheet.create({
  hover: {
    ":hover": {
      height: "auto",
      maxHeight: `${HOUR_HEIGHT * 24}rem`,
      zIndex: 50,
    },
  },
})

export const ProgramItem: React.FC<{
  program: Program
  service: Service
  displayStartTimeInString: string
  setSelectedProgram: (program: Program | null) => void
}> = memo(
  ({ program, service, displayStartTimeInString, setSelectedProgram }) => {
    const startAt = dayjs(program.startAt)
    //const remain = startAt.diff(now, "minute")
    const displayStartTime = dayjs(displayStartTimeInString)
    const diffInMinutes = startAt.diff(displayStartTime, "minute")
    const top = (diffInMinutes / 60) * HOUR_HEIGHT
    // 終了時間未定の場合はdurationが1になるので表示長さを調節する
    const duration =
      program.duration === 1
        ? // 既に開始済みの番組
          startAt.isBefore(displayStartTime)
          ? displayStartTime.clone().add(1, "hour").diff(startAt, "seconds")
          : // 未来の長さ未定番組はとりあえず1時間にする
            60 * 60
        : program.duration / 1000
    const height = (duration / 3600) * HOUR_HEIGHT

    const firstGenre = program.genres?.[0]
    const lv1 = firstGenre?.lv1
    const genre = lv1 !== undefined && Genre[lv1]
    const lv2 = firstGenre?.lv2
    const subGenre =
      lv1 !== undefined && lv2 !== undefined && SubGenre[lv1][lv2]
    const genreColor =
      genre && ((subGenre && GenreColors[subGenre]) || GenreColors[genre])

    const calcHeight = 0 < top ? height : height + top

    const style = StyleSheet.create({
      button: {
        top: `${Math.max(top, 0)}rem`,
        height: `${calcHeight}rem`,
        minHeight: `${calcHeight}rem`,
        containIntrinsicSize: `10rem ${calcHeight}rem`,
        maxHeight: `${calcHeight}rem`,
      },
    })

    return (
      <button
        id={`${service.id}-${program.id}`}
        className={`text-left align-top absolute truncate w-48 ${
          genreColor || "bg-gray-100"
        } border border-gray-400 select-none content-visibility-auto contain-paint transition-maxHeight hover:h-auto hover:max-h-96 hover:z-50 ${
          program.duration === 1 && "z-50"
        } flex ${css(style.button)} ${css(hover)}`}
        onClick={() => {
          setSelectedProgram(program)
        }}
        type="button"
        title={convertVariationSelectedClosed(
          [
            program.name,
            `${startAt.format("HH:mm")}〜${
              program.duration !== 1
                ? startAt
                    .clone()
                    .add(program.duration, "milliseconds")
                    .format("HH:mm")
                : ""
            }`.trim(),
            program.description,
          ]
            .filter((s) => !!s)
            .join("\n\n")
        )}
      >
        <div>
          <p className="whitespace-pre-wrap leading-snug pointer-events-none">
            {startAt.format("HH:mm")}{" "}
            <EscapeEnclosed str={program.name || ""} />
          </p>
          <p
            className="whitespace-pre-wrap pt-1 px-2 pb-2 text-xs text-gray-600 h-full"
            /*dangerouslySetInnerHTML={{
                                __html: program.detail,
                              }}*/
          >
            {program.description}
          </p>
        </div>
      </button>
    )
  },
  (prev, next) =>
    prev.program.id === next.program.id &&
    prev.program.startAt === next.program.startAt &&
    prev.program.duration === next.program.duration &&
    prev.displayStartTimeInString === next.displayStartTimeInString
)
