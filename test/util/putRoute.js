module.exports = function _putRoute (router, path, dataValue) {
  router.insert({
    path: path,
    data: dataValue
  })
}
