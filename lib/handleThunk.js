var isVNode = require("./isVNode")
var isVText = require("./isVText")
var isWidget = require("./isWidget")
var isThunk = require("./isThunk")

module.exports = handleThunk

function handleThunk(a, b) {
  var renderedA = a
  var renderedB = b

  if (isThunk(b)) {
    renderedB = renderThunk(b, a)
  }

  if (isThunk(a)) {
    renderedA = renderThunk(a, null)
  }

  return {
    a: renderedA,
    b: renderedB
  }
}

function renderThunk(thunk, previous) {
  var renderedThunk = thunk.vnode

  if (!renderedThunk) {
    renderedThunk = thunk.vnode = thunk.render(previous)
  }

  if (!(isVNode(renderedThunk) ||
    isVText(renderedThunk) ||
    isWidget(renderedThunk))) {
    throw new Error("thunk did not return a valid node");
  }

  return renderedThunk
}