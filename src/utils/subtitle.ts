import { CanvasProviderOption } from "aribb24.js"
import drcsReplaceMapping from "../constants/drcs-mapping.json"

export const getAribb24Configuration = (
  args: Partial<CanvasProviderOption>
): CanvasProviderOption => ({
  useStroke: true,
  keepAspectRatio: true,
  drcsReplacement: true,
  drcsReplaceMapping,
  ...args,
})
