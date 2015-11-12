function traverse(currentNode) {
  var children = currentNode.children;
  if (!children) {
    return currentNode;
  }
  var len = children.length;
  var arr = new Array(len);
  var i = -1;
  while (++i < len) {
    arr[i] = traverse(children[i]);
  }
  if (currentNode.count) {
    return [arr, currentNode.count];
  } else {
    return [arr];
  }
}

module.exports = function (patch) {
  var outputRootNode = traverse(patch.a);

  var res = {
    a: outputRootNode
  };

  console.log('patch.a', patch.a);
  console.log('outputRootNode', outputRootNode);

  for (var key in patch) {
    if (key !== 'a') {
      res[key] = patch[key];
    }
  }

  console.log('res', res);

  return res;
};