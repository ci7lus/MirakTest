import clsx from "clsx"
import React, { useEffect, useState } from "react"

export const Splash: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [opacity, setOpacity] = useState(0)
  useEffect(() => {
    setOpacity(1)
  }, [])
  return (
    <div
      className={clsx(
        "overflow-hidden",
        "select-none",
        !children && "app-region-drag"
      )}
    >
      <div
        className={clsx(
          "w-full",
          "h-screen",
          "flex",
          "items-center",
          "justify-center"
        )}
      >
        <div
          className={clsx(
            "flex",
            "flex-col",
            "items-center",
            "justify-center",
            "space-y-4"
          )}
        >
          <div
            className={clsx(
              "flex",
              "items-center",
              "justify-center",
              "space-x-6",
              "mr-4",
              "transition-opacity",
              "duration-1000",
              "ease-out"
            )}
            style={{ opacity: 1.7 - opacity }}
          >
            <img
              style={{ width: "8vw", maxWidth: "100px", minWidth: "40px" }}
              src="./assets/miraktest_logo.png"
            />
            <img
              style={{ width: "16vw", maxWidth: "200px", minWidth: "80px" }}
              src="./assets/miraktest_text.svg"
            />
          </div>
          {children && (
            <div
              className={clsx(
                "pl-6",
                "text-gray-100",
                "transition-all",
                "duration-300",
                "ease-in-out"
              )}
              style={{ opacity }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
