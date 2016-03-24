'use strict';

var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var serialize = require('../lib/serialize');
var applyPatch = require('../lib/patch');
var chai = require('chai');
var vdomToHtml = require('vdom-to-html');
var applyPatchOriginal = require('virtual-dom/patch');
chai.should();

if (!process.browser) {
  var jsdom = require('jsdom').jsdom;
  global.document = jsdom('<html><body></body></html>');
}

function Thunk(str){
  this.str = str;
}
function renderThunk(){
  return h("div", this.str);
}
Thunk.prototype.type = "Thunk";
Thunk.prototype.render = renderThunk;

var structures = [
  h("div", "hello"),
  h("div", [h("span", "goodbye")]),
  h("div", "goodbye"),
  h("div", [h("span", "hello"), h("span", "again")]),
  h("div", h("div")),
  h("div", "text"),
  h("p", "more text"),
  h("div", [
    h("span", "text"),
    h("div.widgetContainer", [
      h("div", [
        h("span", "text"),
        h("div.widgetContainer", []),
        h("p", "more text")
      ]),
    ]),
    h("p", "more text")
  ]),
  h('div.foo#some-id', [
    h('span', 'some text'),
    h('input', {type: 'text', value: 'foo'})
  ]),
  h('h1', 'hello!'),
  h('a', {href: 'https://npm.im/hyperscript'}, 'hyperscript'),
  h('h1.fun', {style: {'font-family': 'Comic Sans MS'}}, 'Happy Birthday!'),
  h('input', {type: 'number'}, 1),
  h('input', {type: 'number', value: 1}),
  h('input', {type: 'number'}),
  h('div', {attributes: {
    'data-something': 1,
    'data-something-else': true,
    'data-another-thing': null
  }}),
  h('div', {attributes: {
    'data-something-else': true,
    'data-another-thing': null
  }}),
  h('div', {attributes: {
    'data-something': 5,
    'data-something-else': true,
    'data-another-thing': null,
    'data-hey-again': 'foo'
  }}),
  h('div', {style: {
    'font-weight': 'bold'
  }}),
  h('div', {style: {
    'font-weight': 'normal'
  }}),
  h('div', {style: {
  }}),
  h('div', {style: {
    'font-weight': 'normal',
    'font-size': '12px'
  }}),
  h('div', {style: {
    'font-weight': 'normal',
    'font-size': '12px',
    'color': 'white'
  }}),
  h('div', {key: 'something'}),
  h('div', {style: {background: 'blue', color: 'red'}}),
  h('div', {}),
  h('input', {type: 'text', value: 'SoftSetHook'}),
  new Thunk("thunktest")
];

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

  it('should apply a basic patch', function () {
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

  structures.forEach(function (structure1, i) {

    function testAgainst(structure2) {
      return function () {
        var nodeA = structure1;
        var nodeB = structure2;

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
      };
    }

    for (var j = i + 1; j < structures.length; j++) {
      var structure2 = structures[j];
      var testName = 'test diff: ' + i + 'vs' + j;

      it(testName, testAgainst(structure2));
    }
  });

});
