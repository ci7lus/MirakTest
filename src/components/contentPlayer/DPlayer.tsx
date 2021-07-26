// eslint-disable-next-line import/no-unresolved
import DPlayer, { DPlayerEvents } from "dplayer"
import React, { memo, useEffect, useRef } from "react"
import { useRecoilValue } from "recoil"
import { contentPlayerCommentOpacity } from "../../atoms/contentPlayer"
import { CommentPayload } from "../../types/struct"
import { trimCommentForFlow } from "../../utils/comment"

export const CoiledDPlayerWrapper: React.VFC<{
  comment: CommentPayload | null
}> = memo(({ comment }) => {
  const dplayerElementRef = useRef<HTMLDivElement>(null)
  const player = useRef<DPlayer | null>()

  const danmaku = {
    id: "mirakutest",
    user: "mirakutest",
    api: "",
    bottom: "10%",
    unlimited: true,
  }

  const commentOpacity = useRecoilValue(contentPlayerCommentOpacity)

  useEffect(() => {
    if (!player.current) return
    player.current.danmaku.opacity(commentOpacity)
  }, [commentOpacity])

  useEffect(() => {
    const playerRef = player.current
    if (
      !playerRef ||
      !comment ||
      playerRef.video.paused === true ||
      comment.text.startsWith("RT ")
    ) {
      return
    }
    const commentText = trimCommentForFlow(comment.text)
    if (commentText.trim().length === 0) return
    const payload = { ...comment, text: commentText }
    if (comment.source.startsWith("5ch")) {
      setTimeout(() => playerRef.danmaku.draw(payload), comment.timeMs || 0)
    } else {
      playerRef.danmaku.draw(payload)
    }
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
      } as never,
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
      hotkey: false,
    })

    playerInstance.danmaku.opacity(commentOpacity)
    playerInstance.danmaku.show()

    playerInstance.on("pause" as DPlayerEvents.pause, () => {
      playerInstance.play()
    })

    player.current = playerInstance
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
})
