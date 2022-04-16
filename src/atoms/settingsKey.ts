import pkg from "../../package.json"

const prefix = `${pkg.name}.settings`

export const screenshotSettingAtomKey = `${prefix}.screenshot`

export const experimentalSettingAtomKey = `${prefix}.experimental`
