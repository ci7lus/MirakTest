import { Menu } from "electron"

export const generateContentPlayerContextMenu = ({
  isPlaying,
  toggleIsPlaying,
  isAlwaysOnTop,
  toggleIsAlwaysOnTop,
  openContentPlayer,
  openProgramTable,
  openSetting,
  plugins,
}: {
  isPlaying: boolean | null
  toggleIsPlaying: () => void
  isAlwaysOnTop: boolean
  toggleIsAlwaysOnTop: () => void
  openContentPlayer: () => void
  openProgramTable: () => void
  openSetting: () => void
  plugins: Electron.MenuItemConstructorOptions[]
}) => {
  const pluginSeparator: Electron.MenuItemConstructorOptions[] = []
  if (0 < plugins.length) {
    pluginSeparator.push({
      type: "separator",
    })
  }

  return (e: Electron.Event, params: Electron.ContextMenuParams) => {
    const noParams = typeof params !== "object"
    e.preventDefault()
    const menu = [
      ...(isPlaying !== null
        ? [
            {
              label: "再生停止",
              type: "checkbox",
              checked: !isPlaying,
              click: () => toggleIsPlaying(),
            },
            {
              type: "separator",
            },
          ]
        : []),
      {
        label: "最前面に固定",
        type: "checkbox",
        checked: isAlwaysOnTop,
        click: () => toggleIsAlwaysOnTop(),
      },
      {
        type: "separator",
      },
      {
        label: "新しいプレイヤーを開く",
        click: () => openContentPlayer(),
      },
      {
        label: "番組表",
        click: () => openProgramTable(),
      },
      {
        label: "設定",
        click: () => openSetting(),
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
      },
      {
        label: "すべて選択",
        role: "selectAll",
        visible: noParams || params.editFlags.canSelectAll,
      },
      {
        type: "separator",
      },
      ...plugins,
      ...pluginSeparator,
      {
        label: "再読み込み",
        role: "reload",
      },
      {
        label: "ウィンドウを閉じる",
        role: "close",
      },
      {
        label: "終了",
        role: "quit",
      },
    ].filter(
      (item): item is Electron.MenuItemConstructorOptions =>
        item.visible !== false
    )
    Menu.buildFromTemplate(menu).popup()
  }
}
