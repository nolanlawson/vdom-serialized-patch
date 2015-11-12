var applyProperties = require("./applyProperties")
var isVText = require('./isVText');
var isVNode = require('./isVNode');

module.exports = createElement;

function createElement(vnode) {
  var doc = document;

  if (isVText(vnode)) {
    return doc.createTextNode(vnode.text)
  } else if (!isVNode(vnode)) {
    return null
  }

  var node = (vnode.namespace === null) ?
    doc.createElement(vnode.tagName) :
    doc.createElementNS(vnode.namespace, vnode.tagName)

  var props = vnode.properties
  applyProperties(node, props)

  var children = vnode.children

  for (var i = 0; i < children.length; i++) {
    var childNode = createElement(children[i])
    if (childNode) {
      node.appendChild(childNode)
    }
  }

  return node
}
