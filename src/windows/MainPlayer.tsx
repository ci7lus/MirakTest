import React, { useEffect } from "react"
import { ToastContainer, Slide } from "react-toastify"
import { injectStyle } from "react-toastify/dist/inject-style"
import { Controller } from "../components/mainPlayer/Controller"
import { Player } from "../components/mainPlayer/Player"
import { SayaComments } from "../components/mainPlayer/Saya"
import { remote } from "electron"
import { Splash } from "../components/global/Splash"
import { MirakurunManager } from "../components/mainPlayer/MirakurunManager"
import { useRecoilState } from "recoil"
import { mainPlayerRoute } from "../atoms/mainPlayer"
import { VirtualWindowComponent } from "./Virtual"

export const MainPlayer: React.VFC<{}> = () => {
  const [route, setRoute] = useRecoilState(mainPlayerRoute)
  useEffect(() => {
    injectStyle()
    // 16:9以下の比率になったら戻す
    const window = remote.getCurrentWindow()
    const onResize = () => {
      const bounds = window.getContentBounds()
      const min = Math.ceil((bounds.width / 16) * 9)
      if (bounds.height < min) {
        window.setContentBounds({
          ...bounds,
          height: min,
        })
      }
    }
    window.on("resized", onResize)
    onResize()
    // メインウィンドウを閉じたら終了する
    const onClosed = () => remote.app.quit()
    window.on("closed", onClosed)
    // コンテキストメニュー
    window.webContents.on("context-menu", (e, params) => {
      const noParams = typeof params !== "object"
      e.preventDefault()
      remote.Menu.buildFromTemplate([
        {
          label: "最前面に固定",
          type: "checkbox",
          checked: window.isAlwaysOnTop(),
          click: () => window.setAlwaysOnTop(!window.isAlwaysOnTop()),
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
          click: () => window.webContents.delete(),
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
          click: () => window.webContents.reload(),
        },
        {
          label: "終了",
          role: "quit",
          click: () => remote.app.quit(),
        },
      ]).popup()
    })
    return () => {
      window.off("resized", onResize)
      window.off("closed", onClosed)
    }
  }, [])

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
      <div className="w-full h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <Splash />
          </div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <Player />
          </div>
          <div className="absolute top-0 left-0 w-full h-full">
            <SayaComments />
          </div>
          <div className="absolute top-0 left-0 w-full h-full">
            <Controller />
          </div>
          {route && (
            <div className="absolute top-0 left-0 w-full h-full">
              <VirtualWindowComponent route={route} setRoute={setRoute} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
