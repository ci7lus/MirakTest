import fs from "fs"

const main = async () => {
  const sha1 = process.env.SHA1
  if (!sha1) throw new Error("no sha1")
  const yml = await fs.promises.readFile("./electron-builder.yml", "utf8")
  if (yml.includes("buildVersion"))
    throw new Error("already buildVersion included")
  const rewrited = yml.replace(
    "productName: MirakTest",
    `productName: MirakTest\nbuildVersion: ${sha1}`
  )
  await fs.promises.writeFile("./electron-builder.yml", rewrited)
}
main()
