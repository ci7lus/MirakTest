import React, { useEffect, useRef } from "react"
import DPlayer, { DPlayerEvents } from "dplayer"
import { CommentPayload } from "../../types/struct"
import { trimCommentForFlow } from "../../utils/comment"
import { useRecoilValue } from "recoil"
import { mainPlayerCommentOpacity } from "../../atoms/mainPlayer"

export const DPlayerWrap: React.VFC<{
  comment: CommentPayload | null
}> = ({ comment }) => {
  const dplayerElementRef = useRef<HTMLDivElement>(null)
  const player = useRef<DPlayer | null>()

  const danmaku = {
    id: "mirakutest",
    user: "mirakutest",
    api: "",
    bottom: "10%",
    unlimited: true,
  }

  const commentOpacity = useRecoilValue(mainPlayerCommentOpacity)

  useEffect(() => {
    if (!player.current) return
    player.current.danmaku.opacity(commentOpacity)
  }, [commentOpacity])

  useEffect(() => {
    if (!player.current || !comment || player.current.video.paused === true)
      return
    const commentText = trimCommentForFlow(comment.text)
    if (commentText.trim().length === 0) return
    const payload = { ...comment, text: commentText }
    player.current.danmaku.draw(payload)
  }, [comment])

  useEffect(() => {
    const playerInstance = new DPlayer({
      container: dplayerElementRef.current,
      live: true,
      autoplay: true,
      screenshot: true,
      video: {
        url: "./assets/blank.mp4",
      },
      danmaku,
      lang: "ja-jp",
      subtitle: {
        type: "webvtt",
        fontSize: "20px",
        color: "#fff",
        bottom: "40px",
        // TODO: Typing correctly
      } as any,
      apiBackend: {
        read: (option) => {
          option.success([{}])
        },
        send: (option, item, callback) => {
          callback()
        },
      },
      contextmenu: [],
      loop: true,
      volume: 0,
    })

    playerInstance.danmaku.opacity(commentOpacity)

    playerInstance.on("pause" as DPlayerEvents.pause, () => {
      playerInstance.play()
    })

    player.current = playerInstance
    // @ts-ignore
    window.dplayer = playerInstance

    const timer = setInterval(() => {
      playerInstance.video.currentTime = 0
    }, 30 * 1000)
    return () => {
      player.current?.destroy()
      player.current = null
      clearInterval(timer)
    }
  }, [])

  return (
    <>
      <style>{`.dplayer {
  pointer-events: none;
}

.dplayer-notice,
.dplayer-controller-mask,
.dplayer-controller,
.dplayer-video-current,
button.dplayer-mobile-icon.dplayer-mobile-play {
  display: none !important;
}

.dplayer-danmaku {
  width: 100%;
  height: 100vh;
}

.dplayer-video-wrap {
  background: unset;
  height: 100vh;
}
`}</style>
      <div ref={dplayerElementRef}></div>
    </>
  )
}
