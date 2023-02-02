import { Dialog } from "@headlessui/react"
import clsx from "clsx"
import dayjs from "dayjs"
import React, { useEffect, useRef } from "react"
import {
  Genre,
  SubGenre,
  VideoComponentType,
  AudioComponentType,
  AudioSamplingRate,
} from "../../constants/program"
import { Program } from "../../infra/mirakurun/api"
import { ServiceWithLogoData } from "../../types/mirakurun"
import { AutoLinkedText } from "../common/AutoLinkedText"
import { EscapeEnclosed } from "../common/EscapeEnclosed"

export const ProgramModal = ({
  program,
  service,
  setSelectedProgram,
}: {
  program: Program & { _pf?: boolean }
  service: ServiceWithLogoData
  setSelectedProgram: (program: Program | null) => void
}) => {
  const genres =
    program.genres?.map((genre) => {
      const mainGenre = genre.lv1 !== undefined && Genre[genre.lv1]
      const subGenre =
        genre.lv1 !== undefined &&
        genre.lv2 !== undefined &&
        SubGenre[genre.lv1][genre.lv2]
      return [mainGenre, subGenre].filter((s) => s).join(" / ")
    }) || []
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [program])

  return (
    <div
      className={clsx(
        "p-4",
        "bg-gray-800",
        "bg-opacity-80",
        "rounded-md",
        "text-gray-100",
        "max-w-2xl",
        "z-20",
        "leading-relaxed",
        "w-full",
        "max-h-screen",
        "flex",
        "flex-col"
      )}
    >
      <div className="overflow-auto" ref={ref}>
        <Dialog.Title
          className={clsx("text-2xl", "select-text", "align-middle")}
          tabIndex={0}
        >
          <EscapeEnclosed str={program.name || ""} size="before:text-xl" />
        </Dialog.Title>
        <p className={clsx("mt-2", "text-gray-300", "select-text")}>
          {`${service.remoteControlKeyId || service.serviceId} ${service.name}`}
          <br />
          {`${dayjs(program.startAt).format("HH:mm")}〜${
            program.duration !== 1
              ? `${dayjs(program.startAt + program.duration).format(
                  "HH:mm"
                )} (${Math.floor(program.duration / 1000 / 60)}分間)`
              : ""
          }`}
        </p>
        <p className={clsx("mt-2", "text-gray-300")}>
          {genres.map((genre) => (
            <span key={genre} className={clsx("block", "select-text")}>
              {genre}
            </span>
          ))}
        </p>
        <Dialog.Description
          className={clsx("mt-2", "whitespace-pre-wrap", "select-text")}
        >
          <EscapeEnclosed
            str={program.description || ""}
            size="before:text-base"
          />
        </Dialog.Description>

        <div>
          {Object.entries(program.extended || {}).map(([name, desc]) => (
            <React.Fragment key={name}>
              <h4
                className={clsx(
                  "text-lg",
                  "mt-2",
                  "text-gray-300",
                  "select-text"
                )}
              >
                {name}
              </h4>
              <p
                className={clsx(
                  "mt-1",
                  "whitespace-pre-wrap",
                  "programDescription",
                  "select-text"
                )}
              >
                <AutoLinkedText>{desc}</AutoLinkedText>
              </p>
            </React.Fragment>
          ))}
        </div>
        <div className={clsx("mt-2", "text-gray-400")}>
          {program._pf && <p>EIT[p/f] による更新</p>}
          {program.video?.componentType !== undefined && (
            <p>{VideoComponentType[program.video?.componentType]}</p>
          )}
          {program.audios?.[0].componentType !== undefined && (
            <p>{AudioComponentType[program.audios?.[0].componentType]}</p>
          )}
          {program.audios?.[0].samplingRate !== undefined && (
            <p>{AudioSamplingRate[program.audios?.[0].samplingRate ?? 0]}</p>
          )}
          <p>{program.isFree ? "無料放送" : "有料放送"}</p>
        </div>
      </div>

      <button
        type="reset"
        onClick={() => setSelectedProgram(null)}
        className={clsx(
          "p-2",
          "bg-gray-800",
          "bg-opacity-80",
          "rounded-md",
          "mt-4"
        )}
      >
        閉じる
      </button>
    </div>
  )
}
