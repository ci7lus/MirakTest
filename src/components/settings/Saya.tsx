import React, { useState } from "react"
import { Plus, X } from "react-feather"
import { useRecoilState } from "recoil"
import { sayaSetting } from "../../atoms/settings"

export const SayaSettingForm: React.VFC<{}> = () => {
  const [saya, setSaya] = useRecoilState(sayaSetting)
  const [url, setUrl] = useState(saya.baseUrl)
  const [replaces, setReplaces] = useState(saya.replaces)
  const [repl1, setRepl1] = useState("")
  const [repl2, setRepl2] = useState("")
  return (
    <form
      className="m-4"
      onSubmit={(e) => {
        e.preventDefault()
        setSaya({
          baseUrl: url || undefined,
          replaces,
        })
      }}
    >
      <label className="mb-2 block">
        <span>Saya の URL</span>
        <input
          type="text"
          placeholder="https://saya"
          className="block mt-2 form-input rounded-md w-full text-gray-900"
          value={url || ""}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <label className="mb-2 block">
        <span>放送波置換設定</span>
        <div className="flex flex-wrap space-x-2">
          {(replaces || []).map(([before, after], idx) => (
            <div
              className="mt-2 p-1 px-2 bg-gray-200 text-gray-800 rounded-md flex space-x-1 items-center justify-center"
              key={idx}
            >
              <span>
                {before}→{after}
              </span>
              <span
                className="flex items-center justify-center bg-gray-200 rounded-md"
                onClick={() => {
                  const copied = Object.assign([], replaces)
                  ;(copied as (string | null)[])[idx] = null
                  setReplaces(copied.filter((s) => !!s))
                }}
              >
                <X size={16} />
              </span>
            </div>
          ))}
        </div>
        <datalist id="serviceTypes">
          <option value="GR"></option>
          <option value="BS"></option>
          <option value="CS"></option>
          <option value="SKY"></option>
        </datalist>
        <div className="flex space-x-2 mt-4">
          <input
            type="text"
            placeholder="SKY"
            className="block mt-2 form-input rounded-md w-full text-gray-900"
            value={repl1}
            onChange={(e) => setRepl1(e.target.value)}
            list="serviceTypes"
          />
          <input
            type="text"
            placeholder="GR"
            className="block mt-2 form-input rounded-md w-full text-gray-900"
            value={repl2}
            onChange={(e) => setRepl2(e.target.value)}
            list="serviceTypes"
          />
          <button
            type="button"
            className="mt-2 px-4 flex items-center justify-center text-gray-900 bg-gray-200 rounded-md"
            onClick={() => {
              setReplaces((replaces) => [...replaces, [repl1, repl2]])
            }}
            disabled={!repl1 || !repl2}
          >
            <Plus size={16} />
          </button>
        </div>
      </label>
      <button
        type="submit"
        className="bg-gray-100 text-gray-800 p-2 px-2 my-4 rounded-md"
      >
        保存
      </button>
    </form>
  )
}
