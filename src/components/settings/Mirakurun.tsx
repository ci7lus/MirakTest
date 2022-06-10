import React, { useState } from "react"
import { useRecoilState } from "recoil"
import { mirakurunSetting, mirakurunUrlHistory } from "../../atoms/settings"

export const MirakurunSettingForm: React.FC<{}> = () => {
  const [mirakurun, setMirakurun] = useRecoilState(mirakurunSetting)
  const [url, setUrl] = useState(mirakurun.baseUrl)
  const [isEnableServiceTypeFilter, setIsEnableServiceTypeFilter] = useState(
    mirakurun.isEnableServiceTypeFilter
  )
  const [urlHistory, setUrlHistory] = useRecoilState(mirakurunUrlHistory)
  return (
    <form
      className="m-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (url) {
          setUrlHistory((prev) =>
            prev.find((_url) => _url === url)
              ? prev
              : [url, ...(10 < prev.length ? [...prev].slice(0, 10) : prev)]
          )
        }
        setMirakurun((prev) => {
          if (prev.baseUrl !== url && prev.baseUrl) {
            window.Preload.public.epgManager.unregister(prev.baseUrl)
          }
          return {
            baseUrl: url || undefined,
            isEnableServiceTypeFilter,
          }
        })
      }}
    >
      <label className="block">
        <span>Mirakurun API の URL</span>
        <datalist id="mirakurunUrlHistory">
          {urlHistory.map((url) => (
            <option key={url} value={url} />
          ))}
        </datalist>
        <input
          type="text"
          placeholder="http://mirakurun:40772/api"
          className="block mt-2 form-input rounded-md w-full text-gray-900"
          value={url || ""}
          onChange={(e) => setUrl(e.target.value)}
          list="mirakurunUrlHistory"
        />
      </label>
      <label className="block my-4">
        <span>データサービス（ワンセグ / G ガイド）を除外する</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={isEnableServiceTypeFilter || false}
          onChange={() => setIsEnableServiceTypeFilter((enabled) => !enabled)}
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
