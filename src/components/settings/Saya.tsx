import React, { useState } from "react"
import { useRecoilState } from "recoil"
import { sayaSetting } from "../../atoms/settings"

export const SayaSettingForm: React.VFC<{}> = () => {
  const [saya, setSaya] = useRecoilState(sayaSetting)
  const [url, setUrl] = useState(saya.baseUrl)
  const [secure, setSecure] = useState(saya.secure)
  return (
    <form
      className="m-4"
      onSubmit={(e) => {
        e.preventDefault()
        setSaya({
          baseUrl: url || undefined,
          secure: secure,
        })
        console.log(url, secure)
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
        <span>wss://</span>
        <input
          type="checkbox"
          className="block mt-2 form-checkbox"
          checked={secure || false}
          onChange={() => setSecure((secure) => !secure)}
        />
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
