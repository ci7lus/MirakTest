import Store from "electron-store"
import pkg from "../../package.json"

const store = new Store<{}>({
  // workaround for conf's Project name could not be inferred. Please specify the `projectName` option.
  // @ts-ignore
  projectName: pkg.name,
})

export { store }
