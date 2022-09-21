'use strict';var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _ExportMap = require('../ExportMap');var _ExportMap2 = _interopRequireDefault(_ExportMap);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);
var _arrayIncludes = require('array-includes');var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);
var _arrayPrototype = require('array.prototype.flatmap');var _arrayPrototype2 = _interopRequireDefault(_arrayPrototype);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

/*
                                                                                                                                                                                                                        Notes on TypeScript namespaces aka TSModuleDeclaration:
                                                                                                                                                                                                                        
                                                                                                                                                                                                                        There are two forms:
                                                                                                                                                                                                                        - active namespaces: namespace Foo {} / module Foo {}
                                                                                                                                                                                                                        - ambient modules; declare module "eslint-plugin-import" {}
                                                                                                                                                                                                                        
                                                                                                                                                                                                                        active namespaces:
                                                                                                                                                                                                                        - cannot contain a default export
                                                                                                                                                                                                                        - cannot contain an export all
                                                                                                                                                                                                                        - cannot contain a multi name export (export { a, b })
                                                                                                                                                                                                                        - can have active namespaces nested within them
                                                                                                                                                                                                                        
                                                                                                                                                                                                                        ambient namespaces:
                                                                                                                                                                                                                        - can only be defined in .d.ts files
                                                                                                                                                                                                                        - cannot be nested within active namespaces
                                                                                                                                                                                                                        - have no other restrictions
                                                                                                                                                                                                                        */

var rootProgram = 'root';
var tsTypePrefix = 'type:';

/**
                             * Detect function overloads like:
                             * ```ts
                             * export function foo(a: number);
                             * export function foo(a: string);
                             * export function foo(a: number|string) { return a; }
                             * ```
                             * @param {Set<Object>} nodes
                             * @returns {boolean}
                             */
function isTypescriptFunctionOverloads(nodes) {
  var nodesArr = Array.from(nodes);
  var types = new Set(nodesArr.map(function (node) {return node.parent.type;}));

  var idents = (0, _arrayPrototype2['default'])(nodesArr, function (node) {return (
      node.declaration && (
      node.declaration.type === 'TSDeclareFunction' // eslint 6+
      || node.declaration.type === 'TSEmptyBodyFunctionDeclaration' // eslint 4-5
      ) ?
      node.declaration.id.name :
      []);});

  if (new Set(idents).size !== idents.length) {
    return true;
  }

  if (!types.has('TSDeclareFunction')) {
    return false;
  }
  if (types.size === 1) {
    return true;
  }
  if (types.size === 2 && types.has('FunctionDeclaration')) {
    return true;
  }
  return false;
}

/**
   * Detect merging Namespaces with Classes, Functions, or Enums like:
   * ```ts
   * export class Foo { }
   * export namespace Foo { }
   * ```
   * @param {Set<Object>} nodes
   * @returns {boolean}
   */
function isTypescriptNamespaceMerging(nodes) {
  var types = new Set(Array.from(nodes, function (node) {return node.parent.type;}));
  var noNamespaceNodes = Array.from(nodes).filter(function (node) {return node.parent.type !== 'TSModuleDeclaration';});

  return types.has('TSModuleDeclaration') && (

  types.size === 1
  // Merging with functions
  || types.size === 2 && (types.has('FunctionDeclaration') || types.has('TSDeclareFunction')) ||
  types.size === 3 && types.has('FunctionDeclaration') && types.has('TSDeclareFunction')
  // Merging with classes or enums
  || types.size === 2 && (types.has('ClassDeclaration') || types.has('TSEnumDeclaration')) && noNamespaceNodes.length === 1);

}

/**
   * Detect if a typescript namespace node should be reported as multiple export:
   * ```ts
   * export class Foo { }
   * export function Foo();
   * export namespace Foo { }
   * ```
   * @param {Object} node
   * @param {Set<Object>} nodes
   * @returns {boolean}
   */
