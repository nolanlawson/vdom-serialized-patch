var VPatch = require("../patch/isVPatch");

// traverse the thing that the original patch structure called "a',
// i.e. the virtual tree representing the current node structure.
// this thing only really needs two properties - "children" and "count",
// so trim out everything else
function serializeCurrentNode(currentNode) {
  var children = currentNode.children;
  if (!children) {
    return currentNode;
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
    vPatch.patch
  ];

  if (type === VPatch.PROPS) {
    // this is the only time the vNode is needed
    res.push({properties: vPatch.vNode.properties});
  }
  return res;
}

module.exports = function (patch) {
  var outputRootNode = serializeCurrentNode(patch.a);

  var res = {
    a: outputRootNode
  };

  console.log('patch', patch);
  console.log('outputRootNode', outputRootNode);

  for (var key in patch) {
    if (key !== 'a') {
      res[key] = serializeVirtualPatchOrPatches(patch[key]);
    }
  }

  console.log('res', res);

  return res;
};