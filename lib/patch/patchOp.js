var applyProperties = require("./applyProperties")
var VPatch = require("./isVPatch")
var render = require('./createElement');

module.exports = applyPatch

function applyPatch(vpatch, domNode) {
  console.log('vpatch', vpatch);
  var type = vpatch[0]
  var patch = vpatch[1]
  var vNode = vpatch[2]

  switch (type) {
    case VPatch.REMOVE:
      return removeNode(domNode)
    case VPatch.INSERT:
      return insertNode(domNode, patch)
    case VPatch.VTEXT:
      return stringPatch(domNode, patch)
    case VPatch.VNODE:
      return vNodePatch(domNode, patch)
    case VPatch.ORDER:
      reorderChildren(domNode, patch)
      return domNode
    case VPatch.PROPS:
      applyProperties(domNode, patch, vNode.properties)
      return domNode
    default:
      return domNode
  }
}

function removeNode(domNode) {
  var parentNode = domNode.parentNode

  if (parentNode) {
    parentNode.removeChild(domNode)
  }

  return null
}

function insertNode(parentNode, vNode) {
  var newNode = render(vNode)

  if (parentNode) {
    parentNode.appendChild(newNode)
  }

  return parentNode
}

function stringPatch(domNode, vText) {
  var newNode

  if (domNode.nodeType === 3) {
    domNode.replaceData(0, domNode.length, vText.text)
    newNode = domNode
  } else {
    var parentNode = domNode.parentNode
    newNode = render(vText)

    if (parentNode && newNode !== domNode) {
      parentNode.replaceChild(newNode, domNode)
    }
  }

  return newNode
}

function vNodePatch(domNode, vNode) {
  var parentNode = domNode.parentNode
  var newNode = render(vNode)

  if (parentNode && newNode !== domNode) {
    parentNode.replaceChild(newNode, domNode)
  }

  return newNode
}

function reorderChildren(domNode, moves) {
  var childNodes = domNode.childNodes
  var keyMap = {}
  var node
  var remove
  var insert

  for (var i = 0; i < moves.removes.length; i++) {
    remove = moves.removes[i]
    node = childNodes[remove.from]
    if (remove.key) {
      keyMap[remove.key] = node
    }
    domNode.removeChild(node)
  }

  var length = childNodes.length
  for (var j = 0; j < moves.inserts.length; j++) {
    insert = moves.inserts[j]
    node = keyMap[insert.key]
    // this is the weirdest bug i've ever seen in webkit
    domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
  }
}