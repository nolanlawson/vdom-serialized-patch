var isObject = require('./isObject');

module.exports = applyProperties;

function applyProperties(node, props, previous) {
  ////console.log('applyProperties', node, props, previous);
  for (var propName in props) {
    var propValue = props[propName]

    if (propValue === undefined) {
      removeProperty(node, propName, previous);
    } else {
      if (isObject(propValue)) {
        patchObject(node, props, previous, propName, propValue);
      } else {
        node[propName] = propValue
      }
    }
  }
  ////console.log('appliedProperties', node);
}

function removeProperty(node, propName, previous) {
  //console.log('removeProperty');
  var previousValue = previous[propName]

  if (propName === "attributes") {
    for (var attrName in previousValue) {
      node.removeAttribute(attrName)
    }
  } else if (propName === "style") {
    for (var i in previousValue) {
      node.style[i] = ""
    }
  } else if (typeof previousValue === "string") {
    node[propName] = ""
  } else {
    node[propName] = null
  }
}

function patchObject(node, props, previous, propName, propValue) {
  ////console.log("patchObject", node, props, previous, propName, propValue);
  //console.log('node before', node.outerHTML);
  var previousValue = previous ? previous[propName] : undefined

  ////console.log('propName', propName);

  // Set attributes
  if (propName === "attributes") {
    for (var attrName in propValue) {
      var attrValue = propValue[attrName]

      if (attrValue === undefined) {
        node.removeAttribute(attrName)
      } else {
        node.setAttribute(attrName, attrValue)
      }
    }

    return
  }

  if (previousValue && isObject(previousValue) &&
    getPrototype(previousValue) !== getPrototype(propValue)) {
    node[propName] = propValue
    return
  }

  if (!isObject(node[propName])) {
    node[propName] = {}
  }

  var replacer = propName === "style" ? "" : undefined

  if (propName === 'style') {
    for (var k in propValue) {
      var value = propValue[k]
      //console.log('node', node);
      console.log('value', value);
      console.log('propName', propName);
      ////console.log('node[propName]', node[propName]);
      console.log("k", k);

      console.log('node', node);
      node.style[k] = (value === undefined) ? replacer : value
    }
  } else {

    ////console.log('propValue', propValue);
    for (var k in propValue) {
      var value = propValue[k]
      //console.log('node', node);
      //console.log('value', value);
      //console.log('propName', propName);
      ////console.log('node[propName]', node[propName]);
      //console.log("k", k);

      node[propName][k] = (value === undefined) ? replacer : value
    }
  }
  //console.log('node after', node.outerHTML);
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}
