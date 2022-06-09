import fs from "fs"
import pkg from "./package.json"

const main = async () => {
  const sha1 = process.env.SHA1
  if (!sha1) throw new Error("no sha1")
  const yml = await fs.promises.readFile("./electron-builder.yml", "utf8")
  if (yml.includes("buildVersion"))
    throw new Error("already buildVersion included")
  let buildVersion: string
  if (process.env.OS === "Windows") {
    const [version] = pkg.version.split("-")
    buildVersion = `${version}.${sha1.slice(0, 7)}`
  } else {
    buildVersion = sha1.slice(0, 7)
  }
  const rewrited = yml.replace(
    "productName: MirakTest",
    `productName: MirakTest\nbuildVersion: "${buildVersion}"`
  )
  await fs.promises.writeFile("./electron-builder.yml", rewrited)
}
main()
