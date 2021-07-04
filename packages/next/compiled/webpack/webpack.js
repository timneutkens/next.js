exports.__esModule = true

exports.isWebpack5 = false

exports.default = undefined

let initializedWebpack5 = false
let initializedWebpack4 = false
let initFns = []
exports.init = function () {
  Object.assign(exports, require('./bundle5')())
  exports.isWebpack5 = true
  if (!initializedWebpack5) for (const cb of initFns) cb()
  initializedWebpack5 = true
}

exports.onWebpackInit = function (cb) {
  if (initializedWebpack5 || initializedWebpack4) cb()
  else initFns.push(cb)
}
