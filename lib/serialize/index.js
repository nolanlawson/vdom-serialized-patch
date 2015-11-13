var patchTypes = require('../patchTypes');
var toJson = require('vdom-as-json/toJson');
var isObject = require('../patch/isObject');

// traverse the thing that the original patch structure called "a',
// i.e. the virtual tree representing the current node structure.
// this thing only really needs two properties - "children" and "count",
// so trim out everything else
function serializeCurrentNode(currentNode) {
  var children = currentNode.children;
  if (!children) {
    return null;
  }
  var len = children.length;
  var arr = new Array(len);
  var i = -1;
  while (++i < len) {
    arr[i] = serializeCurrentNode(children[i]);
  }
  if (currentNode.count) {
    return [arr, currentNode.count];
  } else {
    return [arr];
  }
}

function serializeVirtualPatchOrPatches(vPatch) {
  if (Array.isArray(vPatch)) {
    var len = vPatch.length;
    var res = new Array(len);
    var i = -1;
    while (++i < len) {
      res[i] = serializeVirtualPatch(vPatch[i]);
    }
    return res;
  }
  return [serializeVirtualPatch(vPatch)];
}

function serializeVirtualPatch(vPatch) {
  var type = vPatch.type;
  var res = [
    type,
    toJson(vPatch.patch)
  ];

  if (type === patchTypes.PROPS) {
    var toRemove = [];
    var toAdd = [];
    var objects = [];
    var props = vPatch.vNode.properties;
    // diff the props for a more efficient patch size (kinda surprised this
    // isn't done by vdom itself)
    for (var propName in props) {
      var propValue = props[propName];

      if (propValue === undefined) {
        toRemove.push(removeProperty(propName, props));
      } else {
        if (isObject(propValue)) {
          objects.push(patchObject(props, propName, vPatch.patch));
        } else {
          console.log('toAdd!');
          toAdd.push([propName, propValue]);
        }
      }
    }
    for (var key in vPatch.patch) {
      toAdd.push([key, vPatch.patch[key]]);
    }
    res.push({p: [toRemove, toAdd, objects]}); // 'p' === 'properties'
  }
  return res;
}

function removeProperty(propName, previous) {
  var previousValue = previous[propName]

  if (propName === "attributes") {
    return {
      attributes: previousValue
    };
  } else if (propName === "style") {
    return {
      style: previousValue
    };
  } else if (typeof previousValue === "string") {
    return {
      clearString: propName
    };
  } else {
    return {
      clearNull: propName
    };
  }
}

function patchObject(previous, propName, propValue) {
  var previousValue = previous ? previous[propName] : undefined

  console.log('previous', previous, 'propName', propName, 'propValue', propValue);

  // Set attributes
  if (propName === "attributes") {
    var attrs = {
      toRemove: [],
      toSet: []
    };
    for (var attrName in propValue) {
      var attrValue = propValue.attributes[attrName]

      if (attrValue === undefined) {
        attrs.remove.push(attrName);
      } else {
        attrs.set.push([attrName, attrValue]);
      }
    }
    return {attributes: attrs};
  }

  if (previousValue && isObject(previousValue) &&
    getPrototype(previousValue) !== getPrototype(propValue)) {
    return {
      setIt: [propName, propValue[propName]]
    }
  }

  return {
    setAll: [propName, propValue[propName]]
  };
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

module.exports = function (patch) {
  var outputRootNode = serializeCurrentNode(patch.a);

  var res = {
    a: outputRootNode
  };

  for (var key in patch) {
    if (key !== 'a') {
      res[key] = serializeVirtualPatchOrPatches(patch[key]);
    }
  }

  console.log('patch', patch);
  console.log('res', res);

  return res;
};
