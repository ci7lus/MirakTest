module.exports = Promise.all(
  Array.from(globalThis.openedPlugins.keys()).map(async (fileName) => {
    await globalThis.setupPlugin(fileName)
  })
)
