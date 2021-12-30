Promise.all(
  Array.from(openedPlugins.keys()).map(async (fileName) => {
    await setupPlugin(fileName)
  })
)
