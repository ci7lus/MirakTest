import React, { useEffect } from "react"
import { ToastContainer, Slide } from "react-toastify"
import { injectStyle } from "react-toastify/dist/inject-style"
import { CoiledController } from "../components/mainPlayer/Controller"
import { CoiledVideoPlayer } from "../components/mainPlayer/VideoPlayer"
import { CoiledSayaComments } from "../components/mainPlayer/Saya"
import { MenuItem, MenuItemConstructorOptions, remote } from "electron"
import { Splash } from "../components/global/Splash"
import { MirakurunManager } from "../components/mainPlayer/MirakurunManager"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import {
  mainPlayerBounds,
  mainPlayerIsPlaying,
  mainPlayerLastSelectedServiceId,
  mainPlayerRoute,
  mainPlayerSelectedService,
  mainPlayerTitle,
} from "../atoms/mainPlayer"
import { VirtualWindowComponent } from "./Virtual"
import { mirakurunServices } from "../atoms/mirakurun"
import { useRefFromState } from "../hooks/ref"
import { useRecoilValueRef } from "../utils/recoil"
import { CoiledProgramTitleManager } from "../components/mainPlayer/ProgramTitleManager"
import { CoiledSubtitleRenderer } from "../components/mainPlayer/SubtitleRenderer"
import { CoiledRPCManager } from "../components/mainPlayer/RPCManager"

export const CoiledMainPlayer: React.VFC<{}> = () => {
  const [route, setRoute] = useRecoilState(mainPlayerRoute)
  const [bounds, setBounds] = useRecoilState(mainPlayerBounds)
  const [selectedService, setSelectedService] = useRecoilState(
    mainPlayerSelectedService
  )
  const selectedServiceRef = useRefFromState(selectedService)
  const lastSelectedServiceId = useRecoilValue(mainPlayerLastSelectedServiceId)
  const lastSelectedServiceIdRef = useRefFromState(lastSelectedServiceId)
  const services = useRecoilValue(mirakurunServices)
  const servicesRef = useRefFromState(services)
  const [, isPlayingRef] = useRecoilValueRef(mainPlayerIsPlaying)
  const setIsPlaying = useSetRecoilState(mainPlayerIsPlaying)
  useEffect(() => {
    injectStyle()
    const remoteWindow = remote.getCurrentWindow()
    // 前回のウィンドウサイズが保存されていれば戻す
    const onResizedOrMoved = () => setBounds(remoteWindow.getContentBounds())
    remoteWindow.on("resized", onResizedOrMoved)
    remoteWindow.on("moved", onResizedOrMoved)
    if (bounds) {
      remoteWindow.setContentBounds(bounds, true)
    } else {
      onResizedOrMoved()
    }

    // メインウィンドウを閉じたら終了する
    const onClosed = () => remote.app.quit()
    remoteWindow.on("closed", onClosed)
    // コンテキストメニュー
    remoteWindow.webContents.on("context-menu", (e, params) => {
      const noParams = typeof params !== "object"
      e.preventDefault()
      const menu: (MenuItemConstructorOptions | MenuItem)[] = [
        {
          label: "再生停止",
          type: "checkbox",
          checked: isPlayingRef.current === false,
          click: () => {
            // 再生中である場合停止
            if (isPlayingRef.current) {
              setIsPlaying(false)
              // 再生中でなく、サービスが埋められている（停止 or 受信失敗）の際に再生開始
            } else if (selectedServiceRef.current) {
              setIsPlaying(true)
              // 再生中でなく、サービスが埋められていない場合サービスを埋めることによって再生開始を試みる
            } else {
              if (servicesRef.current && 0 < servicesRef.current?.length) {
                const lastSelectedService = servicesRef.current.find(
                  (service) => service.id === lastSelectedServiceIdRef.current
                )
                if (lastSelectedService) {
                  setSelectedService(lastSelectedService)
                } else {
                  setSelectedService(servicesRef.current[0])
                }
              }
            }
          },
        },
        {
          type: "separator",
        },
        {
          label: "最前面に固定",
          type: "checkbox",
          checked: remoteWindow.isAlwaysOnTop(),
          click: () =>
            remoteWindow.setAlwaysOnTop(!remoteWindow.isAlwaysOnTop()),
        },
        {
          type: "separator",
        },
        {
          label: "設定",
          click: () => setRoute("settings"),
        },
        {
          type: "separator",
        },
        {
          label: "切り取り",
          role: "cut",
          visible: noParams || params.editFlags.canCut,
        },
        {
          label: "コピー",
          role: "copy",
          visible: noParams || params.editFlags.canCopy,
        },
        {
          label: "貼り付け",
          role: "paste",
          visible: noParams || params.editFlags.canPaste,
        },
        {
          label: "削除",
          role: "delete",
          visible: noParams || params.editFlags.canDelete,
          click: () => remoteWindow.webContents.delete(),
        },
        {
          label: "すべて選択",
          role: "selectAll",
          visible: noParams || params.editFlags.canSelectAll,
        },
        {
          type: "separator",
        },
        {
          label: "再読み込み",
          role: "reload",
          click: () => remoteWindow.webContents.reload(),
        },
        {
          label: "終了",
          role: "quit",
          click: () => remote.app.quit(),
        },
      ].filter((item) => item.visible !== false) as (
        | MenuItemConstructorOptions
        | MenuItem
      )[] // bug: https://github.com/electron/electron/issues/2895
      remote.Menu.buildFromTemplate(menu).popup()
    })
    return () => {
      remoteWindow.off("resized", onResizedOrMoved)
      remoteWindow.off("moved", onResizedOrMoved)
      remoteWindow.off("closed", onClosed)
    }
  }, [])
  // タイトル
  const title = useRecoilValue(mainPlayerTitle)
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
            id="VideoPlayer"
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
          >
            <CoiledVideoPlayer />
          </div>
          <div id="Saya" className="absolute top-0 left-0 w-full h-full">
            <CoiledSayaComments />
          </div>
          <div
            id="SubtitleRenderer"
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
          >
            <CoiledSubtitleRenderer />
          </div>
          <div id="Controller" className="absolute top-0 left-0 w-full h-full">
            <CoiledController />
          </div>
          <div
            id="VirtualWindow"
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <VirtualWindowComponent route={route} setRoute={setRoute} />
          </div>
        </div>
      </div>
    </>
  )
}
