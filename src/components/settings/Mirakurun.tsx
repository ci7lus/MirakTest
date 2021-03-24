import React, { useState } from "react"
import { useRecoilState } from "recoil"
import { mirakurunSetting } from "../../atoms/settings"

export const MirakurunSettingForm: React.VFC<{}> = () => {
  const [mirakurun, setMirakurun] = useRecoilState(mirakurunSetting)
  const [url, setUrl] = useState(mirakurun.baseUrl)
  const [username, setUsername] = useState(mirakurun.username)
  const [password, setPassword] = useState(mirakurun.password)
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  return (
    <form
      className="m-4"
      onSubmit={(e) => {
        e.preventDefault()
        setMirakurun({
          baseUrl: url || undefined,
          username: username || undefined,
          password: password || undefined,
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
      <div className="mt-2 text-lg">Basic 認証設定</div>
      <label className="mb-2 block">
        <span>ユーザー名</span>
        <input
          type="text"
          placeholder="mirakurun"
          className="block mt-2 form-input rounded-md w-full text-gray-900"
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label className="mb-2 block">
        <span>パスワード</span>
        <input
          type={isPasswordHidden ? "password" : "text"}
          placeholder="**********"
          className="block mt-2 form-input rounded-md w-full text-gray-900"
          value={password || ""}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setIsPasswordHidden(false)}
          onBlur={() => setIsPasswordHidden(true)}
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
