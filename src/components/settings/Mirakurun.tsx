import React, { useState } from "react"
import { useRecoilState } from "recoil"
import { mirakurunSetting } from "../../atoms/settings"

export const MirakurunSettingForm: React.VFC<{}> = () => {
  const [mirakurun, setMirakurun] = useRecoilState(mirakurunSetting)
  const [url, setUrl] = useState(mirakurun.baseUrl)
  return (
    <form
      className="m-4"
      onSubmit={(e) => {
        e.preventDefault()
        setMirakurun({
          baseUrl: url || undefined,
        })
      }}
    >
      <label className="mb-2 block">
        <span>Mirakurun API の URL</span>
        <input
          type="text"
          placeholder="http://mirakurun:40772/api"
          className="block mt-2 form-input rounded-md w-full text-gray-900"
          value={url || ""}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <button
        type="submit"
        className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md focus:outline-none cursor-pointer active:bg-gray-200"
      >
        保存
      </button>
    </form>
  )
}
