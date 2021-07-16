import fs from "fs"
import pkg from "./package.json"

const main = async () => {
  const sha1 = process.env.SHA1
  if (!sha1) throw new Error("no sha1")
  const [version, after] = pkg.version.split("-")
  let [prerelease, metadata] = (after || "").split("+")
  prerelease = "nightly"
  metadata = sha1.slice(0, 7)
  const newVersion = `${version}-${prerelease}+${metadata}`
  console.info(newVersion)
  pkg.version = newVersion
  await fs.promises.writeFile("./package.json", JSON.stringify(pkg))
}
main()
