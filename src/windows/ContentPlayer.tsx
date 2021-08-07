import { remote } from "electron"
import React, { useEffect } from "react"
import { ToastContainer, Slide } from "react-toastify"
import { injectStyle } from "react-toastify/dist/inject-style"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { contentPlayerBounds, contentPlayerTitle } from "../atoms/contentPlayer"
import { PluginPositionComponents } from "../components/common/PluginPositionComponents"
import { CoiledController } from "../components/contentPlayer/Controller"
import { MirakurunManager } from "../components/contentPlayer/MirakurunManager"
import { CoiledProgramTitleManager } from "../components/contentPlayer/ProgramTitleManager"
import { CoiledRPCManager } from "../components/contentPlayer/RPCManager"
import { CoiledSayaComments } from "../components/contentPlayer/Saya"
import { CoiledSubtitleRenderer } from "../components/contentPlayer/SubtitleRenderer"
import { CoiledVideoPlayer } from "../components/contentPlayer/VideoPlayer"
import { Splash } from "../components/global/Splash"
import { useContentPlayerContextMenu } from "../utils/contextmenu"

export const CoiledContentPlayer: React.VFC<{}> = () => {
  const setBounds = useSetRecoilState(contentPlayerBounds)
  const onContextMenu = useContentPlayerContextMenu()

  useEffect(() => {
    injectStyle()
    const remoteWindow = remote.getCurrentWindow()
    // ウィンドウサイズを保存する
    const onResizedOrMoved = () => setBounds(remoteWindow.getContentBounds())
    remoteWindow.on("resized", onResizedOrMoved)
    remoteWindow.on("moved", onResizedOrMoved)
    onResizedOrMoved()
    // コンテキストメニュー

    remoteWindow.webContents.on("context-menu", onContextMenu)
    return () => {
      remoteWindow.off("resized", onResizedOrMoved)
      remoteWindow.off("moved", onResizedOrMoved)
    }
  }, [])
  // タイトル
  const title = useRecoilValue(contentPlayerTitle)
  useEffect(() => {
    const window = remote.getCurrentWindow()
    if (title) {
      window.setTitle(`${title} - ${remote.app.name}`)
    } else {
      window.setTitle(remote.app.name)
    }
  }, [title])

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        closeOnClick
        transition={Slide}
        hideProgressBar={false}
        newestOnTop={false}
        rtl={false}
        draggable
        pauseOnHover
      />
      <MirakurunManager />
      <CoiledProgramTitleManager />
      <CoiledRPCManager />
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
            <CoiledVideoPlayer />
          </div>
          <div id="Saya" className="absolute top-0 left-0 w-full h-full">
            <CoiledSayaComments />
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
            <CoiledSubtitleRenderer />
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
