import React, { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import { globalFontsAtom } from "../../../atoms/global"
import { SUBTITLE_DEFAULT_FONT } from "../../../constants/font"
import { SubtitleSetting } from "../../../types/setting"

export const SubtitleSettingForm: React.VFC<{
  subtitleSetting: SubtitleSetting
  setSubtitleSetting: React.Dispatch<React.SetStateAction<SubtitleSetting>>
}> = ({ subtitleSetting, setSubtitleSetting }) => {
  const [font, setFont] = useState(
    subtitleSetting.font || SUBTITLE_DEFAULT_FONT
  )
  const fonts = useRecoilValue(globalFontsAtom)
  useEffect(() => {
    setSubtitleSetting({
      font,
    })
  }, [font])
  return (
    <div>
      <p className="text-lg">字幕設定</p>
      <label className="block mt-4">
        <span>フォント</span>
        <datalist
          className="overflow-scroll"
          style={{ maxHeight: "50vh" }}
          id="subtitleFonts"
        >
          {fonts.map((font) => (
            <option key={font} value={font} />
          ))}
        </datalist>
        <input
          type="text"
          className="block mt-2 form-input rounded-md w-full text-gray-900"
          value={font || ""}
          onChange={(e) => {
            setFont(e.target.value)
          }}
          list="subtitleFonts"
        />
      </label>
    </div>
  )
}
