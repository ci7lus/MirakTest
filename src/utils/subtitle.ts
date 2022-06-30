import { CanvasProviderOption } from "aribb24.js"

export const getAribb24Configuration = (
  args: Partial<CanvasProviderOption>
): CanvasProviderOption => ({
  useStroke: true,
  keepAspectRatio: true,
  drcsReplacement: true,
  ...args,
})
