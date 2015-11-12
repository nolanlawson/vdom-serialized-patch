'use strict';

var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var serialize = require('../lib/serialize');
var applyPatch = require('../lib/patch');
var chai = require('chai');
var vdomToHtml = require('vdom-to-html');
var applyPatchOriginal = require('virtual-dom/patch');
chai.should();

describe('test suite', function () {

  function renderCount(count) {
    return h('div', {
      style: {
        textAlign: 'center',
        lineHeight: (100 + count) + 'px',
        border: '1px solid red',
        width: (100 + count) + 'px',
        height: (100 + count) + 'px'
      }
    }, [String(count)]);
  }

  function createTestElement(node) {
    var parent = document.createElement('div');
    parent.innerHTML = vdomToHtml(node);
    document.body.appendChild(parent);

    return parent;
  }

  it('should apply a patch', function () {
    var nodeA = renderCount(0);
    var nodeB = renderCount(1);
    var patch1 = diff(nodeA, nodeB);
    var serializedPatch = serialize(patch1);

    var parent = createTestElement(nodeA);

    applyPatchOriginal(parent.children[0], patch1);

    var leftHTML = parent.innerHTML;

    console.log(leftHTML);

    parent = createTestElement(nodeA);
    applyPatch(parent.children[0], serializedPatch);

    var rightHTML = parent.innerHTML;

    console.log(rightHTML);

    leftHTML.should.equal(rightHTML);
  });

});