import React, { useEffect, useState } from "react"

export const Splash: React.FC<{}> = ({ children }) => {
  const [opacity, setOpacity] = useState(0)
  useEffect(() => {
    setOpacity(100)
  }, [])
  return (
    <div className="overflow-hidden select-none">
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center justify-center space-x-8 mr-4">
            <img width="100px" src="./assets/miraktest_logo.png" />
            <img width="200px" src="./assets/miraktest_text.svg" />
          </div>
          {children && (
            <div
              className="pl-6 text-gray-100 transition-all duration-300 ease-in-out"
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
