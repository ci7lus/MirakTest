import React, { useEffect, useRef } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import pkg from "../../package.json"
import {
  contentPlayerBoundsAtom,
  contentPlayerIsPlayingAtom,
  contentPlayerTitleAtom,
} from "../atoms/contentPlayer"
import { globalActiveContentPlayerIdAtom } from "../atoms/global"
import { PluginPositionComponents } from "../components/common/PluginPositionComponents"
import { CoiledController } from "../components/contentPlayer/Controller"
import { MirakurunManager } from "../components/contentPlayer/MirakurunManager"
import { CoiledProgramTitleManager } from "../components/contentPlayer/ProgramTitleManager"
import { CoiledSubtitleRenderer } from "../components/contentPlayer/SubtitleRenderer"
import { CoiledVideoPlayer } from "../components/contentPlayer/VideoPlayer"
import { CoiledEpgUpdatedObserver } from "../components/global/EpgUpdatedObserver"
import { Splash } from "../components/global/Splash"

export const CoiledContentPlayer: React.VFC<{}> = () => {
  const setBounds = useSetRecoilState(contentPlayerBoundsAtom)
  const setActiveContentPlayerId = useSetRecoilState(
    globalActiveContentPlayerIdAtom
  )
  const setIsPlaying = useSetRecoilState(contentPlayerIsPlayingAtom)
  const internalPlayingTimeRef = useRef(-1)

  useEffect(() => {
    // 16:9以下の比率になったら戻し、ウィンドウサイズを保存する
    const onResizedOrMoved = async () => {
      const bounds = await window.Preload.public.requestWindowContentBounds()
      if (!bounds) {
        return
      }
      const min = Math.ceil((bounds.width / 16) * 9)
      if (process.platform === "darwin" && bounds.height < min) {
        const targetBounds = {
          ...bounds,
          height: min,
        }
        window.Preload.public.setWindowContentBounds(targetBounds)
        setBounds(targetBounds)
      } else {
        setBounds(bounds)
      }
    }
    window.addEventListener("resize", onResizedOrMoved)
    const onWindowMoved = window.Preload.onWindowMoved(() => onResizedOrMoved())
    onResizedOrMoved()
    const onFocus = () => {
      setActiveContentPlayerId(window.id ?? -1)
    }
    onFocus()
    window.addEventListener("focus", onFocus)
    const onUpdateIsPlayingState = window.Preload.onUpdateIsPlayingState(
      (isPlaying) => {
        setIsPlaying(isPlaying)
      }
    )
    return () => {
      window.removeEventListener("resize", onResizedOrMoved)
      window.removeEventListener("focus", onFocus)
      onUpdateIsPlayingState()
      onWindowMoved()
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

  return (
    <>
      <MirakurunManager />
      <CoiledEpgUpdatedObserver />
      <CoiledProgramTitleManager />
      <div className="w-full h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          <div id="Splash" className="absolute top-0 left-0 w-full h-full">
            <Splash />
          </div>
          <div
            id="OnSplashComponents"
            className="absolute top-0 left-0 w-full h-full"
          >
            <PluginPositionComponents position="onSplash" />
          </div>
          <div
            id="VideoPlayer"
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
          >
            <CoiledVideoPlayer
              internalPlayingTimeRef={internalPlayingTimeRef}
            />
          </div>
          <div
            id="OnPlayerComponents"
            className="absolute top-0 left-0 w-full h-full"
          >
            <PluginPositionComponents position="onPlayer" />
          </div>
          <div
            id="SubtitleRenderer"
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
          >
            <CoiledSubtitleRenderer
              internalPlayingTimeRef={internalPlayingTimeRef}
            />
          </div>
          <div
            id="OnSubtitleComponents"
            className="absolute top-0 left-0 w-full h-full"
          >
            <PluginPositionComponents position="onSubtitle" />
          </div>
          <div id="Controller" className="absolute top-0 left-0 w-full h-full">
            <CoiledController />
          </div>
          <div
            id="OnForwardComponents"
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <PluginPositionComponents position="onForward" />
          </div>
        </div>
      </div>
    </>
  )
}
