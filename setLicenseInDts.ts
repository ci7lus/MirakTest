import fs from "fs"

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
  const rewrited = `/* eslint-disable */\n/** plugin.d.ts - Type definitions for creating plug-ins for MirakTest.\n---\n${licenses.join(
    "\n---\n"
  )}\n*/\n${dts}`
  await fs.promises.writeFile("./dist/plugin.d.ts", rewrited)
}
main()
