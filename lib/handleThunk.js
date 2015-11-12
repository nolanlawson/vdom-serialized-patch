var isVNode = require("virtual-dom/vnode/is-vnode")
var isVText = require("virtual-dom/vnode/is-vtext")
var isWidget = require("virtual-dom/vnode/is-widget")
var isThunk = require("virtual-dom/vnode/is-thunk")

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