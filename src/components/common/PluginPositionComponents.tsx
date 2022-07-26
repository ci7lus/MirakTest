import clsx from "clsx"
import React, { useEffect, useState } from "react"
import { useRecoilBridgeAcrossReactRoots_UNSTABLE } from "recoil"
import { ComponentWithPosition } from "../../types/plugin"
import { ComponentShadowWrapper } from "./ComponentShadowWrapper"

export const PluginPositionComponents: React.FC<{
  position: ComponentWithPosition["position"]
  isAbsolute?: boolean
}> = ({ position, isAbsolute = true }) => {
  const [components, setComponents] = useState<ComponentWithPosition[] | null>(
    null
  )
  const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE()
  useEffect(() => {
    const components =
      window.plugins
        ?.map((plugin) =>
          plugin.components.filter(
            (component) => component.position === position
          )
        )
        .flat() || []
    setComponents(components)
  }, [])
  if (components === null) return <></>
  return (
    <div className={clsx("w-full", "h-full", "relative")}>
      {components.map((component) => (
        <ComponentShadowWrapper
          _id={component.id}
          key={component.id}
          className={
            isAbsolute ? "absolute top-0 left-0 w-full h-full" : clsx("pt-2")
          }
          Component={() => (
            <RecoilBridge>
              <component.component />
            </RecoilBridge>
          )}
        />
      ))}
    </div>
  )
}
