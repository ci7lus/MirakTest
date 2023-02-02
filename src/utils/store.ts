import Store from "electron-store"
import pkg from "../../package.json"

const store = new Store<{}>({
  // @ts-expect-error workaround for conf's Project name could not be inferred. Please specify the `projectName` option.
  projectName: pkg.name,
})

export { store }
