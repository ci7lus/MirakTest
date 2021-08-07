import * as $ from "zod"

export const pluginValidator = $.object({
  id: $.string(),
  name: $.string(),
  shortName: $.string().optional(),
  version: $.string(),
  author: $.string(),
  description: $.string(),
  url: $.string().optional(),
  setup: $.function(),
  destroy: $.function(),
  exposedAtoms: $.array($.any()),
  sharedAtoms: $.array($.any()),
  storedAtoms: $.array($.any()),
  components: $.array($.any()),
  windows: $.object({}),
  contextMenu: $.object({}).optional(),
  appMenu: $.object({}).optional(),
})
