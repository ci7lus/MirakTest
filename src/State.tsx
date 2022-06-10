import React from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { RecoilRoot } from "recoil"
import { Router } from "./Router"
import { PluginPositionComponents } from "./components/common/PluginPositionComponents"
import { RecoilSharedSync } from "./components/global/RecoilSharedSync"
import { RecoilStoredSync } from "./components/global/RecoilStoredSync"
import { ObjectLiteral } from "./types/struct"
import { initializeState } from "./utils/recoil"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export const StateRoot: React.FC<{
  states: ObjectLiteral
  fonts: string[]
}> = ({ states, fonts }) => {
  return (
    <RecoilRoot
      initializeState={initializeState({
        states,
        fonts,
      })}
    >
      <RecoilStoredSync />
      <RecoilSharedSync initialStates={states} />
      <QueryClientProvider client={queryClient}>
        <div className="w-full h-full relative">
          <div
            id="OnBackgroundComponents"
            className="absolute top-0 left-0 w-full h-full pointer-events-none hidden"
          >
            <PluginPositionComponents position="onBackground" />
          </div>
          <Router />
        </div>
      </QueryClientProvider>
    </RecoilRoot>
  )
}
