import { Transition } from "@headlessui/react"
import React from "react"
import { X } from "react-feather"
import { MainPlayerRoute } from "../types/mainPlayer"
import { Settings } from "./Settings"

export const VirtualWindowComponent: React.VFC<{
  route: MainPlayerRoute
  setRoute: (r: MainPlayerRoute) => unknown
}> = ({ route, setRoute }) => {
  return (
    <Transition
      show={route !== null}
      enter="transition-opacity duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="w-full h-full p-8 relative flex flex-col justify-center pointer-events-auto">
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"
          onClick={() => setRoute(null)}
        ></div>
        <div className="absolute p-2 right-0 top-0 z-20">
          <button
            type="button"
            className="rounded-full bg-gray-100 text-gray-900 focus:outline-none cursor-pointer"
            onClick={() => setRoute(null)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="relative z-20">
          <VirtualWindowRouter route={route} />
        </div>
      </div>
    </Transition>
  )
}

const VirtualWindowRouter: React.VFC<{ route: MainPlayerRoute }> = ({
  route,
}) => {
  if (route === "settings") {
    return <Settings />
  } else {
    return <></>
  }
}
