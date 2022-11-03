import clsx from "clsx"
import React, { useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import pkg from "../../package.json"
import {
  contentPlayerBoundsAtom,
  contentPlayerIsPlayingAtom,
  contentPlayerTitleAtom,
} from "../atoms/contentPlayer"
import { PluginPositionComponents } from "../components/common/PluginPositionComponents"
import { CoiledController } from "../components/contentPlayer/Controller"
import { MirakurunManager } from "../components/contentPlayer/MirakurunManager"
import { CoiledProgramTitleManager } from "../components/contentPlayer/ProgramTitleManager"
import { CoiledSubtitleRenderer } from "../components/contentPlayer/SubtitleRenderer"
import { CoiledVideoPlayer } from "../components/contentPlayer/VideoPlayer"
import { CoiledEpgUpdatedObserver } from "../components/global/EpgUpdatedObserver"
import { Splash } from "../components/global/Splash"

export const CoiledContentPlayer: React.FC<{}> = () => {
  const setBounds = useSetRecoilState(contentPlayerBoundsAtom)
  const setIsPlaying = useSetRecoilState(contentPlayerIsPlayingAtom)
  const internalPlayingTimeRef = useRef(-1)

  useEffect(() => {
    // 16:9以下の比率になったら戻し、ウィンドウサイズを保存する
    let timer: NodeJS.Timeout | null = null
    const onResizedOrMoved = () => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(async () => {
        timer = null
        const bounds = await window.Preload.public.requestWindowContentBounds()
        if (!bounds) {
          return
        }
        setBounds(bounds)
      }, 500)
    }
    window.addEventListener("resize", onResizedOrMoved)
    const onWindowMoved = window.Preload.onWindowMoved(() => onResizedOrMoved())
    onResizedOrMoved()
    const onUpdateIsPlayingState = window.Preload.onUpdateIsPlayingState(
      (isPlaying) => {
        setIsPlaying(isPlaying)
      }
    )
    return () => {
      window.removeEventListener("resize", onResizedOrMoved)
      onUpdateIsPlayingState()
      onWindowMoved()
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])
  // タイトル
  const title = useRecoilValue(contentPlayerTitleAtom)
  useEffect(() => {
    if (title) {
      window.Preload.public.setWindowTitle(`${title} - ${pkg.productName}`)
    } else {
      window.Preload.public.setWindowTitle(pkg.productName)
    }
  }, [title])
  const [isHideController, setIsHideController] = useState(false)

  return (
    <>
      <MirakurunManager />
      <CoiledEpgUpdatedObserver />
      <CoiledProgramTitleManager />
      <div
        className={clsx(
          "w-full",
          "h-screen",
          "text-gray-100",
          "flex",
          "items-center",
          "justify-center"
        )}
      >
        <div
          className={clsx("relative", "w-full", "h-full", "overflow-hidden")}
        >
          <div
            id="Splash"
            className={clsx("absolute", "top-0", "left-0", "w-full", "h-full")}
          >
            <Splash />
          </div>
          <div
            id="OnSplashComponents"
            className={clsx("absolute", "top-0", "left-0", "w-full", "h-full")}
          >
            <PluginPositionComponents position="onSplash" />
          </div>
          <div
            id="VideoPlayer"
            className={clsx(
              "absolute",
              "top-0",
              "left-0",
              "w-full",
              "h-full",
              "flex",
              "items-center",
              "justify-center"
            )}
          >
            <CoiledVideoPlayer
              internalPlayingTimeRef={internalPlayingTimeRef}
              setIsHideController={setIsHideController}
            />
          </div>
          <div
            id="OnPlayerComponents"
            className={clsx("absolute", "top-0", "left-0", "w-full", "h-full")}
          >
            <PluginPositionComponents position="onPlayer" />
          </div>
          <div
            id="SubtitleRenderer"
            className={clsx(
              "absolute",
              "top-0",
              "left-0",
              "w-full",
              "h-full",
              "flex",
              "items-center",
              "justify-center"
            )}
          >
            <CoiledSubtitleRenderer
              internalPlayingTimeRef={internalPlayingTimeRef}
            />
          </div>
          <div
            id="OnSubtitleComponents"
            className={clsx("absolute", "top-0", "left-0", "w-full", "h-full")}
          >
            <PluginPositionComponents position="onSubtitle" />
          </div>
          <div
            id="Controller"
            className={clsx("absolute", "top-0", "left-0", "w-full", "h-full")}
          >
            <CoiledController isHide={isHideController} />
          </div>
          <div
            id="OnForwardComponents"
            className={clsx(
              "absolute",
              "top-0",
              "left-0",
              "w-full",
              "h-full",
              "pointer-events-none"
            )}
          >
            <PluginPositionComponents position="onForward" />
          </div>
        </div>
      </div>
    </>
  )
}
