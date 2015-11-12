var applyProperties = require("./applyProperties")
var isVText = require('./isVText');
var isVNode = require('./isVNode');

module.exports = createElement;

function createElement(vnode) {
  console.log('render', vnode);
  var doc = document;

  console.log('isVText?', isVText(vnode));
  if (isVText(vnode)) {
    console.log('vnode.x', vnode.x);
    console.log('RETURNING TEXT NODE!!!!!!!');
    return doc.createTextNode(vnode.x) // 'x' means 'text'
  } else if (!isVNode(vnode)) {
    console.log('RETURNING NULL!!!!!!!');
    return null
  }

  console.log('vnode.tn', vnode.tn);

  var node = (vnode.n === null) ? // 'n' === 'namespace'
    doc.createElement(vnode.tn) : // 'tn' === 'tagName'
    doc.createElementNS(vnode.ns, vnode.tn)

  var props = vnode.p // 'p' === 'properties'
  console.log('props', props);
  console.log('props', vnode.p);
  applyProperties(node, props)

  console.log('vnode.p', vnode.p);
  console.log('vnode.c', vnode.c);

  var children = vnode.c // 'c' === 'children'

  console.log('children', children);

  for (var i = 0; i < children.length; i++) {
    var childNode = createElement(children[i])
    if (childNode) {
      node.appendChild(childNode)
    }
  }

  console.log('rendered', node);

  return node
}
