import { CanvasProvider } from "aribb24.js"

type ProviderOption = Exclude<
  Parameters<CanvasProvider["render"]>[0],
  undefined
>

export const getAribb24Configuration = (
  args: Partial<ProviderOption>
): ProviderOption => ({
  useStroke: true,
  keepAspectRatio: true,
  drcsReplacement: true,
  ...args,
})
