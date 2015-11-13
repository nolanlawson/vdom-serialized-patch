var isObject = require('./isObject');

module.exports = applyProperties;

function applyProperties(node, props, previous) {
  console.log('props', props);
  var toRemove = previous[0];
  var toAdd = previous[1];
  var objects = previous[2];

  toRemove.forEach(function (remove) {
    console.log('remove', remove);
    removeProperty(node, remove);
  });

  toAdd.forEach(function (addable) {
    console.log('add', addable);
    node[addable[0]] = addable[1];
  });

  objects.forEach(function (objectPatch) {
    console.log('objectPatch', objectPatch);
    patchObject(node, objectPatch);
  });
}

function removeProperty(node, removable) {
  if (removable.attributes) {
    for (var attrName in removable.attributes) {
      node.removeAttribute(attrName)
    }
  } else if (removable.style) {
    for (var i in removable.style) {
      node.style[i] = ""
    }
  } else if (removable.clearString) {
    node[propName] = ""
  } else {
    node[propName] = null
  }
}

function patchObject(node, objectPatch) {
  console.log('objectPatch', objectPatch);
  // Set attributes
  if (objectPatch.attributes) {

    objectPatch.attributes.toRemove.forEach(function (attrName) {
      node.removeAttribute(attrName);
    });
    objectPatch.attributes.toSet.forEach(function (settable) {
      node.setAttribute(settable[0], settable[1]);
    });
    return
  }

  if (objectPatch.setIt) {
    node[objectPatch.setIt[0]] = objectPatch.setIt[1];
    return;
  }

  var propName = objectPatch.setAll[0];
  var propValue = objectPatch.setAll[1];

  if (!isObject(node[propName])) {
    node[propName] = {}
  }

  var replacer = propName === "style" ? "" : undefined;

  console.log('propName', propName, 'propValue', propValue);

  for (var k in propValue) {
    var value = propValue[k];
    node[propName][k] = (value === undefined) ? replacer : value;
  }
}