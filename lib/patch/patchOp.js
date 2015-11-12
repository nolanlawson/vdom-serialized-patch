var applyProperties = require("./applyProperties")
var patchRecursive = require('./patchOp');
var isWidget = require("./isWidget")
var VPatch = require("./isVPatch")
var render = require('./createElement');

module.exports = applyPatch

function applyPatch(vpatch, domNode) {
  var type = vpatch.type
  var vNode = vpatch.vNode
  var patch = vpatch.patch

  switch (type) {
    case VPatch.REMOVE:
      return removeNode(domNode, vNode)
    case VPatch.INSERT:
      return insertNode(domNode, patch)
    case VPatch.VTEXT:
      return stringPatch(domNode, vNode, patch)
    case VPatch.WIDGET:
      return widgetPatch(domNode, vNode, patch)
    case VPatch.VNODE:
      return vNodePatch(domNode, vNode, patch)
    case VPatch.ORDER:
      reorderChildren(domNode, patch)
      return domNode
    case VPatch.PROPS:
      applyProperties(domNode, patch, vNode.properties)
      return domNode
    case VPatch.THUNK:
      return replaceRoot(domNode,
        patchRecursive(domNode, patch))
    default:
      return domNode
  }
}

function removeNode(domNode, vNode) {
  var parentNode = domNode.parentNode

  if (parentNode) {
    parentNode.removeChild(domNode)
  }

  destroyWidget(domNode, vNode);

  return null
}

function insertNode(parentNode, vNode) {
  var newNode = render(vNode)

  if (parentNode) {
    parentNode.appendChild(newNode)
  }

  return parentNode
}

function stringPatch(domNode, leftVNode, vText) {
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

function widgetPatch(domNode, leftVNode, widget) {
  var updating = updateWidget(leftVNode, widget)
  var newNode

  if (updating) {
    newNode = widget.update(leftVNode, domNode) || domNode
  } else {
    newNode = render(widget)
  }

  var parentNode = domNode.parentNode

  if (parentNode && newNode !== domNode) {
    parentNode.replaceChild(newNode, domNode)
  }

  if (!updating) {
    destroyWidget(domNode, leftVNode)
  }

  return newNode
}

function vNodePatch(domNode, leftVNode, vNode) {
  var parentNode = domNode.parentNode
  var newNode = render(vNode)

  if (parentNode && newNode !== domNode) {
    parentNode.replaceChild(newNode, domNode)
  }

  return newNode
}

function destroyWidget(domNode, w) {
  if (typeof w.destroy === "function" && isWidget(w)) {
    w.destroy(domNode)
  }
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

function replaceRoot(oldRoot, newRoot) {
  if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
    oldRoot.parentNode.replaceChild(newRoot, oldRoot)
  }

  return newRoot;
}