function shouldSkipTypescriptNamespace(node, nodes) {
  var types = new Set(Array.from(nodes, function (node) {return node.parent.type;}));

  return !isTypescriptNamespaceMerging(nodes) &&
  node.parent.type === 'TSModuleDeclaration' && (

  types.has('TSEnumDeclaration') ||
  types.has('ClassDeclaration') ||
  types.has('FunctionDeclaration') ||
  types.has('TSDeclareFunction'));

}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2['default'])('export') },

    schema: [] },


  create: function () {function create(context) {
      var namespace = new Map([[rootProgram, new Map()]]);

      function addNamed(name, node, parent, isType) {
        if (!namespace.has(parent)) {
          namespace.set(parent, new Map());
        }
        var named = namespace.get(parent);

        var key = isType ? '' + tsTypePrefix + String(name) : name;
        var nodes = named.get(key);

        if (nodes == null) {
          nodes = new Set();
          named.set(key, nodes);
        }

        nodes.add(node);
      }

      function getParent(node) {
        if (node.parent && node.parent.type === 'TSModuleBlock') {
          return node.parent.parent;
        }

        // just in case somehow a non-ts namespace export declaration isn't directly
        // parented to the root Program node
        return rootProgram;
      }

      return {
        ExportDefaultDeclaration: function () {function ExportDefaultDeclaration(node) {
            addNamed('default', node, getParent(node));
          }return ExportDefaultDeclaration;}(),

        ExportSpecifier: function () {function ExportSpecifier(node) {
            addNamed(
            node.exported.name || node.exported.value,
            node.exported,
            getParent(node.parent));

          }return ExportSpecifier;}(),

        ExportNamedDeclaration: function () {function ExportNamedDeclaration(node) {
            if (node.declaration == null) return;

            var parent = getParent(node);
            // support for old TypeScript versions
            var isTypeVariableDecl = node.declaration.kind === 'type';

            if (node.declaration.id != null) {
              if ((0, _arrayIncludes2['default'])([
              'TSTypeAliasDeclaration',
              'TSInterfaceDeclaration'],
              node.declaration.type)) {
                addNamed(node.declaration.id.name, node.declaration.id, parent, true);
              } else {
                addNamed(node.declaration.id.name, node.declaration.id, parent, isTypeVariableDecl);
              }
            }

            if (node.declaration.declarations != null) {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
                for (var _iterator = node.declaration.declarations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var declaration = _step.value;
                  (0, _ExportMap.recursivePatternCapture)(declaration.id, function (v) {return (
                      addNamed(v.name, v, parent, isTypeVariableDecl));});
                }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
            }
          }return ExportNamedDeclaration;}(),

        ExportAllDeclaration: function () {function ExportAllDeclaration(node) {
            if (node.source == null) return; // not sure if this is ever true

            // `export * as X from 'path'` does not conflict
            if (node.exported && node.exported.name) return;

            var remoteExports = _ExportMap2['default'].get(node.source.value, context);
            if (remoteExports == null) return;

            if (remoteExports.errors.length) {
              remoteExports.reportErrors(context, node);
              return;
            }

            var parent = getParent(node);

            var any = false;
            remoteExports.forEach(function (v, name) {
              if (name !== 'default') {
                any = true; // poor man's filter
                addNamed(name, node, parent);
              }
            });

            if (!any) {
              context.report(
              node.source, 'No named exports found in module \'' + String(
              node.source.value) + '\'.');

            }
          }return ExportAllDeclaration;}(),

        'Program:exit': function () {function ProgramExit() {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
              for (var _iterator2 = namespace[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var _ref = _step2.value;var _ref2 = _slicedToArray(_ref, 2);var named = _ref2[1];var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {
                  for (var _iterator3 = named[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var _ref3 = _step3.value;var _ref4 = _slicedToArray(_ref3, 2);var name = _ref4[0];var nodes = _ref4[1];
                    if (nodes.size <= 1) continue;

                    if (isTypescriptFunctionOverloads(nodes) || isTypescriptNamespaceMerging(nodes)) continue;var _iteratorNormalCompletion4 = true;var _didIteratorError4 = false;var _iteratorError4 = undefined;try {

                      for (var _iterator4 = nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {var node = _step4.value;
                        if (shouldSkipTypescriptNamespace(node, nodes)) continue;

                        if (name === 'default') {
                          context.report(node, 'Multiple default exports.');
                        } else {
                          context.report(
                          node, 'Multiple exports of name \'' + String(
                          name.replace(tsTypePrefix, '')) + '\'.');

                        }
                      }} catch (err) {_didIteratorError4 = true;_iteratorError4 = err;} finally {try {if (!_iteratorNormalCompletion4 && _iterator4['return']) {_iterator4['return']();}} finally {if (_didIteratorError4) {throw _iteratorError4;}}}
                  }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}
              }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}
          }return ProgramExit;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9leHBvcnQuanMiXSwibmFtZXMiOlsicm9vdFByb2dyYW0iLCJ0c1R5cGVQcmVmaXgiLCJpc1R5cGVzY3JpcHRGdW5jdGlvbk92ZXJsb2FkcyIsIm5vZGVzIiwibm9kZXNBcnIiLCJBcnJheSIsImZyb20iLCJ0eXBlcyIsIlNldCIsIm1hcCIsIm5vZGUiLCJwYXJlbnQiLCJ0eXBlIiwiaWRlbnRzIiwiZGVjbGFyYXRpb24iLCJpZCIsIm5hbWUiLCJzaXplIiwibGVuZ3RoIiwiaGFzIiwiaXNUeXBlc2NyaXB0TmFtZXNwYWNlTWVyZ2luZyIsIm5vTmFtZXNwYWNlTm9kZXMiLCJmaWx0ZXIiLCJzaG91bGRTa2lwVHlwZXNjcmlwdE5hbWVzcGFjZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsInVybCIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJuYW1lc3BhY2UiLCJNYXAiLCJhZGROYW1lZCIsImlzVHlwZSIsInNldCIsIm5hbWVkIiwiZ2V0Iiwia2V5IiwiYWRkIiwiZ2V0UGFyZW50IiwiRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uIiwiRXhwb3J0U3BlY2lmaWVyIiwiZXhwb3J0ZWQiLCJ2YWx1ZSIsIkV4cG9ydE5hbWVkRGVjbGFyYXRpb24iLCJpc1R5cGVWYXJpYWJsZURlY2wiLCJraW5kIiwiZGVjbGFyYXRpb25zIiwidiIsIkV4cG9ydEFsbERlY2xhcmF0aW9uIiwic291cmNlIiwicmVtb3RlRXhwb3J0cyIsIkV4cG9ydE1hcCIsImVycm9ycyIsInJlcG9ydEVycm9ycyIsImFueSIsImZvckVhY2giLCJyZXBvcnQiLCJyZXBsYWNlIl0sIm1hcHBpbmdzIjoicW9CQUFBLHlDO0FBQ0EscUM7QUFDQSwrQztBQUNBLHlEOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLElBQU1BLGNBQWMsTUFBcEI7QUFDQSxJQUFNQyxlQUFlLE9BQXJCOztBQUVBOzs7Ozs7Ozs7O0FBVUEsU0FBU0MsNkJBQVQs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QUFLMEMsTUFBTCxDQUFZUCxLQUZuRDs7QUFJRDtBQUNGLFdBckVJOztBQXVFTCxxQ0FBZ0IsdUJBQVk7QUFDMUIsb0NBQXdCYixTQUF4QixtSUFBbUMsaUVBQXJCSyxLQUFxQjtBQUNqQyx3Q0FBNEJBLEtBQTVCLG1JQUFtQyxtRUFBdkJyQixJQUF1QixnQkFBakJiLEtBQWlCO0FBQ2pDLHdCQUFJQSxNQUFNYyxJQUFOLElBQWMsQ0FBbEIsRUFBcUI7O0FBRXJCLHdCQUFJZiw4QkFBOEJDLEtBQTlCLEtBQXdDaUIsNkJBQTZCakIsS0FBN0IsQ0FBNUMsRUFBaUYsU0FIaEQ7O0FBS2pDLDRDQUFtQkEsS0FBbkIsbUlBQTBCLEtBQWZPLElBQWU7QUFDeEIsNEJBQUlhLDhCQUE4QmIsSUFBOUIsRUFBb0NQLEtBQXBDLENBQUosRUFBZ0Q7O0FBRWhELDRCQUFJYSxTQUFTLFNBQWIsRUFBd0I7QUFDdEJlLGtDQUFRNEIsTUFBUixDQUFlakQsSUFBZixFQUFxQiwyQkFBckI7QUFDRCx5QkFGRCxNQUVPO0FBQ0xxQixrQ0FBUTRCLE1BQVI7QUFDRWpELDhCQURGO0FBRStCTSwrQkFBSzRDLE9BQUwsQ0FBYTNELFlBQWIsRUFBMkIsRUFBM0IsQ0FGL0I7O0FBSUQ7QUFDRix1QkFoQmdDO0FBaUJsQyxtQkFsQmdDO0FBbUJsQyxlQXBCeUI7QUFxQjNCLFdBckJELHNCQXZFSyxFQUFQOztBQThGRCxLQXJJYyxtQkFBakIiLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEV4cG9ydE1hcCwgeyByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZSB9IGZyb20gJy4uL0V4cG9ydE1hcCc7XG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcbmltcG9ydCBpbmNsdWRlcyBmcm9tICdhcnJheS1pbmNsdWRlcyc7XG5pbXBvcnQgZmxhdE1hcCBmcm9tICdhcnJheS5wcm90b3R5cGUuZmxhdG1hcCc7XG5cbi8qXG5Ob3RlcyBvbiBUeXBlU2NyaXB0IG5hbWVzcGFjZXMgYWthIFRTTW9kdWxlRGVjbGFyYXRpb246XG5cblRoZXJlIGFyZSB0d28gZm9ybXM6XG4tIGFjdGl2ZSBuYW1lc3BhY2VzOiBuYW1lc3BhY2UgRm9vIHt9IC8gbW9kdWxlIEZvbyB7fVxuLSBhbWJpZW50IG1vZHVsZXM7IGRlY2xhcmUgbW9kdWxlIFwiZXNsaW50LXBsdWdpbi1pbXBvcnRcIiB7fVxuXG5hY3RpdmUgbmFtZXNwYWNlczpcbi0gY2Fubm90IGNvbnRhaW4gYSBkZWZhdWx0IGV4cG9ydFxuLSBjYW5ub3QgY29udGFpbiBhbiBleHBvcnQgYWxsXG4tIGNhbm5vdCBjb250YWluIGEgbXVsdGkgbmFtZSBleHBvcnQgKGV4cG9ydCB7IGEsIGIgfSlcbi0gY2FuIGhhdmUgYWN0aXZlIG5hbWVzcGFjZXMgbmVzdGVkIHdpdGhpbiB0aGVtXG5cbmFtYmllbnQgbmFtZXNwYWNlczpcbi0gY2FuIG9ubHkgYmUgZGVmaW5lZCBpbiAuZC50cyBmaWxlc1xuLSBjYW5ub3QgYmUgbmVzdGVkIHdpdGhpbiBhY3RpdmUgbmFtZXNwYWNlc1xuLSBoYXZlIG5vIG90aGVyIHJlc3RyaWN0aW9uc1xuKi9cblxuY29uc3Qgcm9vdFByb2dyYW0gPSAncm9vdCc7XG5jb25zdCB0c1R5cGVQcmVmaXggPSAndHlwZTonO1xuXG4vKipcbiAqIERldGVjdCBmdW5jdGlvbiBvdmVybG9hZHMgbGlrZTpcbiAqIGBgYHRzXG4gKiBleHBvcnQgZnVuY3Rpb24gZm9vKGE6IG51bWJlcik7XG4gKiBleHBvcnQgZnVuY3Rpb24gZm9vKGE6IHN0cmluZyk7XG4gKiBleHBvcnQgZnVuY3Rpb24gZm9vKGE6IG51bWJlcnxzdHJpbmcpIHsgcmV0dXJuIGE7IH1cbiAqIGBgYFxuICogQHBhcmFtIHtTZXQ8T2JqZWN0Pn0gbm9kZXNcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1R5cGVzY3JpcHRGdW5jdGlvbk92ZXJsb2Fkcyhub2Rlcykge1xuICBjb25zdCBub2Rlc0FyciA9IEFycmF5LmZyb20obm9kZXMpO1xuICBjb25zdCB0eXBlcyA9IG5ldyBTZXQobm9kZXNBcnIubWFwKG5vZGUgPT4gbm9kZS5wYXJlbnQudHlwZSkpO1xuXG4gIGNvbnN0IGlkZW50cyA9IGZsYXRNYXAobm9kZXNBcnIsIChub2RlKSA9PiAoXG4gICAgbm9kZS5kZWNsYXJhdGlvbiAmJiAoXG4gICAgICBub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09ICdUU0RlY2xhcmVGdW5jdGlvbicgLy8gZXNsaW50IDYrXG4gICAgICB8fCBub2RlLmRlY2xhcmF0aW9uLnR5cGUgPT09ICdUU0VtcHR5Qm9keUZ1bmN0aW9uRGVjbGFyYXRpb24nIC8vIGVzbGludCA0LTVcbiAgICApXG4gICAgICA/IG5vZGUuZGVjbGFyYXRpb24uaWQubmFtZVxuICAgICAgOiBbXVxuICApKTtcbiAgaWYgKG5ldyBTZXQoaWRlbnRzKS5zaXplICE9PSBpZGVudHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoIXR5cGVzLmhhcygnVFNEZWNsYXJlRnVuY3Rpb24nKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodHlwZXMuc2l6ZSA9PT0gMSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICh0eXBlcy5zaXplID09PSAyICYmIHR5cGVzLmhhcygnRnVuY3Rpb25EZWNsYXJhdGlvbicpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIERldGVjdCBtZXJnaW5nIE5hbWVzcGFjZXMgd2l0aCBDbGFzc2VzLCBGdW5jdGlvbnMsIG9yIEVudW1zIGxpa2U6XG4gKiBgYGB0c1xuICogZXhwb3J0IGNsYXNzIEZvbyB7IH1cbiAqIGV4cG9ydCBuYW1lc3BhY2UgRm9vIHsgfVxuICogYGBgXG4gKiBAcGFyYW0ge1NldDxPYmplY3Q+fSBub2Rlc1xuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzVHlwZXNjcmlwdE5hbWVzcGFjZU1lcmdpbmcobm9kZXMpIHtcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0KEFycmF5LmZyb20obm9kZXMsIG5vZGUgPT4gbm9kZS5wYXJlbnQudHlwZSkpO1xuICBjb25zdCBub05hbWVzcGFjZU5vZGVzID0gQXJyYXkuZnJvbShub2RlcykuZmlsdGVyKChub2RlKSA9PiBub2RlLnBhcmVudC50eXBlICE9PSAnVFNNb2R1bGVEZWNsYXJhdGlvbicpO1xuXG4gIHJldHVybiB0eXBlcy5oYXMoJ1RTTW9kdWxlRGVjbGFyYXRpb24nKVxuICAgICYmIChcbiAgICAgIHR5cGVzLnNpemUgPT09IDFcbiAgICAgIC8vIE1lcmdpbmcgd2l0aCBmdW5jdGlvbnNcbiAgICAgIHx8ICh0eXBlcy5zaXplID09PSAyICYmICh0eXBlcy5oYXMoJ0Z1bmN0aW9uRGVjbGFyYXRpb24nKSB8fCB0eXBlcy5oYXMoJ1RTRGVjbGFyZUZ1bmN0aW9uJykpKVxuICAgICAgfHwgKHR5cGVzLnNpemUgPT09IDMgJiYgdHlwZXMuaGFzKCdGdW5jdGlvbkRlY2xhcmF0aW9uJykgJiYgdHlwZXMuaGFzKCdUU0RlY2xhcmVGdW5jdGlvbicpKVxuICAgICAgLy8gTWVyZ2luZyB3aXRoIGNsYXNzZXMgb3IgZW51bXNcbiAgICAgIHx8ICh0eXBlcy5zaXplID09PSAyICYmICh0eXBlcy5oYXMoJ0NsYXNzRGVjbGFyYXRpb24nKSB8fCB0eXBlcy5oYXMoJ1RTRW51bURlY2xhcmF0aW9uJykpICYmIG5vTmFtZXNwYWNlTm9kZXMubGVuZ3RoID09PSAxKVxuICAgICk7XG59XG5cbi8qKlxuICogRGV0ZWN0IGlmIGEgdHlwZXNjcmlwdCBuYW1lc3BhY2Ugbm9kZSBzaG91bGQgYmUgcmVwb3J0ZWQgYXMgbXVsdGlwbGUgZXhwb3J0OlxuICogYGBgdHNcbiAqIGV4cG9ydCBjbGFzcyBGb28geyB9XG4gKiBleHBvcnQgZnVuY3Rpb24gRm9vKCk7XG4gKiBleHBvcnQgbmFtZXNwYWNlIEZvbyB7IH1cbiAqIGBgYFxuICogQHBhcmFtIHtPYmplY3R9IG5vZGVcbiAqIEBwYXJhbSB7U2V0PE9iamVjdD59IG5vZGVzXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gc2hvdWxkU2tpcFR5cGVzY3JpcHROYW1lc3BhY2Uobm9kZSwgbm9kZXMpIHtcbiAgY29uc3QgdHlwZXMgPSBuZXcgU2V0KEFycmF5LmZyb20obm9kZXMsIG5vZGUgPT4gbm9kZS5wYXJlbnQudHlwZSkpO1xuXG4gIHJldHVybiAhaXNUeXBlc2NyaXB0TmFtZXNwYWNlTWVyZ2luZyhub2RlcylcbiAgICAmJiBub2RlLnBhcmVudC50eXBlID09PSAnVFNNb2R1bGVEZWNsYXJhdGlvbidcbiAgICAmJiAoXG4gICAgICB0eXBlcy5oYXMoJ1RTRW51bURlY2xhcmF0aW9uJylcbiAgICAgIHx8IHR5cGVzLmhhcygnQ2xhc3NEZWNsYXJhdGlvbicpXG4gICAgICB8fCB0eXBlcy5oYXMoJ0Z1bmN0aW9uRGVjbGFyYXRpb24nKVxuICAgICAgfHwgdHlwZXMuaGFzKCdUU0RlY2xhcmVGdW5jdGlvbicpXG4gICAgKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgZG9jczoge1xuICAgICAgdXJsOiBkb2NzVXJsKCdleHBvcnQnKSxcbiAgICB9LFxuICAgIHNjaGVtYTogW10sXG4gIH0sXG5cbiAgY3JlYXRlKGNvbnRleHQpIHtcbiAgICBjb25zdCBuYW1lc3BhY2UgPSBuZXcgTWFwKFtbcm9vdFByb2dyYW0sIG5ldyBNYXAoKV1dKTtcblxuICAgIGZ1bmN0aW9uIGFkZE5hbWVkKG5hbWUsIG5vZGUsIHBhcmVudCwgaXNUeXBlKSB7XG4gICAgICBpZiAoIW5hbWVzcGFjZS5oYXMocGFyZW50KSkge1xuICAgICAgICBuYW1lc3BhY2Uuc2V0KHBhcmVudCwgbmV3IE1hcCgpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5hbWVkID0gbmFtZXNwYWNlLmdldChwYXJlbnQpO1xuXG4gICAgICBjb25zdCBrZXkgPSBpc1R5cGUgPyBgJHt0c1R5cGVQcmVmaXh9JHtuYW1lfWAgOiBuYW1lO1xuICAgICAgbGV0IG5vZGVzID0gbmFtZWQuZ2V0KGtleSk7XG5cbiAgICAgIGlmIChub2RlcyA9PSBudWxsKSB7XG4gICAgICAgIG5vZGVzID0gbmV3IFNldCgpO1xuICAgICAgICBuYW1lZC5zZXQoa2V5LCBub2Rlcyk7XG4gICAgICB9XG5cbiAgICAgIG5vZGVzLmFkZChub2RlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRQYXJlbnQobm9kZSkge1xuICAgICAgaWYgKG5vZGUucGFyZW50ICYmIG5vZGUucGFyZW50LnR5cGUgPT09ICdUU01vZHVsZUJsb2NrJykge1xuICAgICAgICByZXR1cm4gbm9kZS5wYXJlbnQucGFyZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBqdXN0IGluIGNhc2Ugc29tZWhvdyBhIG5vbi10cyBuYW1lc3BhY2UgZXhwb3J0IGRlY2xhcmF0aW9uIGlzbid0IGRpcmVjdGx5XG4gICAgICAvLyBwYXJlbnRlZCB0byB0aGUgcm9vdCBQcm9ncmFtIG5vZGVcbiAgICAgIHJldHVybiByb290UHJvZ3JhbTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgICAgYWRkTmFtZWQoJ2RlZmF1bHQnLCBub2RlLCBnZXRQYXJlbnQobm9kZSkpO1xuICAgICAgfSxcblxuICAgICAgRXhwb3J0U3BlY2lmaWVyKG5vZGUpIHtcbiAgICAgICAgYWRkTmFtZWQoXG4gICAgICAgICAgbm9kZS5leHBvcnRlZC5uYW1lIHx8IG5vZGUuZXhwb3J0ZWQudmFsdWUsXG4gICAgICAgICAgbm9kZS5leHBvcnRlZCxcbiAgICAgICAgICBnZXRQYXJlbnQobm9kZS5wYXJlbnQpLFxuICAgICAgICApO1xuICAgICAgfSxcblxuICAgICAgRXhwb3J0TmFtZWREZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uID09IG51bGwpIHJldHVybjtcblxuICAgICAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnQobm9kZSk7XG4gICAgICAgIC8vIHN1cHBvcnQgZm9yIG9sZCBUeXBlU2NyaXB0IHZlcnNpb25zXG4gICAgICAgIGNvbnN0IGlzVHlwZVZhcmlhYmxlRGVjbCA9IG5vZGUuZGVjbGFyYXRpb24ua2luZCA9PT0gJ3R5cGUnO1xuXG4gICAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmlkICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoaW5jbHVkZXMoW1xuICAgICAgICAgICAgJ1RTVHlwZUFsaWFzRGVjbGFyYXRpb24nLFxuICAgICAgICAgICAgJ1RTSW50ZXJmYWNlRGVjbGFyYXRpb24nLFxuICAgICAgICAgIF0sIG5vZGUuZGVjbGFyYXRpb24udHlwZSkpIHtcbiAgICAgICAgICAgIGFkZE5hbWVkKG5vZGUuZGVjbGFyYXRpb24uaWQubmFtZSwgbm9kZS5kZWNsYXJhdGlvbi5pZCwgcGFyZW50LCB0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWRkTmFtZWQobm9kZS5kZWNsYXJhdGlvbi5pZC5uYW1lLCBub2RlLmRlY2xhcmF0aW9uLmlkLCBwYXJlbnQsIGlzVHlwZVZhcmlhYmxlRGVjbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5vZGUuZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zICE9IG51bGwpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGRlY2xhcmF0aW9uIG9mIG5vZGUuZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zKSB7XG4gICAgICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShkZWNsYXJhdGlvbi5pZCwgdiA9PlxuICAgICAgICAgICAgICBhZGROYW1lZCh2Lm5hbWUsIHYsIHBhcmVudCwgaXNUeXBlVmFyaWFibGVEZWNsKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBFeHBvcnRBbGxEZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGlmIChub2RlLnNvdXJjZSA9PSBudWxsKSByZXR1cm47IC8vIG5vdCBzdXJlIGlmIHRoaXMgaXMgZXZlciB0cnVlXG5cbiAgICAgICAgLy8gYGV4cG9ydCAqIGFzIFggZnJvbSAncGF0aCdgIGRvZXMgbm90IGNvbmZsaWN0XG4gICAgICAgIGlmIChub2RlLmV4cG9ydGVkICYmIG5vZGUuZXhwb3J0ZWQubmFtZSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHJlbW90ZUV4cG9ydHMgPSBFeHBvcnRNYXAuZ2V0KG5vZGUuc291cmNlLnZhbHVlLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlbW90ZUV4cG9ydHMgPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChyZW1vdGVFeHBvcnRzLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICByZW1vdGVFeHBvcnRzLnJlcG9ydEVycm9ycyhjb250ZXh0LCBub2RlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJlbnQgPSBnZXRQYXJlbnQobm9kZSk7XG5cbiAgICAgICAgbGV0IGFueSA9IGZhbHNlO1xuICAgICAgICByZW1vdGVFeHBvcnRzLmZvckVhY2goKHYsIG5hbWUpID0+IHtcbiAgICAgICAgICBpZiAobmFtZSAhPT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICBhbnkgPSB0cnVlOyAvLyBwb29yIG1hbidzIGZpbHRlclxuICAgICAgICAgICAgYWRkTmFtZWQobmFtZSwgbm9kZSwgcGFyZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghYW55KSB7XG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoXG4gICAgICAgICAgICBub2RlLnNvdXJjZSxcbiAgICAgICAgICAgIGBObyBuYW1lZCBleHBvcnRzIGZvdW5kIGluIG1vZHVsZSAnJHtub2RlLnNvdXJjZS52YWx1ZX0nLmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgJ1Byb2dyYW06ZXhpdCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yIChjb25zdCBbLCBuYW1lZF0gb2YgbmFtZXNwYWNlKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgbm9kZXNdIG9mIG5hbWVkKSB7XG4gICAgICAgICAgICBpZiAobm9kZXMuc2l6ZSA8PSAxKSBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKGlzVHlwZXNjcmlwdEZ1bmN0aW9uT3ZlcmxvYWRzKG5vZGVzKSB8fCBpc1R5cGVzY3JpcHROYW1lc3BhY2VNZXJnaW5nKG5vZGVzKSkgY29udGludWU7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgICAgICAgICBpZiAoc2hvdWxkU2tpcFR5cGVzY3JpcHROYW1lc3BhY2Uobm9kZSwgbm9kZXMpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICBpZiAobmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQobm9kZSwgJ011bHRpcGxlIGRlZmF1bHQgZXhwb3J0cy4nKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydChcbiAgICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgICBgTXVsdGlwbGUgZXhwb3J0cyBvZiBuYW1lICcke25hbWUucmVwbGFjZSh0c1R5cGVQcmVmaXgsICcnKX0nLmAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9O1xuICB9LFxufTtcbiJdfQ==