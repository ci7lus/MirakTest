import fs from "fs"
import axios from "axios"
import pkg from "./package.json"

const main = async () => {
  const dts = await fs.promises.readFile("./dist/plugin.d.ts", "utf8")
  const license = await fs.promises.readFile(`./LICENSE`, "utf8")
  const licenses = ["MirakTest: " + license]
  const libs = ["electron"]
  for (const lib of libs) {
    const license = await fs.promises.readFile(
      `./node_modules/${lib}/LICENSE`,
      "utf8"
    )
    licenses.push(`${lib}: ${license}`)
  }
  const mirakurunLicense = await axios.get(
    "https://raw.githubusercontent.com/Chinachu/Mirakurun/0f7290b017bd6c80904dc8c253801f2556733377/LICENSE",
    { responseType: "text" }
  )
  licenses.push(`Mirakurun: ${mirakurunLicense.data}`)
  const rewrited = `/* eslint-disable */\n/** plugin.d.ts - Type definitions for creating plug-ins for ${
    pkg.productName
  }.\n---\n${licenses.join("\n---\n")}\n*/\n${dts}`
  await fs.promises.writeFile("./dist/plugin.d.ts", rewrited)
}
main()
