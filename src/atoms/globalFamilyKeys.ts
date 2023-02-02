import pkg from "../../package.json"

const prefix = `${pkg.name}.global`

export const globalContentPlayerPlayingContentFamilyKey = `${prefix}.playingContent`

export const globalContentPlayerSelectedServiceFamilyKey = `${prefix}.selectedService`

export const globalContentPlayerIsPlayingFamilyKey = `${prefix}.isPlaying`
