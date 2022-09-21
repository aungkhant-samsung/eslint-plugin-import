'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();exports.


















































































































































































































































































































































































































































































































































































































































































































































































recursivePatternCapture = recursivePatternCapture;var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);var _path = require('path');var _doctrine = require('doctrine');var _doctrine2 = _interopRequireDefault(_doctrine);var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);var _eslint = require('eslint');var _parse = require('eslint-module-utils/parse');var _parse2 = _interopRequireDefault(_parse);var _visit = require('eslint-module-utils/visit');var _visit2 = _interopRequireDefault(_visit);var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);var _ignore = require('eslint-module-utils/ignore');var _ignore2 = _interopRequireDefault(_ignore);var _hash = require('eslint-module-utils/hash');var _unambiguous = require('eslint-module-utils/unambiguous');var unambiguous = _interopRequireWildcard(_unambiguous);var _tsconfigLoader = require('tsconfig-paths/lib/tsconfig-loader');var _arrayIncludes = require('array-includes');var _arrayIncludes2 = _interopRequireDefault(_arrayIncludes);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj['default'] = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var ts = void 0;var log = (0, _debug2['default'])('eslint-plugin-import:ExportMap');var exportCache = new Map();var tsConfigCache = new Map(); // reset exportCache and tsConfigCache 3 hours
setInterval(function () {exportCache = new Map();;tsConfigCache = new Map();}, 3 * 60 * 60 * 1000);var ExportMap = function () {function ExportMap(path) {_classCallCheck(this, ExportMap);this.path = path;this.namespace = new Map(); // todo: restructure to key on path, value is resolver + map of names
    this.reexports = new Map(); /**
                                 * star-exports
                                 * @type {Set} of () => ExportMap
                                 */this.dependencies = new Set(); /**
                                                                   * dependencies of this module that are not explicitly re-exported
                                                                   * @type {Map} from path = () => ExportMap
                                                                   */this.imports = new Map();this.errors = []; /**
                                                                                                                 * type {'ambiguous' | 'Module' | 'Script'}
                                                                                                                 */this.parseGoal = 'ambiguous';}_createClass(ExportMap, [{ key: 'has', /**
                                                                                                                                                                                         * Note that this does not check explicitly re-exported names for existence
                                                                                                                                                                                         * in the base namespace, but it will expand all `export * from '...'` exports
                                                                                                                                                                                         * if not found in the explicit namespace.
                                                                                                                                                                                         * @param  {string}  name
                                                                                                                                                                                         * @return {Boolean} true if `name` is exported by this module.
                                                                                                                                                                                         */value: function () {function has(name) {if (this.namespace.has(name)) return true;if (this.reexports.has(name)) return true; // default exports must be explicitly re-exported (#328)
        if (name !== 'default') {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {for (var _iterator = this.dependencies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var dep = _step.value;var innerMap = dep(); // todo: report as unresolved?
              if (!innerMap) continue;if (innerMap.has(name)) return true;}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}}return false;}return has;}() /**
                                                                                                                                                                                                                                                                                                                                 * ensure that imported name fully resolves.
                                                                                                                                                                                                                                                                                                                                 * @param  {string} name
                                                                                                                                                                                                                                                                                                                                 * @return {{ found: boolean, path: ExportMap[] }}
                                                                                                                                                                                                                                                                                                                                 */ }, { key: 'hasDeep', value: function () {function hasDeep(name) {if (this.namespace.has(name)) return { found: true, path: [this] };if (this.reexports.has(name)) {var reexports = this.reexports.get(name);var imported = reexports.getImport(); // if import is ignored, return explicit 'null'
          if (imported == null) return { found: true, path: [this] }; // safeguard against cycles, only if name matches
          if (imported.path === this.path && reexports.local === name) {return { found: false, path: [this] };}var deep = imported.hasDeep(reexports.local);deep.path.unshift(this);return deep;} // default exports must be explicitly re-exported (#328)
        if (name !== 'default') {var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {for (var _iterator2 = this.dependencies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var dep = _step2.value;var innerMap = dep();if (innerMap == null) return { found: true, path: [this] }; // todo: report as unresolved?
              if (!innerMap) continue; // safeguard against cycles
              if (innerMap.path === this.path) continue;var innerValue = innerMap.hasDeep(name);if (innerValue.found) {innerValue.path.unshift(this);return innerValue;}}} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}}return { found: false, path: [this] };}return hasDeep;}() }, { key: 'get', value: function () {function get(name) {if (this.namespace.has(name)) return this.namespace.get(name);if (this.reexports.has(name)) {var reexports = this.reexports.get(name);var imported = reexports.getImport(); // if import is ignored, return explicit 'null'
          if (imported == null) return null; // safeguard against cycles, only if name matches
          if (imported.path === this.path && reexports.local === name) return undefined;return imported.get(reexports.local);} // default exports must be explicitly re-exported (#328)
        if (name !== 'default') {var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {for (var _iterator3 = this.dependencies[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var dep = _step3.value;var innerMap = dep(); // todo: report as unresolved?
              if (!innerMap) continue; // safeguard against cycles
              if (innerMap.path === this.path) continue;var innerValue = innerMap.get(name);if (innerValue !== undefined) return innerValue;}} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}}return undefined;}return get;}() }, { key: 'forEach', value: function () {function forEach(callback, thisArg) {var _this = this;this.namespace.forEach(function (v, n) {return callback.call(thisArg, v, n, _this);});this.reexports.forEach(function (reexports, name) {var reexported = reexports.getImport(); // can't look up meta for ignored re-exports (#348)
          callback.call(thisArg, reexported && reexported.get(reexports.local), name, _this);});this.dependencies.forEach(function (dep) {var d = dep(); // CJS / ignored dependencies won't exist (#717)
          if (d == null) return;d.forEach(function (v, n) {return n !== 'default' && callback.call(thisArg, v, n, _this);});});}return forEach;}() // todo: keys, values, entries?
  }, { key: 'reportErrors', value: function () {function reportErrors(context, declaration) {context.report({ node: declaration.source, message: 'Parse errors in imported module \'' + String(declaration.source.value) + '\': ' + ('' + String(this.errors.map(function (e) {return String(e.message) + ' (' + String(e.lineNumber) + ':' + String(e.column) + ')';}).join(', '))) });}return reportErrors;}() }, { key: 'hasDefault', get: function () {function get() {return this.get('default') != null;}return get;}() // stronger than this.has
  }, { key: 'size', get: function () {function get() {var size = this.namespace.size + this.reexports.size;this.dependencies.forEach(function (dep) {var d = dep(); // CJS / ignored dependencies won't exist (#717)
          if (d == null) return;size += d.size;});return size;}return get;}() }]);return ExportMap;}(); /**
                                                                                                         * parse docs from the first node that has leading comments
                                                                                                         */exports['default'] = ExportMap;function captureDoc(source, docStyleParsers) {var metadata = {}; // 'some' short-circuits on first 'true'
  for (var _len = arguments.length, nodes = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {nodes[_key - 2] = arguments[_key];}nodes.some(function (n) {try {var leadingComments = void 0; // n.leadingComments is legacy `attachComments` behavior
      if ('leadingComments' in n) {leadingComments = n.leadingComments;} else if (n.range) {leadingComments = source.getCommentsBefore(n);}if (!leadingComments || leadingComments.length === 0) return false;for (var name in docStyleParsers) {var doc = docStyleParsers[name](leadingComments);if (doc) {metadata.doc = doc;}}return true;} catch (err) {return false;}});return metadata;}var availableDocStyleParsers = { jsdoc: captureJsDoc, tomdoc: captureTomDoc }; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * parse JSDoc from leading comments
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param {object[]} comments
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @return {{ doc: object }}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function captureJsDoc(comments) {var doc = void 0; // capture XSDoc
  comments.forEach(function (comment) {// skip non-block comments
    if (comment.type !== 'Block') return;try {doc = _doctrine2['default'].parse(comment.value, { unwrap: true });} catch (err) {/* don't care, for now? maybe add to `errors?` */}});return doc;} /**
                                                                                                                                                                                                    * parse TomDoc section from comments
                                                                                                                                                                                                    */function captureTomDoc(comments) {// collect lines up to first paragraph break
  var lines = [];for (var i = 0; i < comments.length; i++) {var comment = comments[i];if (comment.value.match(/^\s*$/)) break;lines.push(comment.value.trim());} // return doctrine-like object
  var statusMatch = lines.join(' ').match(/^(Public|Internal|Deprecated):\s*(.+)/);if (statusMatch) {return { description: statusMatch[2], tags: [{ title: statusMatch[1].toLowerCase(), description: statusMatch[2] }] };}}var supportedImportTypes = new Set(['ImportDefaultSpecifier', 'ImportNamespaceSpecifier']);ExportMap.get = function (source, context) {var path = (0, _resolve2['default'])(source, context);if (path == null) return null;return ExportMap['for'](childContext(path, context));};ExportMap['for'] = function (context) {var path = context.path;var cacheKey = (0, _hash.hashObject)(context).digest('hex');var exportMap = exportCache.get(cacheKey); // return cached ignore
  if (exportMap === null) return null;var stats = _fs2['default'].statSync(path);if (exportMap != null) {// date equality check
    if (exportMap.mtime - stats.mtime === 0) {return exportMap;} // future: check content equality?
  } // check valid extensions first
  if (!(0, _ignore.hasValidExtension)(path, context)) {exportCache.set(cacheKey, null);return null;} // check for and cache ignore
  if ((0, _ignore2['default'])(path, context)) {log('ignored path due to ignore settings:', path);exportCache.set(cacheKey, null);return null;}var content = _fs2['default'].readFileSync(path, { encoding: 'utf8' }); // check for and cache unambiguous modules
  if (!unambiguous.test(content)) {log('ignored path due to unambiguous regex:', path);exportCache.set(cacheKey, null);return null;}log('cache miss', cacheKey, 'for path', path);exportMap = ExportMap.parse(path, content, context); // ambiguous modules return null
  if (exportMap == null) {log('ignored path due to ambiguous parse:', path);exportCache.set(cacheKey, null);return null;}exportMap.mtime = stats.mtime;exportCache.set(cacheKey, exportMap);return exportMap;};ExportMap.parse = function (path, content, context) {var m = new ExportMap(path);var isEsModuleInteropTrue = isEsModuleInterop();var ast = void 0;var visitorKeys = void 0;try {var result = (0, _parse2['default'])(path, content, context);ast = result.ast;visitorKeys = result.visitorKeys;} catch (err) {m.errors.push(err);return m; // can't continue
  }m.visitorKeys = visitorKeys;var hasDynamicImports = false;function processDynamicImport(source) {hasDynamicImports = true;if (source.type !== 'Literal') {return null;}var p = remotePath(source.value);if (p == null) {return null;}var importedSpecifiers = new Set();importedSpecifiers.add('ImportNamespaceSpecifier');var getter = thunkFor(p, context);m.imports.set(p, { getter: getter, declarations: new Set([{ source: { // capturing actual node reference holds full AST in memory!
          value: source.value, loc: source.loc }, importedSpecifiers: importedSpecifiers, dynamic: true }]) });}(0, _visit2['default'])(ast, visitorKeys, { ImportExpression: function () {function ImportExpression(node) {processDynamicImport(node.source);}return ImportExpression;}(), CallExpression: function () {function CallExpression(node) {if (node.callee.type === 'Import') {processDynamicImport(node.arguments[0]);}}return CallExpression;}() });var unambiguouslyESM = unambiguous.isModule(ast);if (!unambiguouslyESM && !hasDynamicImports) return null;var docstyle = context.settings && context.settings['import/docstyle'] || ['jsdoc'];var docStyleParsers = {};docstyle.forEach(function (style) {docStyleParsers[style] = availableDocStyleParsers[style];}); // attempt to collect module doc
  if (ast.comments) {ast.comments.some(function (c) {if (c.type !== 'Block') return false;try {var doc = _doctrine2['default'].parse(c.value, { unwrap: true });if (doc.tags.some(function (t) {return t.title === 'module';})) {m.doc = doc;return true;}} catch (err) {/* ignore */}return false;});}var namespaces = new Map();function remotePath(value) {return _resolve2['default'].relative(value, path, context.settings);}function resolveImport(value) {var rp = remotePath(value);if (rp == null) return null;return ExportMap['for'](childContext(rp, context));}function getNamespace(identifier) {if (!namespaces.has(identifier.name)) return;return function () {return resolveImport(namespaces.get(identifier.name));};}function addNamespace(object, identifier) {var nsfn = getNamespace(identifier);if (nsfn) {Object.defineProperty(object, 'namespace', { get: nsfn });}return object;}function processSpecifier(s, n, m) {var nsource = n.source && n.source.value;var exportMeta = {};var local = void 0;switch (s.type) {case 'ExportDefaultSpecifier':if (!nsource) return;local = 'default';break;case 'ExportNamespaceSpecifier':m.namespace.set(s.exported.name, Object.defineProperty(exportMeta, 'namespace', { get: function () {function get() {return resolveImport(nsource);}return get;}() }));return;case 'ExportAllDeclaration':m.namespace.set(s.exported.name || s.exported.value, addNamespace(exportMeta, s.source.value));return;case 'ExportSpecifier':if (!n.source) {m.namespace.set(s.exported.name || s.exported.value, addNamespace(exportMeta, s.local));return;} // else falls through
      default:local = s.local.name;break;} // todo: JSDoc
    m.reexports.set(s.exported.name, { local: local, getImport: function () {function getImport() {return resolveImport(nsource);}return getImport;}() });}function captureDependencyWithSpecifiers(n) {// import type { Foo } (TS and Flow)
    var declarationIsType = n.importKind === 'type'; // import './foo' or import {} from './foo' (both 0 specifiers) is a side effect and
    // shouldn't be considered to be just importing types
    var specifiersOnlyImportingTypes = n.specifiers.length > 0;var importedSpecifiers = new Set();n.specifiers.forEach(function (specifier) {if (specifier.type === 'ImportSpecifier') {importedSpecifiers.add(specifier.imported.name || specifier.imported.value);} else if (supportedImportTypes.has(specifier.type)) {importedSpecifiers.add(specifier.type);} // import { type Foo } (Flow)
      specifiersOnlyImportingTypes = specifiersOnlyImportingTypes && specifier.importKind === 'type';});captureDependency(n, declarationIsType || specifiersOnlyImportingTypes, importedSpecifiers);}function captureDependency(_ref, isOnlyImportingTypes) {var source = _ref.source;var importedSpecifiers = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Set();if (source == null) return null;var p = remotePath(source.value);if (p == null) return null;var declarationMetadata = { // capturing actual node reference holds full AST in memory!
      source: { value: source.value, loc: source.loc }, isOnlyImportingTypes: isOnlyImportingTypes, importedSpecifiers: importedSpecifiers };var existing = m.imports.get(p);if (existing != null) {existing.declarations.add(declarationMetadata);return existing.getter;}var getter = thunkFor(p, context);m.imports.set(p, { getter: getter, declarations: new Set([declarationMetadata]) });return getter;}var source = makeSourceCode(content, ast);function readTsConfig() {var tsConfigInfo = (0, _tsconfigLoader.tsConfigLoader)({ cwd: context.parserOptions && context.parserOptions.tsconfigRootDir || process.cwd(), getEnv: function () {function getEnv(key) {return process.env[key];}return getEnv;}() });try {if (tsConfigInfo.tsConfigPath !== undefined) {// Projects not using TypeScript won't have `typescript` installed.
        if (!ts) {ts = require('typescript');}var configFile = ts.readConfigFile(tsConfigInfo.tsConfigPath, ts.sys.readFile);return ts.parseJsonConfigFileContent(configFile.config, ts.sys, (0, _path.dirname)(tsConfigInfo.tsConfigPath));}} catch (e) {// Catch any errors
    }return null;}function isEsModuleInterop() {var cacheKey = (0, _hash.hashObject)({ tsconfigRootDir: context.parserOptions && context.parserOptions.tsconfigRootDir }).digest('hex');var tsConfig = tsConfigCache.get(cacheKey);if (typeof tsConfig === 'undefined') {tsConfig = readTsConfig(context);tsConfigCache.set(cacheKey, tsConfig);}return tsConfig && tsConfig.options ? tsConfig.options.esModuleInterop : false;}ast.body.forEach(function (n) {if (n.type === 'ExportDefaultDeclaration') {var exportMeta = captureDoc(source, docStyleParsers, n);if (n.declaration.type === 'Identifier') {addNamespace(exportMeta, n.declaration);}m.namespace.set('default', exportMeta);return;}if (n.type === 'ExportAllDeclaration') {var getter = captureDependency(n, n.exportKind === 'type');if (getter) m.dependencies.add(getter);if (n.exported) {processSpecifier(n, n.exported, m);}return;} // capture namespaces in case of later export
    if (n.type === 'ImportDeclaration') {captureDependencyWithSpecifiers(n);var ns = n.specifiers.find(function (s) {return s.type === 'ImportNamespaceSpecifier';});if (ns) {namespaces.set(ns.local.name, n.source.value);}return;}if (n.type === 'ExportNamedDeclaration') {captureDependencyWithSpecifiers(n); // capture declaration
      if (n.declaration != null) {switch (n.declaration.type) {case 'FunctionDeclaration':case 'ClassDeclaration':case 'TypeAlias': // flowtype with babel-eslint parser
          case 'InterfaceDeclaration':case 'DeclareFunction':case 'TSDeclareFunction':case 'TSEnumDeclaration':case 'TSTypeAliasDeclaration':case 'TSInterfaceDeclaration':case 'TSAbstractClassDeclaration':case 'TSModuleDeclaration':m.namespace.set(n.declaration.id.name, captureDoc(source, docStyleParsers, n));break;case 'VariableDeclaration':n.declaration.declarations.forEach(function (d) {return recursivePatternCapture(d.id, function (id) {return m.namespace.set(id.name, captureDoc(source, docStyleParsers, d, n));});});break;}}n.specifiers.forEach(function (s) {return processSpecifier(s, n, m);});}var exports = ['TSExportAssignment'];if (isEsModuleInteropTrue) {exports.push('TSNamespaceExportDeclaration');} // This doesn't declare anything, but changes what's being exported.
    if ((0, _arrayIncludes2['default'])(exports, n.type)) {var exportedName = n.type === 'TSNamespaceExportDeclaration' ? (n.id || n.name).name : n.expression && n.expression.name || n.expression.id && n.expression.id.name || null;var declTypes = ['VariableDeclaration', 'ClassDeclaration', 'TSDeclareFunction', 'TSEnumDeclaration', 'TSTypeAliasDeclaration', 'TSInterfaceDeclaration', 'TSAbstractClassDeclaration', 'TSModuleDeclaration'];var exportedDecls = ast.body.filter(function (_ref2) {var type = _ref2.type,id = _ref2.id,declarations = _ref2.declarations;return (0, _arrayIncludes2['default'])(declTypes, type) && (id && id.name === exportedName || declarations && declarations.find(function (d) {return d.id.name === exportedName;}));});if (exportedDecls.length === 0) {// Export is not referencing any local declaration, must be re-exporting
        m.namespace.set('default', captureDoc(source, docStyleParsers, n));return;}if (isEsModuleInteropTrue // esModuleInterop is on in tsconfig
      && !m.namespace.has('default') // and default isn't added already
      ) {m.namespace.set('default', {}); // add default export
        }exportedDecls.forEach(function (decl) {if (decl.type === 'TSModuleDeclaration') {if (decl.body && decl.body.type === 'TSModuleDeclaration') {m.namespace.set(decl.body.id.name, captureDoc(source, docStyleParsers, decl.body));} else if (decl.body && decl.body.body) {decl.body.body.forEach(function (moduleBlockNode) {// Export-assignment exports all members in the namespace,
              // explicitly exported or not.
              var namespaceDecl = moduleBlockNode.type === 'ExportNamedDeclaration' ? moduleBlockNode.declaration : moduleBlockNode;if (!namespaceDecl) {// TypeScript can check this for us; we needn't
              } else if (namespaceDecl.type === 'VariableDeclaration') {namespaceDecl.declarations.forEach(function (d) {return recursivePatternCapture(d.id, function (id) {return m.namespace.set(id.name, captureDoc(source, docStyleParsers, decl, namespaceDecl, moduleBlockNode));});});} else {m.namespace.set(namespaceDecl.id.name, captureDoc(source, docStyleParsers, moduleBlockNode));}});}} else {// Export as default
          m.namespace.set('default', captureDoc(source, docStyleParsers, decl));}});}});if (isEsModuleInteropTrue // esModuleInterop is on in tsconfig
  && m.namespace.size > 0 // anything is exported
  && !m.namespace.has('default') // and default isn't added already
  ) {m.namespace.set('default', {}); // add default export
    }if (unambiguouslyESM) {m.parseGoal = 'Module';}return m;}; /**
                                                                 * The creation of this closure is isolated from other scopes
                                                                 * to avoid over-retention of unrelated variables, which has
                                                                 * caused memory leaks. See #1266.
                                                                 */function thunkFor(p, context) {return function () {return ExportMap['for'](childContext(p, context));};} /**
                                                                                                                                                                             * Traverse a pattern/identifier node, calling 'callback'
                                                                                                                                                                             * for each leaf identifier.
                                                                                                                                                                             * @param  {node}   pattern
                                                                                                                                                                             * @param  {Function} callback
                                                                                                                                                                             * @return {void}
                                                                                                                                                                             */function recursivePatternCapture(pattern, callback) {switch (pattern.type) {case 'Identifier': // base case
      callback(pattern);break;case 'ObjectPattern':pattern.properties.forEach(function (p) {if (p.type === 'ExperimentalRestProperty' || p.type === 'RestElement') {callback(p.argument);return;}recursivePatternCapture(p.value, callback);});break;case 'ArrayPattern':pattern.elements.forEach(function (element) {if (element == null) return;if (element.type === 'ExperimentalRestProperty' || element.type === 'RestElement') {callback(element.argument);return;}recursivePatternCapture(element, callback);});break;case 'AssignmentPattern':callback(pattern.left);break;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       * don't hold full context object in memory, just grab what we need.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       */function childContext(path, context) {var settings = context.settings,parserOptions = context.parserOptions,parserPath = context.parserPath;return { settings: settings, parserOptions: parserOptions, parserPath: parserPath, path: path };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * sometimes legacy support isn't _that_ hard... right?
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        */function makeSourceCode(text, ast) {if (_eslint.SourceCode.length > 1) {// ESLint 3
    return new _eslint.SourceCode(text, ast);} else {// ESLint 4, 5
    return new _eslint.SourceCode({ text: text, ast: ast });}}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9FeHBvcnRNYXAuanMiXSwibmFtZXMiOlsicmVjdXJzaXZlUGF0dGVybkNhcHR1cmUiLCJ1bmFtYmlndW91cyIsInRzIiwibG9nIiwiZXhwb3J0Q2FjaGUiLCJNYXAiLCJ0c0NvbmZpZ0NhY2hlIiwic2V0SW50ZXJ2YWwiLCJFeHBvcnRNYXAiLCJwYXRoIiwibmFtZXNwYWNlIiwicmVleHBvcnRzIiwiZGVwZW5kZW5jaWVzIiwiU2V0IiwiaW1wb3J0cyIsImVycm9ycyIsInBhcnNlR29hbCIsIm5hbWUiLCJoYXMiLCJkZXAiLCJpbm5lck1hcCIsImZvdW5kIiwiZ2V0IiwiaW1wb3J0ZWQiLCJnZXRJbXBvcnQiLCJsb2NhbCIsImRlZXAiLCJoYXNEZWVwIiwidW5zaGlmdCIsImlubmVyVmFsdWUiLCJ1bmRlZmluZWQiLCJjYWxsYmFjayIsInRoaXNBcmciLCJmb3JFYWNoIiwidiIsIm4iLCJjYWxsIiwicmVleHBvcnRlZCIsImQiLCJjb250ZXh0IiwiZGVjbGFyYXRpb24iLCJyZXBvcnQiLCJub2RlIiwic291cmNlIiwibWVzc2FnZSIsInZhbHVlIiwibWFwIiwiZSIsImxpbmVOdW1iZXIiLCJjb2x1bW4iLCJqb2luIiwic2l6ZSIsImNhcHR1cmVEb2MiLCJkb2NTdHlsZVBhcnNlcnMiLCJtZXRhZGF0YSIsIm5vZGVzIiwic29tZSIsImxlYWRpbmdDb21tZW50cyIsInJhbmdlIiwiZ2V0Q29tbWVudHNCZWZvcmUiLCJsZW5ndGgiLCJkb2MiLCJlcnIiLCJhdmFpbGFibGVEb2NTdHlsZVBhcnNlcnMiLCJqc2RvYyIsImNhcHR1cmVKc0RvYyIsInRvbWRvYyIsImNhcHR1cmVUb21Eb2MiLCJjb21tZW50cyIsImNvbW1lbnQiLCJ0eXBlIiwiZG9jdHJpbmUiLCJwYXJzZSIsInVud3JhcCIsImxpbmVzIiwiaSIsIm1hdGNoIiwicHVzaCIsInRyaW0iLCJzdGF0dXNNYXRjaCIsImRlc2NyaXB0aW9uIiwidGFncyIsInRpdGxlIiwidG9Mb3dlckNhc2UiLCJzdXBwb3J0ZWRJbXBvcnRUeXBlcyIsImNoaWxkQ29udGV4dCIsImNhY2hlS2V5IiwiZGlnZXN0IiwiZXhwb3J0TWFwIiwic3RhdHMiLCJmcyIsInN0YXRTeW5jIiwibXRpbWUiLCJzZXQiLCJjb250ZW50IiwicmVhZEZpbGVTeW5jIiwiZW5jb2RpbmciLCJ0ZXN0IiwibSIsImlzRXNNb2R1bGVJbnRlcm9wVHJ1ZSIsImlzRXNNb2R1bGVJbnRlcm9wIiwiYXN0IiwidmlzaXRvcktleXMiLCJyZXN1bHQiLCJoYXNEeW5hbWljSW1wb3J0cyIsInByb2Nlc3NEeW5hbWljSW1wb3J0IiwicCIsInJlbW90ZVBhdGgiLCJpbXBvcnRlZFNwZWNpZmllcnMiLCJhZGQiLCJnZXR0ZXIiLCJ0aHVua0ZvciIsImRlY2xhcmF0aW9ucyIsImxvYyIsImR5bmFtaWMiLCJJbXBvcnRFeHByZXNzaW9uIiwiQ2FsbEV4cHJlc3Npb24iLCJjYWxsZWUiLCJhcmd1bWVudHMiLCJ1bmFtYmlndW91c2x5RVNNIiwiaXNNb2R1bGUiLCJkb2NzdHlsZSIsInNldHRpbmdzIiwic3R5bGUiLCJjIiwidCIsIm5hbWVzcGFjZXMiLCJyZXNvbHZlIiwicmVsYXRpdmUiLCJyZXNvbHZlSW1wb3J0IiwicnAiLCJnZXROYW1lc3BhY2UiLCJpZGVudGlmaWVyIiwiYWRkTmFtZXNwYWNlIiwib2JqZWN0IiwibnNmbiIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwicHJvY2Vzc1NwZWNpZmllciIsInMiLCJuc291cmNlIiwiZXhwb3J0TWV0YSIsImV4cG9ydGVkIiwiY2FwdHVyZURlcGVuZGVuY3lXaXRoU3BlY2lmaWVycyIsImRlY2xhcmF0aW9uSXNUeXBlIiwiaW1wb3J0S2luZCIsInNwZWNpZmllcnNPbmx5SW1wb3J0aW5nVHlwZXMiLCJzcGVjaWZpZXJzIiwic3BlY2lmaWVyIiwiY2FwdHVyZURlcGVuZGVuY3kiLCJpc09ubHlJbXBvcnRpbmdUeXBlcyIsImRlY2xhcmF0aW9uTWV0YWRhdGEiLCJleGlzdGluZyIsIm1ha2VTb3VyY2VDb2RlIiwicmVhZFRzQ29uZmlnIiwidHNDb25maWdJbmZvIiwiY3dkIiwicGFyc2VyT3B0aW9ucyIsInRzY29uZmlnUm9vdERpciIsInByb2Nlc3MiLCJnZXRFbnYiLCJrZXkiLCJlbnYiLCJ0c0NvbmZpZ1BhdGgiLCJyZXF1aXJlIiwiY29uZmlnRmlsZSIsInJlYWRDb25maWdGaWxlIiwic3lzIiwicmVhZEZpbGUiLCJwYXJzZUpzb25Db25maWdGaWxlQ29udGVudCIsImNvbmZpZyIsInRzQ29uZmlnIiwib3B0aW9ucyIsImVzTW9kdWxlSW50ZXJvcCIsImJvZHkiLCJleHBvcnRLaW5kIiwibnMiLCJmaW5kIiwiaWQiLCJleHBvcnRzIiwiZXhwb3J0ZWROYW1lIiwiZXhwcmVzc2lvbiIsImRlY2xUeXBlcyIsImV4cG9ydGVkRGVjbHMiLCJmaWx0ZXIiLCJkZWNsIiwibW9kdWxlQmxvY2tOb2RlIiwibmFtZXNwYWNlRGVjbCIsInBhdHRlcm4iLCJwcm9wZXJ0aWVzIiwiYXJndW1lbnQiLCJlbGVtZW50cyIsImVsZW1lbnQiLCJsZWZ0IiwicGFyc2VyUGF0aCIsInRleHQiLCJTb3VyY2VDb2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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RUFBYSxDQUNwQyxJQUFJQSxXQUFXLElBQWYsRUFBcUIsT0FDckIsSUFBSUEsUUFBUTFILElBQVIsS0FBaUIsMEJBQWpCLElBQStDMEgsUUFBUTFILElBQVIsS0FBaUIsYUFBcEUsRUFBbUYsQ0FDakZ2QyxTQUFTaUssUUFBUUYsUUFBakIsRUFDQSxPQUNELENBQ0Q5TCx3QkFBd0JnTSxPQUF4QixFQUFpQ2pLLFFBQWpDLEVBQ0QsQ0FQRCxFQVFBLE1BRUYsS0FBSyxtQkFBTCxDQUNFQSxTQUFTNkosUUFBUUssSUFBakIsRUFDQSxNQTVCRixDQThCRCxDLENBRUQ7O3lqQkFHQSxTQUFTNUcsWUFBVCxDQUFzQjVFLElBQXRCLEVBQTRCOEIsT0FBNUIsRUFBcUMsS0FDM0JtRixRQUQyQixHQUNhbkYsT0FEYixDQUMzQm1GLFFBRDJCLENBQ2pCbUMsYUFEaUIsR0FDYXRILE9BRGIsQ0FDakJzSCxhQURpQixDQUNGcUMsVUFERSxHQUNhM0osT0FEYixDQUNGMkosVUFERSxDQUVuQyxPQUFPLEVBQ0x4RSxrQkFESyxFQUVMbUMsNEJBRkssRUFHTHFDLHNCQUhLLEVBSUx6TCxVQUpLLEVBQVAsQ0FNRCxDLENBR0Q7OzB5QkFHQSxTQUFTZ0osY0FBVCxDQUF3QjBDLElBQXhCLEVBQThCOUYsR0FBOUIsRUFBbUMsQ0FDakMsSUFBSStGLG1CQUFXeEksTUFBWCxHQUFvQixDQUF4QixFQUEyQixDQUN6QjtBQUNBLFdBQU8sSUFBSXdJLGtCQUFKLENBQWVELElBQWYsRUFBcUI5RixHQUFyQixDQUFQLENBQ0QsQ0FIRCxNQUdPLENBQ0w7QUFDQSxXQUFPLElBQUkrRixrQkFBSixDQUFlLEVBQUVELFVBQUYsRUFBUTlGLFFBQVIsRUFBZixDQUFQLENBQ0QsQ0FDRiIsImZpbGUiOiJFeHBvcnRNYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgZGlybmFtZSB9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgZG9jdHJpbmUgZnJvbSAnZG9jdHJpbmUnO1xuXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG5pbXBvcnQgeyBTb3VyY2VDb2RlIH0gZnJvbSAnZXNsaW50JztcblxuaW1wb3J0IHBhcnNlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcGFyc2UnO1xuaW1wb3J0IHZpc2l0IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvdmlzaXQnO1xuaW1wb3J0IHJlc29sdmUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9yZXNvbHZlJztcbmltcG9ydCBpc0lnbm9yZWQsIHsgaGFzVmFsaWRFeHRlbnNpb24gfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2lnbm9yZSc7XG5cbmltcG9ydCB7IGhhc2hPYmplY3QgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2hhc2gnO1xuaW1wb3J0ICogYXMgdW5hbWJpZ3VvdXMgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy91bmFtYmlndW91cyc7XG5cbmltcG9ydCB7IHRzQ29uZmlnTG9hZGVyIH0gZnJvbSAndHNjb25maWctcGF0aHMvbGliL3RzY29uZmlnLWxvYWRlcic7XG5cbmltcG9ydCBpbmNsdWRlcyBmcm9tICdhcnJheS1pbmNsdWRlcyc7XG5cbmxldCB0cztcblxuY29uc3QgbG9nID0gZGVidWcoJ2VzbGludC1wbHVnaW4taW1wb3J0OkV4cG9ydE1hcCcpO1xuXG5sZXQgZXhwb3J0Q2FjaGUgPSBuZXcgTWFwKCk7XG5sZXQgdHNDb25maWdDYWNoZSA9IG5ldyBNYXAoKTtcblxuLy8gcmVzZXQgZXhwb3J0Q2FjaGUgYW5kIHRzQ29uZmlnQ2FjaGUgMyBob3Vyc1xuc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICBleHBvcnRDYWNoZSA9IG5ldyBNYXAoKTs7XG4gIHRzQ29uZmlnQ2FjaGUgPSBuZXcgTWFwKCk7XG59LCAzICogNjAgKiA2MCAqIDEwMDApXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cG9ydE1hcCB7XG4gIGNvbnN0cnVjdG9yKHBhdGgpIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMubmFtZXNwYWNlID0gbmV3IE1hcCgpO1xuICAgIC8vIHRvZG86IHJlc3RydWN0dXJlIHRvIGtleSBvbiBwYXRoLCB2YWx1ZSBpcyByZXNvbHZlciArIG1hcCBvZiBuYW1lc1xuICAgIHRoaXMucmVleHBvcnRzID0gbmV3IE1hcCgpO1xuICAgIC8qKlxuICAgICAqIHN0YXItZXhwb3J0c1xuICAgICAqIEB0eXBlIHtTZXR9IG9mICgpID0+IEV4cG9ydE1hcFxuICAgICAqL1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gbmV3IFNldCgpO1xuICAgIC8qKlxuICAgICAqIGRlcGVuZGVuY2llcyBvZiB0aGlzIG1vZHVsZSB0aGF0IGFyZSBub3QgZXhwbGljaXRseSByZS1leHBvcnRlZFxuICAgICAqIEB0eXBlIHtNYXB9IGZyb20gcGF0aCA9ICgpID0+IEV4cG9ydE1hcFxuICAgICAqL1xuICAgIHRoaXMuaW1wb3J0cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmVycm9ycyA9IFtdO1xuICAgIC8qKlxuICAgICAqIHR5cGUgeydhbWJpZ3VvdXMnIHwgJ01vZHVsZScgfCAnU2NyaXB0J31cbiAgICAgKi9cbiAgICB0aGlzLnBhcnNlR29hbCA9ICdhbWJpZ3VvdXMnO1xuICB9XG5cbiAgZ2V0IGhhc0RlZmF1bHQoKSB7IHJldHVybiB0aGlzLmdldCgnZGVmYXVsdCcpICE9IG51bGw7IH0gLy8gc3Ryb25nZXIgdGhhbiB0aGlzLmhhc1xuXG4gIGdldCBzaXplKCkge1xuICAgIGxldCBzaXplID0gdGhpcy5uYW1lc3BhY2Uuc2l6ZSArIHRoaXMucmVleHBvcnRzLnNpemU7XG4gICAgdGhpcy5kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4ge1xuICAgICAgY29uc3QgZCA9IGRlcCgpO1xuICAgICAgLy8gQ0pTIC8gaWdub3JlZCBkZXBlbmRlbmNpZXMgd29uJ3QgZXhpc3QgKCM3MTcpXG4gICAgICBpZiAoZCA9PSBudWxsKSByZXR1cm47XG4gICAgICBzaXplICs9IGQuc2l6ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2l6ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCBjaGVjayBleHBsaWNpdGx5IHJlLWV4cG9ydGVkIG5hbWVzIGZvciBleGlzdGVuY2VcbiAgICogaW4gdGhlIGJhc2UgbmFtZXNwYWNlLCBidXQgaXQgd2lsbCBleHBhbmQgYWxsIGBleHBvcnQgKiBmcm9tICcuLi4nYCBleHBvcnRzXG4gICAqIGlmIG5vdCBmb3VuZCBpbiB0aGUgZXhwbGljaXQgbmFtZXNwYWNlLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9ICBuYW1lXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59IHRydWUgaWYgYG5hbWVgIGlzIGV4cG9ydGVkIGJ5IHRoaXMgbW9kdWxlLlxuICAgKi9cbiAgaGFzKG5hbWUpIHtcbiAgICBpZiAodGhpcy5uYW1lc3BhY2UuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAodGhpcy5yZWV4cG9ydHMuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIGRlZmF1bHQgZXhwb3J0cyBtdXN0IGJlIGV4cGxpY2l0bHkgcmUtZXhwb3J0ZWQgKCMzMjgpXG4gICAgaWYgKG5hbWUgIT09ICdkZWZhdWx0Jykge1xuICAgICAgZm9yIChjb25zdCBkZXAgb2YgdGhpcy5kZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgY29uc3QgaW5uZXJNYXAgPSBkZXAoKTtcblxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cbiAgICAgICAgaWYgKCFpbm5lck1hcCkgY29udGludWU7XG5cbiAgICAgICAgaWYgKGlubmVyTWFwLmhhcyhuYW1lKSkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIGVuc3VyZSB0aGF0IGltcG9ydGVkIG5hbWUgZnVsbHkgcmVzb2x2ZXMuXG4gICAqIEBwYXJhbSAge3N0cmluZ30gbmFtZVxuICAgKiBAcmV0dXJuIHt7IGZvdW5kOiBib29sZWFuLCBwYXRoOiBFeHBvcnRNYXBbXSB9fVxuICAgKi9cbiAgaGFzRGVlcChuYW1lKSB7XG4gICAgaWYgKHRoaXMubmFtZXNwYWNlLmhhcyhuYW1lKSkgcmV0dXJuIHsgZm91bmQ6IHRydWUsIHBhdGg6IFt0aGlzXSB9O1xuXG4gICAgaWYgKHRoaXMucmVleHBvcnRzLmhhcyhuYW1lKSkge1xuICAgICAgY29uc3QgcmVleHBvcnRzID0gdGhpcy5yZWV4cG9ydHMuZ2V0KG5hbWUpO1xuICAgICAgY29uc3QgaW1wb3J0ZWQgPSByZWV4cG9ydHMuZ2V0SW1wb3J0KCk7XG5cbiAgICAgIC8vIGlmIGltcG9ydCBpcyBpZ25vcmVkLCByZXR1cm4gZXhwbGljaXQgJ251bGwnXG4gICAgICBpZiAoaW1wb3J0ZWQgPT0gbnVsbCkgcmV0dXJuIHsgZm91bmQ6IHRydWUsIHBhdGg6IFt0aGlzXSB9O1xuXG4gICAgICAvLyBzYWZlZ3VhcmQgYWdhaW5zdCBjeWNsZXMsIG9ubHkgaWYgbmFtZSBtYXRjaGVzXG4gICAgICBpZiAoaW1wb3J0ZWQucGF0aCA9PT0gdGhpcy5wYXRoICYmIHJlZXhwb3J0cy5sb2NhbCA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4geyBmb3VuZDogZmFsc2UsIHBhdGg6IFt0aGlzXSB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkZWVwID0gaW1wb3J0ZWQuaGFzRGVlcChyZWV4cG9ydHMubG9jYWwpO1xuICAgICAgZGVlcC5wYXRoLnVuc2hpZnQodGhpcyk7XG5cbiAgICAgIHJldHVybiBkZWVwO1xuICAgIH1cblxuXG4gICAgLy8gZGVmYXVsdCBleHBvcnRzIG11c3QgYmUgZXhwbGljaXRseSByZS1leHBvcnRlZCAoIzMyOClcbiAgICBpZiAobmFtZSAhPT0gJ2RlZmF1bHQnKSB7XG4gICAgICBmb3IgKGNvbnN0IGRlcCBvZiB0aGlzLmRlcGVuZGVuY2llcykge1xuICAgICAgICBjb25zdCBpbm5lck1hcCA9IGRlcCgpO1xuICAgICAgICBpZiAoaW5uZXJNYXAgPT0gbnVsbCkgcmV0dXJuIHsgZm91bmQ6IHRydWUsIHBhdGg6IFt0aGlzXSB9O1xuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cbiAgICAgICAgaWYgKCFpbm5lck1hcCkgY29udGludWU7XG5cbiAgICAgICAgLy8gc2FmZWd1YXJkIGFnYWluc3QgY3ljbGVzXG4gICAgICAgIGlmIChpbm5lck1hcC5wYXRoID09PSB0aGlzLnBhdGgpIGNvbnRpbnVlO1xuXG4gICAgICAgIGNvbnN0IGlubmVyVmFsdWUgPSBpbm5lck1hcC5oYXNEZWVwKG5hbWUpO1xuICAgICAgICBpZiAoaW5uZXJWYWx1ZS5mb3VuZCkge1xuICAgICAgICAgIGlubmVyVmFsdWUucGF0aC51bnNoaWZ0KHRoaXMpO1xuICAgICAgICAgIHJldHVybiBpbm5lclZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgZm91bmQ6IGZhbHNlLCBwYXRoOiBbdGhpc10gfTtcbiAgfVxuXG4gIGdldChuYW1lKSB7XG4gICAgaWYgKHRoaXMubmFtZXNwYWNlLmhhcyhuYW1lKSkgcmV0dXJuIHRoaXMubmFtZXNwYWNlLmdldChuYW1lKTtcblxuICAgIGlmICh0aGlzLnJlZXhwb3J0cy5oYXMobmFtZSkpIHtcbiAgICAgIGNvbnN0IHJlZXhwb3J0cyA9IHRoaXMucmVleHBvcnRzLmdldChuYW1lKTtcbiAgICAgIGNvbnN0IGltcG9ydGVkID0gcmVleHBvcnRzLmdldEltcG9ydCgpO1xuXG4gICAgICAvLyBpZiBpbXBvcnQgaXMgaWdub3JlZCwgcmV0dXJuIGV4cGxpY2l0ICdudWxsJ1xuICAgICAgaWYgKGltcG9ydGVkID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgICAvLyBzYWZlZ3VhcmQgYWdhaW5zdCBjeWNsZXMsIG9ubHkgaWYgbmFtZSBtYXRjaGVzXG4gICAgICBpZiAoaW1wb3J0ZWQucGF0aCA9PT0gdGhpcy5wYXRoICYmIHJlZXhwb3J0cy5sb2NhbCA9PT0gbmFtZSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgICAgcmV0dXJuIGltcG9ydGVkLmdldChyZWV4cG9ydHMubG9jYWwpO1xuICAgIH1cblxuICAgIC8vIGRlZmF1bHQgZXhwb3J0cyBtdXN0IGJlIGV4cGxpY2l0bHkgcmUtZXhwb3J0ZWQgKCMzMjgpXG4gICAgaWYgKG5hbWUgIT09ICdkZWZhdWx0Jykge1xuICAgICAgZm9yIChjb25zdCBkZXAgb2YgdGhpcy5kZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgY29uc3QgaW5uZXJNYXAgPSBkZXAoKTtcbiAgICAgICAgLy8gdG9kbzogcmVwb3J0IGFzIHVucmVzb2x2ZWQ/XG4gICAgICAgIGlmICghaW5uZXJNYXApIGNvbnRpbnVlO1xuXG4gICAgICAgIC8vIHNhZmVndWFyZCBhZ2FpbnN0IGN5Y2xlc1xuICAgICAgICBpZiAoaW5uZXJNYXAucGF0aCA9PT0gdGhpcy5wYXRoKSBjb250aW51ZTtcblxuICAgICAgICBjb25zdCBpbm5lclZhbHVlID0gaW5uZXJNYXAuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAoaW5uZXJWYWx1ZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gaW5uZXJWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIHRoaXMubmFtZXNwYWNlLmZvckVhY2goKHYsIG4pID0+XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHYsIG4sIHRoaXMpKTtcblxuICAgIHRoaXMucmVleHBvcnRzLmZvckVhY2goKHJlZXhwb3J0cywgbmFtZSkgPT4ge1xuICAgICAgY29uc3QgcmVleHBvcnRlZCA9IHJlZXhwb3J0cy5nZXRJbXBvcnQoKTtcbiAgICAgIC8vIGNhbid0IGxvb2sgdXAgbWV0YSBmb3IgaWdub3JlZCByZS1leHBvcnRzICgjMzQ4KVxuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCByZWV4cG9ydGVkICYmIHJlZXhwb3J0ZWQuZ2V0KHJlZXhwb3J0cy5sb2NhbCksIG5hbWUsIHRoaXMpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4ge1xuICAgICAgY29uc3QgZCA9IGRlcCgpO1xuICAgICAgLy8gQ0pTIC8gaWdub3JlZCBkZXBlbmRlbmNpZXMgd29uJ3QgZXhpc3QgKCM3MTcpXG4gICAgICBpZiAoZCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgIGQuZm9yRWFjaCgodiwgbikgPT5cbiAgICAgICAgbiAhPT0gJ2RlZmF1bHQnICYmIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdiwgbiwgdGhpcykpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gdG9kbzoga2V5cywgdmFsdWVzLCBlbnRyaWVzP1xuXG4gIHJlcG9ydEVycm9ycyhjb250ZXh0LCBkZWNsYXJhdGlvbikge1xuICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgIG5vZGU6IGRlY2xhcmF0aW9uLnNvdXJjZSxcbiAgICAgIG1lc3NhZ2U6IGBQYXJzZSBlcnJvcnMgaW4gaW1wb3J0ZWQgbW9kdWxlICcke2RlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZX0nOiBgICtcbiAgICAgICAgICAgICAgICAgIGAke3RoaXMuZXJyb3JzXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoZSA9PiBgJHtlLm1lc3NhZ2V9ICgke2UubGluZU51bWJlcn06JHtlLmNvbHVtbn0pYClcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oJywgJyl9YCxcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIHBhcnNlIGRvY3MgZnJvbSB0aGUgZmlyc3Qgbm9kZSB0aGF0IGhhcyBsZWFkaW5nIGNvbW1lbnRzXG4gKi9cbmZ1bmN0aW9uIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIC4uLm5vZGVzKSB7XG4gIGNvbnN0IG1ldGFkYXRhID0ge307XG5cbiAgLy8gJ3NvbWUnIHNob3J0LWNpcmN1aXRzIG9uIGZpcnN0ICd0cnVlJ1xuICBub2Rlcy5zb21lKG4gPT4ge1xuICAgIHRyeSB7XG5cbiAgICAgIGxldCBsZWFkaW5nQ29tbWVudHM7XG5cbiAgICAgIC8vIG4ubGVhZGluZ0NvbW1lbnRzIGlzIGxlZ2FjeSBgYXR0YWNoQ29tbWVudHNgIGJlaGF2aW9yXG4gICAgICBpZiAoJ2xlYWRpbmdDb21tZW50cycgaW4gbikge1xuICAgICAgICBsZWFkaW5nQ29tbWVudHMgPSBuLmxlYWRpbmdDb21tZW50cztcbiAgICAgIH0gZWxzZSBpZiAobi5yYW5nZSkge1xuICAgICAgICBsZWFkaW5nQ29tbWVudHMgPSBzb3VyY2UuZ2V0Q29tbWVudHNCZWZvcmUobik7XG4gICAgICB9XG5cbiAgICAgIGlmICghbGVhZGluZ0NvbW1lbnRzIHx8IGxlYWRpbmdDb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZTtcblxuICAgICAgZm9yIChjb25zdCBuYW1lIGluIGRvY1N0eWxlUGFyc2Vycykge1xuICAgICAgICBjb25zdCBkb2MgPSBkb2NTdHlsZVBhcnNlcnNbbmFtZV0obGVhZGluZ0NvbW1lbnRzKTtcbiAgICAgICAgaWYgKGRvYykge1xuICAgICAgICAgIG1ldGFkYXRhLmRvYyA9IGRvYztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBtZXRhZGF0YTtcbn1cblxuY29uc3QgYXZhaWxhYmxlRG9jU3R5bGVQYXJzZXJzID0ge1xuICBqc2RvYzogY2FwdHVyZUpzRG9jLFxuICB0b21kb2M6IGNhcHR1cmVUb21Eb2MsXG59O1xuXG4vKipcbiAqIHBhcnNlIEpTRG9jIGZyb20gbGVhZGluZyBjb21tZW50c1xuICogQHBhcmFtIHtvYmplY3RbXX0gY29tbWVudHNcbiAqIEByZXR1cm4ge3sgZG9jOiBvYmplY3QgfX1cbiAqL1xuZnVuY3Rpb24gY2FwdHVyZUpzRG9jKGNvbW1lbnRzKSB7XG4gIGxldCBkb2M7XG5cbiAgLy8gY2FwdHVyZSBYU0RvY1xuICBjb21tZW50cy5mb3JFYWNoKGNvbW1lbnQgPT4ge1xuICAgIC8vIHNraXAgbm9uLWJsb2NrIGNvbW1lbnRzXG4gICAgaWYgKGNvbW1lbnQudHlwZSAhPT0gJ0Jsb2NrJykgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICBkb2MgPSBkb2N0cmluZS5wYXJzZShjb21tZW50LnZhbHVlLCB7IHVud3JhcDogdHJ1ZSB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8qIGRvbid0IGNhcmUsIGZvciBub3c/IG1heWJlIGFkZCB0byBgZXJyb3JzP2AgKi9cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBkb2M7XG59XG5cbi8qKlxuICAqIHBhcnNlIFRvbURvYyBzZWN0aW9uIGZyb20gY29tbWVudHNcbiAgKi9cbmZ1bmN0aW9uIGNhcHR1cmVUb21Eb2MoY29tbWVudHMpIHtcbiAgLy8gY29sbGVjdCBsaW5lcyB1cCB0byBmaXJzdCBwYXJhZ3JhcGggYnJlYWtcbiAgY29uc3QgbGluZXMgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNvbW1lbnQgPSBjb21tZW50c1tpXTtcbiAgICBpZiAoY29tbWVudC52YWx1ZS5tYXRjaCgvXlxccyokLykpIGJyZWFrO1xuICAgIGxpbmVzLnB1c2goY29tbWVudC52YWx1ZS50cmltKCkpO1xuICB9XG5cbiAgLy8gcmV0dXJuIGRvY3RyaW5lLWxpa2Ugb2JqZWN0XG4gIGNvbnN0IHN0YXR1c01hdGNoID0gbGluZXMuam9pbignICcpLm1hdGNoKC9eKFB1YmxpY3xJbnRlcm5hbHxEZXByZWNhdGVkKTpcXHMqKC4rKS8pO1xuICBpZiAoc3RhdHVzTWF0Y2gpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzY3JpcHRpb246IHN0YXR1c01hdGNoWzJdLFxuICAgICAgdGFnczogW3tcbiAgICAgICAgdGl0bGU6IHN0YXR1c01hdGNoWzFdLnRvTG93ZXJDYXNlKCksXG4gICAgICAgIGRlc2NyaXB0aW9uOiBzdGF0dXNNYXRjaFsyXSxcbiAgICAgIH1dLFxuICAgIH07XG4gIH1cbn1cblxuY29uc3Qgc3VwcG9ydGVkSW1wb3J0VHlwZXMgPSBuZXcgU2V0KFsnSW1wb3J0RGVmYXVsdFNwZWNpZmllcicsICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInXSk7XG5cbkV4cG9ydE1hcC5nZXQgPSBmdW5jdGlvbiAoc291cmNlLCBjb250ZXh0KSB7XG4gIGNvbnN0IHBhdGggPSByZXNvbHZlKHNvdXJjZSwgY29udGV4dCk7XG4gIGlmIChwYXRoID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gIHJldHVybiBFeHBvcnRNYXAuZm9yKGNoaWxkQ29udGV4dChwYXRoLCBjb250ZXh0KSk7XG59O1xuXG5FeHBvcnRNYXAuZm9yID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgY29uc3QgeyBwYXRoIH0gPSBjb250ZXh0O1xuXG4gIGNvbnN0IGNhY2hlS2V5ID0gaGFzaE9iamVjdChjb250ZXh0KS5kaWdlc3QoJ2hleCcpO1xuICBsZXQgZXhwb3J0TWFwID0gZXhwb3J0Q2FjaGUuZ2V0KGNhY2hlS2V5KTtcblxuICAvLyByZXR1cm4gY2FjaGVkIGlnbm9yZVxuICBpZiAoZXhwb3J0TWFwID09PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuICBpZiAoZXhwb3J0TWFwICE9IG51bGwpIHtcbiAgICAvLyBkYXRlIGVxdWFsaXR5IGNoZWNrXG4gICAgaWYgKGV4cG9ydE1hcC5tdGltZSAtIHN0YXRzLm10aW1lID09PSAwKSB7XG4gICAgICByZXR1cm4gZXhwb3J0TWFwO1xuICAgIH1cbiAgICAvLyBmdXR1cmU6IGNoZWNrIGNvbnRlbnQgZXF1YWxpdHk/XG4gIH1cblxuICAvLyBjaGVjayB2YWxpZCBleHRlbnNpb25zIGZpcnN0XG4gIGlmICghaGFzVmFsaWRFeHRlbnNpb24ocGF0aCwgY29udGV4dCkpIHtcbiAgICBleHBvcnRDYWNoZS5zZXQoY2FjaGVLZXksIG51bGwpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gY2hlY2sgZm9yIGFuZCBjYWNoZSBpZ25vcmVcbiAgaWYgKGlzSWdub3JlZChwYXRoLCBjb250ZXh0KSkge1xuICAgIGxvZygnaWdub3JlZCBwYXRoIGR1ZSB0byBpZ25vcmUgc2V0dGluZ3M6JywgcGF0aCk7XG4gICAgZXhwb3J0Q2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMocGF0aCwgeyBlbmNvZGluZzogJ3V0ZjgnIH0pO1xuXG4gIC8vIGNoZWNrIGZvciBhbmQgY2FjaGUgdW5hbWJpZ3VvdXMgbW9kdWxlc1xuICBpZiAoIXVuYW1iaWd1b3VzLnRlc3QoY29udGVudCkpIHtcbiAgICBsb2coJ2lnbm9yZWQgcGF0aCBkdWUgdG8gdW5hbWJpZ3VvdXMgcmVnZXg6JywgcGF0aCk7XG4gICAgZXhwb3J0Q2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxvZygnY2FjaGUgbWlzcycsIGNhY2hlS2V5LCAnZm9yIHBhdGgnLCBwYXRoKTtcbiAgZXhwb3J0TWFwID0gRXhwb3J0TWFwLnBhcnNlKHBhdGgsIGNvbnRlbnQsIGNvbnRleHQpO1xuXG4gIC8vIGFtYmlndW91cyBtb2R1bGVzIHJldHVybiBudWxsXG4gIGlmIChleHBvcnRNYXAgPT0gbnVsbCkge1xuICAgIGxvZygnaWdub3JlZCBwYXRoIGR1ZSB0byBhbWJpZ3VvdXMgcGFyc2U6JywgcGF0aCk7XG4gICAgZXhwb3J0Q2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGV4cG9ydE1hcC5tdGltZSA9IHN0YXRzLm10aW1lO1xuXG4gIGV4cG9ydENhY2hlLnNldChjYWNoZUtleSwgZXhwb3J0TWFwKTtcbiAgcmV0dXJuIGV4cG9ydE1hcDtcbn07XG5cblxuRXhwb3J0TWFwLnBhcnNlID0gZnVuY3Rpb24gKHBhdGgsIGNvbnRlbnQsIGNvbnRleHQpIHtcbiAgY29uc3QgbSA9IG5ldyBFeHBvcnRNYXAocGF0aCk7XG4gIGNvbnN0IGlzRXNNb2R1bGVJbnRlcm9wVHJ1ZSA9IGlzRXNNb2R1bGVJbnRlcm9wKCk7XG5cbiAgbGV0IGFzdDtcbiAgbGV0IHZpc2l0b3JLZXlzO1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlKHBhdGgsIGNvbnRlbnQsIGNvbnRleHQpO1xuICAgIGFzdCA9IHJlc3VsdC5hc3Q7XG4gICAgdmlzaXRvcktleXMgPSByZXN1bHQudmlzaXRvcktleXM7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIG0uZXJyb3JzLnB1c2goZXJyKTtcbiAgICByZXR1cm4gbTsgLy8gY2FuJ3QgY29udGludWVcbiAgfVxuXG4gIG0udmlzaXRvcktleXMgPSB2aXNpdG9yS2V5cztcblxuICBsZXQgaGFzRHluYW1pY0ltcG9ydHMgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBwcm9jZXNzRHluYW1pY0ltcG9ydChzb3VyY2UpIHtcbiAgICBoYXNEeW5hbWljSW1wb3J0cyA9IHRydWU7XG4gICAgaWYgKHNvdXJjZS50eXBlICE9PSAnTGl0ZXJhbCcpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBwID0gcmVtb3RlUGF0aChzb3VyY2UudmFsdWUpO1xuICAgIGlmIChwID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBpbXBvcnRlZFNwZWNpZmllcnMgPSBuZXcgU2V0KCk7XG4gICAgaW1wb3J0ZWRTcGVjaWZpZXJzLmFkZCgnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJyk7XG4gICAgY29uc3QgZ2V0dGVyID0gdGh1bmtGb3IocCwgY29udGV4dCk7XG4gICAgbS5pbXBvcnRzLnNldChwLCB7XG4gICAgICBnZXR0ZXIsXG4gICAgICBkZWNsYXJhdGlvbnM6IG5ldyBTZXQoW3tcbiAgICAgICAgc291cmNlOiB7XG4gICAgICAgIC8vIGNhcHR1cmluZyBhY3R1YWwgbm9kZSByZWZlcmVuY2UgaG9sZHMgZnVsbCBBU1QgaW4gbWVtb3J5IVxuICAgICAgICAgIHZhbHVlOiBzb3VyY2UudmFsdWUsXG4gICAgICAgICAgbG9jOiBzb3VyY2UubG9jLFxuICAgICAgICB9LFxuICAgICAgICBpbXBvcnRlZFNwZWNpZmllcnMsXG4gICAgICAgIGR5bmFtaWM6IHRydWUsXG4gICAgICB9XSksXG4gICAgfSk7XG4gIH1cblxuICB2aXNpdChhc3QsIHZpc2l0b3JLZXlzLCB7XG4gICAgSW1wb3J0RXhwcmVzc2lvbihub2RlKSB7XG4gICAgICBwcm9jZXNzRHluYW1pY0ltcG9ydChub2RlLnNvdXJjZSk7XG4gICAgfSxcbiAgICBDYWxsRXhwcmVzc2lvbihub2RlKSB7XG4gICAgICBpZiAobm9kZS5jYWxsZWUudHlwZSA9PT0gJ0ltcG9ydCcpIHtcbiAgICAgICAgcHJvY2Vzc0R5bmFtaWNJbXBvcnQobm9kZS5hcmd1bWVudHNbMF0pO1xuICAgICAgfVxuICAgIH0sXG4gIH0pO1xuXG4gIGNvbnN0IHVuYW1iaWd1b3VzbHlFU00gPSB1bmFtYmlndW91cy5pc01vZHVsZShhc3QpO1xuICBpZiAoIXVuYW1iaWd1b3VzbHlFU00gJiYgIWhhc0R5bmFtaWNJbXBvcnRzKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBkb2NzdHlsZSA9IChjb250ZXh0LnNldHRpbmdzICYmIGNvbnRleHQuc2V0dGluZ3NbJ2ltcG9ydC9kb2NzdHlsZSddKSB8fCBbJ2pzZG9jJ107XG4gIGNvbnN0IGRvY1N0eWxlUGFyc2VycyA9IHt9O1xuICBkb2NzdHlsZS5mb3JFYWNoKHN0eWxlID0+IHtcbiAgICBkb2NTdHlsZVBhcnNlcnNbc3R5bGVdID0gYXZhaWxhYmxlRG9jU3R5bGVQYXJzZXJzW3N0eWxlXTtcbiAgfSk7XG5cbiAgLy8gYXR0ZW1wdCB0byBjb2xsZWN0IG1vZHVsZSBkb2NcbiAgaWYgKGFzdC5jb21tZW50cykge1xuICAgIGFzdC5jb21tZW50cy5zb21lKGMgPT4ge1xuICAgICAgaWYgKGMudHlwZSAhPT0gJ0Jsb2NrJykgcmV0dXJuIGZhbHNlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZG9jID0gZG9jdHJpbmUucGFyc2UoYy52YWx1ZSwgeyB1bndyYXA6IHRydWUgfSk7XG4gICAgICAgIGlmIChkb2MudGFncy5zb21lKHQgPT4gdC50aXRsZSA9PT0gJ21vZHVsZScpKSB7XG4gICAgICAgICAgbS5kb2MgPSBkb2M7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikgeyAvKiBpZ25vcmUgKi8gfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgY29uc3QgbmFtZXNwYWNlcyA9IG5ldyBNYXAoKTtcblxuICBmdW5jdGlvbiByZW1vdGVQYXRoKHZhbHVlKSB7XG4gICAgcmV0dXJuIHJlc29sdmUucmVsYXRpdmUodmFsdWUsIHBhdGgsIGNvbnRleHQuc2V0dGluZ3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZUltcG9ydCh2YWx1ZSkge1xuICAgIGNvbnN0IHJwID0gcmVtb3RlUGF0aCh2YWx1ZSk7XG4gICAgaWYgKHJwID09IG51bGwpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBFeHBvcnRNYXAuZm9yKGNoaWxkQ29udGV4dChycCwgY29udGV4dCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TmFtZXNwYWNlKGlkZW50aWZpZXIpIHtcbiAgICBpZiAoIW5hbWVzcGFjZXMuaGFzKGlkZW50aWZpZXIubmFtZSkpIHJldHVybjtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZUltcG9ydChuYW1lc3BhY2VzLmdldChpZGVudGlmaWVyLm5hbWUpKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkTmFtZXNwYWNlKG9iamVjdCwgaWRlbnRpZmllcikge1xuICAgIGNvbnN0IG5zZm4gPSBnZXROYW1lc3BhY2UoaWRlbnRpZmllcik7XG4gICAgaWYgKG5zZm4pIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsICduYW1lc3BhY2UnLCB7IGdldDogbnNmbiB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgZnVuY3Rpb24gcHJvY2Vzc1NwZWNpZmllcihzLCBuLCBtKSB7XG4gICAgY29uc3QgbnNvdXJjZSA9IG4uc291cmNlICYmIG4uc291cmNlLnZhbHVlO1xuICAgIGNvbnN0IGV4cG9ydE1ldGEgPSB7fTtcbiAgICBsZXQgbG9jYWw7XG5cbiAgICBzd2l0Y2ggKHMudHlwZSkge1xuICAgIGNhc2UgJ0V4cG9ydERlZmF1bHRTcGVjaWZpZXInOlxuICAgICAgaWYgKCFuc291cmNlKSByZXR1cm47XG4gICAgICBsb2NhbCA9ICdkZWZhdWx0JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0V4cG9ydE5hbWVzcGFjZVNwZWNpZmllcic6XG4gICAgICBtLm5hbWVzcGFjZS5zZXQocy5leHBvcnRlZC5uYW1lLCBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0TWV0YSwgJ25hbWVzcGFjZScsIHtcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gcmVzb2x2ZUltcG9ydChuc291cmNlKTsgfSxcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybjtcbiAgICBjYXNlICdFeHBvcnRBbGxEZWNsYXJhdGlvbic6XG4gICAgICBtLm5hbWVzcGFjZS5zZXQocy5leHBvcnRlZC5uYW1lIHx8IHMuZXhwb3J0ZWQudmFsdWUsIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBzLnNvdXJjZS52YWx1ZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIGNhc2UgJ0V4cG9ydFNwZWNpZmllcic6XG4gICAgICBpZiAoIW4uc291cmNlKSB7XG4gICAgICAgIG0ubmFtZXNwYWNlLnNldChzLmV4cG9ydGVkLm5hbWUgfHwgcy5leHBvcnRlZC52YWx1ZSwgYWRkTmFtZXNwYWNlKGV4cG9ydE1ldGEsIHMubG9jYWwpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBmYWxscyB0aHJvdWdoXG4gICAgZGVmYXVsdDpcbiAgICAgIGxvY2FsID0gcy5sb2NhbC5uYW1lO1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gdG9kbzogSlNEb2NcbiAgICBtLnJlZXhwb3J0cy5zZXQocy5leHBvcnRlZC5uYW1lLCB7IGxvY2FsLCBnZXRJbXBvcnQ6ICgpID0+IHJlc29sdmVJbXBvcnQobnNvdXJjZSkgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjYXB0dXJlRGVwZW5kZW5jeVdpdGhTcGVjaWZpZXJzKG4pIHtcbiAgICAvLyBpbXBvcnQgdHlwZSB7IEZvbyB9IChUUyBhbmQgRmxvdylcbiAgICBjb25zdCBkZWNsYXJhdGlvbklzVHlwZSA9IG4uaW1wb3J0S2luZCA9PT0gJ3R5cGUnO1xuICAgIC8vIGltcG9ydCAnLi9mb28nIG9yIGltcG9ydCB7fSBmcm9tICcuL2ZvbycgKGJvdGggMCBzcGVjaWZpZXJzKSBpcyBhIHNpZGUgZWZmZWN0IGFuZFxuICAgIC8vIHNob3VsZG4ndCBiZSBjb25zaWRlcmVkIHRvIGJlIGp1c3QgaW1wb3J0aW5nIHR5cGVzXG4gICAgbGV0IHNwZWNpZmllcnNPbmx5SW1wb3J0aW5nVHlwZXMgPSBuLnNwZWNpZmllcnMubGVuZ3RoID4gMDtcbiAgICBjb25zdCBpbXBvcnRlZFNwZWNpZmllcnMgPSBuZXcgU2V0KCk7XG4gICAgbi5zcGVjaWZpZXJzLmZvckVhY2goc3BlY2lmaWVyID0+IHtcbiAgICAgIGlmIChzcGVjaWZpZXIudHlwZSA9PT0gJ0ltcG9ydFNwZWNpZmllcicpIHtcbiAgICAgICAgaW1wb3J0ZWRTcGVjaWZpZXJzLmFkZChzcGVjaWZpZXIuaW1wb3J0ZWQubmFtZSB8fCBzcGVjaWZpZXIuaW1wb3J0ZWQudmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0ZWRJbXBvcnRUeXBlcy5oYXMoc3BlY2lmaWVyLnR5cGUpKSB7XG4gICAgICAgIGltcG9ydGVkU3BlY2lmaWVycy5hZGQoc3BlY2lmaWVyLnR5cGUpO1xuICAgICAgfVxuXG4gICAgICAvLyBpbXBvcnQgeyB0eXBlIEZvbyB9IChGbG93KVxuICAgICAgc3BlY2lmaWVyc09ubHlJbXBvcnRpbmdUeXBlcyA9IHNwZWNpZmllcnNPbmx5SW1wb3J0aW5nVHlwZXMgJiYgc3BlY2lmaWVyLmltcG9ydEtpbmQgPT09ICd0eXBlJztcbiAgICB9KTtcbiAgICBjYXB0dXJlRGVwZW5kZW5jeShuLCBkZWNsYXJhdGlvbklzVHlwZSB8fCBzcGVjaWZpZXJzT25seUltcG9ydGluZ1R5cGVzLCBpbXBvcnRlZFNwZWNpZmllcnMpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FwdHVyZURlcGVuZGVuY3koeyBzb3VyY2UgfSwgaXNPbmx5SW1wb3J0aW5nVHlwZXMsIGltcG9ydGVkU3BlY2lmaWVycyA9IG5ldyBTZXQoKSkge1xuICAgIGlmIChzb3VyY2UgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBwID0gcmVtb3RlUGF0aChzb3VyY2UudmFsdWUpO1xuICAgIGlmIChwID09IG51bGwpIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgZGVjbGFyYXRpb25NZXRhZGF0YSA9IHtcbiAgICAgIC8vIGNhcHR1cmluZyBhY3R1YWwgbm9kZSByZWZlcmVuY2UgaG9sZHMgZnVsbCBBU1QgaW4gbWVtb3J5IVxuICAgICAgc291cmNlOiB7IHZhbHVlOiBzb3VyY2UudmFsdWUsIGxvYzogc291cmNlLmxvYyB9LFxuICAgICAgaXNPbmx5SW1wb3J0aW5nVHlwZXMsXG4gICAgICBpbXBvcnRlZFNwZWNpZmllcnMsXG4gICAgfTtcblxuICAgIGNvbnN0IGV4aXN0aW5nID0gbS5pbXBvcnRzLmdldChwKTtcbiAgICBpZiAoZXhpc3RpbmcgIT0gbnVsbCkge1xuICAgICAgZXhpc3RpbmcuZGVjbGFyYXRpb25zLmFkZChkZWNsYXJhdGlvbk1ldGFkYXRhKTtcbiAgICAgIHJldHVybiBleGlzdGluZy5nZXR0ZXI7XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0dGVyID0gdGh1bmtGb3IocCwgY29udGV4dCk7XG4gICAgbS5pbXBvcnRzLnNldChwLCB7IGdldHRlciwgZGVjbGFyYXRpb25zOiBuZXcgU2V0KFtkZWNsYXJhdGlvbk1ldGFkYXRhXSkgfSk7XG4gICAgcmV0dXJuIGdldHRlcjtcbiAgfVxuXG4gIGNvbnN0IHNvdXJjZSA9IG1ha2VTb3VyY2VDb2RlKGNvbnRlbnQsIGFzdCk7XG5cbiAgZnVuY3Rpb24gcmVhZFRzQ29uZmlnKCkge1xuICAgIGNvbnN0IHRzQ29uZmlnSW5mbyA9IHRzQ29uZmlnTG9hZGVyKHtcbiAgICAgIGN3ZDpcbiAgICAgICAgKGNvbnRleHQucGFyc2VyT3B0aW9ucyAmJiBjb250ZXh0LnBhcnNlck9wdGlvbnMudHNjb25maWdSb290RGlyKSB8fFxuICAgICAgICBwcm9jZXNzLmN3ZCgpLFxuICAgICAgZ2V0RW52OiAoa2V5KSA9PiBwcm9jZXNzLmVudltrZXldLFxuICAgIH0pO1xuICAgIHRyeSB7XG4gICAgICBpZiAodHNDb25maWdJbmZvLnRzQ29uZmlnUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIFByb2plY3RzIG5vdCB1c2luZyBUeXBlU2NyaXB0IHdvbid0IGhhdmUgYHR5cGVzY3JpcHRgIGluc3RhbGxlZC5cbiAgICAgICAgaWYgKCF0cykgeyB0cyA9IHJlcXVpcmUoJ3R5cGVzY3JpcHQnKTsgfVxuICBcbiAgICAgICAgY29uc3QgY29uZmlnRmlsZSA9IHRzLnJlYWRDb25maWdGaWxlKHRzQ29uZmlnSW5mby50c0NvbmZpZ1BhdGgsIHRzLnN5cy5yZWFkRmlsZSk7XG4gICAgICAgIHJldHVybiB0cy5wYXJzZUpzb25Db25maWdGaWxlQ29udGVudChcbiAgICAgICAgICBjb25maWdGaWxlLmNvbmZpZyxcbiAgICAgICAgICB0cy5zeXMsXG4gICAgICAgICAgZGlybmFtZSh0c0NvbmZpZ0luZm8udHNDb25maWdQYXRoKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBhbnkgZXJyb3JzXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBpc0VzTW9kdWxlSW50ZXJvcCgpIHtcbiAgICBjb25zdCBjYWNoZUtleSA9IGhhc2hPYmplY3Qoe1xuICAgICAgdHNjb25maWdSb290RGlyOiBjb250ZXh0LnBhcnNlck9wdGlvbnMgJiYgY29udGV4dC5wYXJzZXJPcHRpb25zLnRzY29uZmlnUm9vdERpcixcbiAgICB9KS5kaWdlc3QoJ2hleCcpO1xuICAgIGxldCB0c0NvbmZpZyA9IHRzQ29uZmlnQ2FjaGUuZ2V0KGNhY2hlS2V5KTtcbiAgICBpZiAodHlwZW9mIHRzQ29uZmlnID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdHNDb25maWcgPSByZWFkVHNDb25maWcoY29udGV4dCk7XG4gICAgICB0c0NvbmZpZ0NhY2hlLnNldChjYWNoZUtleSwgdHNDb25maWcpO1xuICAgIH1cblxuICAgIHJldHVybiB0c0NvbmZpZyAmJiB0c0NvbmZpZy5vcHRpb25zID8gdHNDb25maWcub3B0aW9ucy5lc01vZHVsZUludGVyb3AgOiBmYWxzZTtcbiAgfVxuXG4gIGFzdC5ib2R5LmZvckVhY2goZnVuY3Rpb24gKG4pIHtcbiAgICBpZiAobi50eXBlID09PSAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJykge1xuICAgICAgY29uc3QgZXhwb3J0TWV0YSA9IGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIG4pO1xuICAgICAgaWYgKG4uZGVjbGFyYXRpb24udHlwZSA9PT0gJ0lkZW50aWZpZXInKSB7XG4gICAgICAgIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBuLmRlY2xhcmF0aW9uKTtcbiAgICAgIH1cbiAgICAgIG0ubmFtZXNwYWNlLnNldCgnZGVmYXVsdCcsIGV4cG9ydE1ldGEpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuLnR5cGUgPT09ICdFeHBvcnRBbGxEZWNsYXJhdGlvbicpIHtcbiAgICAgIGNvbnN0IGdldHRlciA9IGNhcHR1cmVEZXBlbmRlbmN5KG4sIG4uZXhwb3J0S2luZCA9PT0gJ3R5cGUnKTtcbiAgICAgIGlmIChnZXR0ZXIpIG0uZGVwZW5kZW5jaWVzLmFkZChnZXR0ZXIpO1xuICAgICAgaWYgKG4uZXhwb3J0ZWQpIHtcbiAgICAgICAgcHJvY2Vzc1NwZWNpZmllcihuLCBuLmV4cG9ydGVkLCBtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBjYXB0dXJlIG5hbWVzcGFjZXMgaW4gY2FzZSBvZiBsYXRlciBleHBvcnRcbiAgICBpZiAobi50eXBlID09PSAnSW1wb3J0RGVjbGFyYXRpb24nKSB7XG4gICAgICBjYXB0dXJlRGVwZW5kZW5jeVdpdGhTcGVjaWZpZXJzKG4pO1xuXG4gICAgICBjb25zdCBucyA9IG4uc3BlY2lmaWVycy5maW5kKHMgPT4gcy50eXBlID09PSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJyk7XG4gICAgICBpZiAobnMpIHtcbiAgICAgICAgbmFtZXNwYWNlcy5zZXQobnMubG9jYWwubmFtZSwgbi5zb3VyY2UudmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChuLnR5cGUgPT09ICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJykge1xuICAgICAgY2FwdHVyZURlcGVuZGVuY3lXaXRoU3BlY2lmaWVycyhuKTtcblxuICAgICAgLy8gY2FwdHVyZSBkZWNsYXJhdGlvblxuICAgICAgaWYgKG4uZGVjbGFyYXRpb24gIT0gbnVsbCkge1xuICAgICAgICBzd2l0Y2ggKG4uZGVjbGFyYXRpb24udHlwZSkge1xuICAgICAgICBjYXNlICdGdW5jdGlvbkRlY2xhcmF0aW9uJzpcbiAgICAgICAgY2FzZSAnQ2xhc3NEZWNsYXJhdGlvbic6XG4gICAgICAgIGNhc2UgJ1R5cGVBbGlhcyc6IC8vIGZsb3d0eXBlIHdpdGggYmFiZWwtZXNsaW50IHBhcnNlclxuICAgICAgICBjYXNlICdJbnRlcmZhY2VEZWNsYXJhdGlvbic6XG4gICAgICAgIGNhc2UgJ0RlY2xhcmVGdW5jdGlvbic6XG4gICAgICAgIGNhc2UgJ1RTRGVjbGFyZUZ1bmN0aW9uJzpcbiAgICAgICAgY2FzZSAnVFNFbnVtRGVjbGFyYXRpb24nOlxuICAgICAgICBjYXNlICdUU1R5cGVBbGlhc0RlY2xhcmF0aW9uJzpcbiAgICAgICAgY2FzZSAnVFNJbnRlcmZhY2VEZWNsYXJhdGlvbic6XG4gICAgICAgIGNhc2UgJ1RTQWJzdHJhY3RDbGFzc0RlY2xhcmF0aW9uJzpcbiAgICAgICAgY2FzZSAnVFNNb2R1bGVEZWNsYXJhdGlvbic6XG4gICAgICAgICAgbS5uYW1lc3BhY2Uuc2V0KG4uZGVjbGFyYXRpb24uaWQubmFtZSwgY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2VycywgbikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdWYXJpYWJsZURlY2xhcmF0aW9uJzpcbiAgICAgICAgICBuLmRlY2xhcmF0aW9uLmRlY2xhcmF0aW9ucy5mb3JFYWNoKChkKSA9PlxuICAgICAgICAgICAgcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUoZC5pZCxcbiAgICAgICAgICAgICAgaWQgPT4gbS5uYW1lc3BhY2Uuc2V0KGlkLm5hbWUsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIGQsIG4pKSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG4uc3BlY2lmaWVycy5mb3JFYWNoKChzKSA9PiBwcm9jZXNzU3BlY2lmaWVyKHMsIG4sIG0pKTtcbiAgICB9XG5cbiAgICBjb25zdCBleHBvcnRzID0gWydUU0V4cG9ydEFzc2lnbm1lbnQnXTtcbiAgICBpZiAoaXNFc01vZHVsZUludGVyb3BUcnVlKSB7XG4gICAgICBleHBvcnRzLnB1c2goJ1RTTmFtZXNwYWNlRXhwb3J0RGVjbGFyYXRpb24nKTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIGRvZXNuJ3QgZGVjbGFyZSBhbnl0aGluZywgYnV0IGNoYW5nZXMgd2hhdCdzIGJlaW5nIGV4cG9ydGVkLlxuICAgIGlmIChpbmNsdWRlcyhleHBvcnRzLCBuLnR5cGUpKSB7XG4gICAgICBjb25zdCBleHBvcnRlZE5hbWUgPSBuLnR5cGUgPT09ICdUU05hbWVzcGFjZUV4cG9ydERlY2xhcmF0aW9uJ1xuICAgICAgICA/IChuLmlkIHx8IG4ubmFtZSkubmFtZVxuICAgICAgICA6IChuLmV4cHJlc3Npb24gJiYgbi5leHByZXNzaW9uLm5hbWUgfHwgKG4uZXhwcmVzc2lvbi5pZCAmJiBuLmV4cHJlc3Npb24uaWQubmFtZSkgfHwgbnVsbCk7XG4gICAgICBjb25zdCBkZWNsVHlwZXMgPSBbXG4gICAgICAgICdWYXJpYWJsZURlY2xhcmF0aW9uJyxcbiAgICAgICAgJ0NsYXNzRGVjbGFyYXRpb24nLFxuICAgICAgICAnVFNEZWNsYXJlRnVuY3Rpb24nLFxuICAgICAgICAnVFNFbnVtRGVjbGFyYXRpb24nLFxuICAgICAgICAnVFNUeXBlQWxpYXNEZWNsYXJhdGlvbicsXG4gICAgICAgICdUU0ludGVyZmFjZURlY2xhcmF0aW9uJyxcbiAgICAgICAgJ1RTQWJzdHJhY3RDbGFzc0RlY2xhcmF0aW9uJyxcbiAgICAgICAgJ1RTTW9kdWxlRGVjbGFyYXRpb24nLFxuICAgICAgXTtcbiAgICAgIGNvbnN0IGV4cG9ydGVkRGVjbHMgPSBhc3QuYm9keS5maWx0ZXIoKHsgdHlwZSwgaWQsIGRlY2xhcmF0aW9ucyB9KSA9PiBpbmNsdWRlcyhkZWNsVHlwZXMsIHR5cGUpICYmIChcbiAgICAgICAgKGlkICYmIGlkLm5hbWUgPT09IGV4cG9ydGVkTmFtZSkgfHwgKGRlY2xhcmF0aW9ucyAmJiBkZWNsYXJhdGlvbnMuZmluZCgoZCkgPT4gZC5pZC5uYW1lID09PSBleHBvcnRlZE5hbWUpKVxuICAgICAgKSk7XG4gICAgICBpZiAoZXhwb3J0ZWREZWNscy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gRXhwb3J0IGlzIG5vdCByZWZlcmVuY2luZyBhbnkgbG9jYWwgZGVjbGFyYXRpb24sIG11c3QgYmUgcmUtZXhwb3J0aW5nXG4gICAgICAgIG0ubmFtZXNwYWNlLnNldCgnZGVmYXVsdCcsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIG4pKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICBpc0VzTW9kdWxlSW50ZXJvcFRydWUgLy8gZXNNb2R1bGVJbnRlcm9wIGlzIG9uIGluIHRzY29uZmlnXG4gICAgICAgICYmICFtLm5hbWVzcGFjZS5oYXMoJ2RlZmF1bHQnKSAvLyBhbmQgZGVmYXVsdCBpc24ndCBhZGRlZCBhbHJlYWR5XG4gICAgICApIHtcbiAgICAgICAgbS5uYW1lc3BhY2Uuc2V0KCdkZWZhdWx0Jywge30pOyAvLyBhZGQgZGVmYXVsdCBleHBvcnRcbiAgICAgIH1cbiAgICAgIGV4cG9ydGVkRGVjbHMuZm9yRWFjaCgoZGVjbCkgPT4ge1xuICAgICAgICBpZiAoZGVjbC50eXBlID09PSAnVFNNb2R1bGVEZWNsYXJhdGlvbicpIHtcbiAgICAgICAgICBpZiAoZGVjbC5ib2R5ICYmIGRlY2wuYm9keS50eXBlID09PSAnVFNNb2R1bGVEZWNsYXJhdGlvbicpIHtcbiAgICAgICAgICAgIG0ubmFtZXNwYWNlLnNldChkZWNsLmJvZHkuaWQubmFtZSwgY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2VycywgZGVjbC5ib2R5KSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChkZWNsLmJvZHkgJiYgZGVjbC5ib2R5LmJvZHkpIHtcbiAgICAgICAgICAgIGRlY2wuYm9keS5ib2R5LmZvckVhY2goKG1vZHVsZUJsb2NrTm9kZSkgPT4ge1xuICAgICAgICAgICAgICAvLyBFeHBvcnQtYXNzaWdubWVudCBleHBvcnRzIGFsbCBtZW1iZXJzIGluIHRoZSBuYW1lc3BhY2UsXG4gICAgICAgICAgICAgIC8vIGV4cGxpY2l0bHkgZXhwb3J0ZWQgb3Igbm90LlxuICAgICAgICAgICAgICBjb25zdCBuYW1lc3BhY2VEZWNsID0gbW9kdWxlQmxvY2tOb2RlLnR5cGUgPT09ICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJyA/XG4gICAgICAgICAgICAgICAgbW9kdWxlQmxvY2tOb2RlLmRlY2xhcmF0aW9uIDpcbiAgICAgICAgICAgICAgICBtb2R1bGVCbG9ja05vZGU7XG5cbiAgICAgICAgICAgICAgaWYgKCFuYW1lc3BhY2VEZWNsKSB7XG4gICAgICAgICAgICAgICAgLy8gVHlwZVNjcmlwdCBjYW4gY2hlY2sgdGhpcyBmb3IgdXM7IHdlIG5lZWRuJ3RcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lc3BhY2VEZWNsLnR5cGUgPT09ICdWYXJpYWJsZURlY2xhcmF0aW9uJykge1xuICAgICAgICAgICAgICAgIG5hbWVzcGFjZURlY2wuZGVjbGFyYXRpb25zLmZvckVhY2goKGQpID0+XG4gICAgICAgICAgICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShkLmlkLCAoaWQpID0+IG0ubmFtZXNwYWNlLnNldChcbiAgICAgICAgICAgICAgICAgICAgaWQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2VycywgZGVjbCwgbmFtZXNwYWNlRGVjbCwgbW9kdWxlQmxvY2tOb2RlKSxcbiAgICAgICAgICAgICAgICAgICkpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbS5uYW1lc3BhY2Uuc2V0KFxuICAgICAgICAgICAgICAgICAgbmFtZXNwYWNlRGVjbC5pZC5uYW1lLFxuICAgICAgICAgICAgICAgICAgY2FwdHVyZURvYyhzb3VyY2UsIGRvY1N0eWxlUGFyc2VycywgbW9kdWxlQmxvY2tOb2RlKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBFeHBvcnQgYXMgZGVmYXVsdFxuICAgICAgICAgIG0ubmFtZXNwYWNlLnNldCgnZGVmYXVsdCcsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIGRlY2wpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBpZiAoXG4gICAgaXNFc01vZHVsZUludGVyb3BUcnVlIC8vIGVzTW9kdWxlSW50ZXJvcCBpcyBvbiBpbiB0c2NvbmZpZ1xuICAgICYmIG0ubmFtZXNwYWNlLnNpemUgPiAwIC8vIGFueXRoaW5nIGlzIGV4cG9ydGVkXG4gICAgJiYgIW0ubmFtZXNwYWNlLmhhcygnZGVmYXVsdCcpIC8vIGFuZCBkZWZhdWx0IGlzbid0IGFkZGVkIGFscmVhZHlcbiAgKSB7XG4gICAgbS5uYW1lc3BhY2Uuc2V0KCdkZWZhdWx0Jywge30pOyAvLyBhZGQgZGVmYXVsdCBleHBvcnRcbiAgfVxuXG4gIGlmICh1bmFtYmlndW91c2x5RVNNKSB7XG4gICAgbS5wYXJzZUdvYWwgPSAnTW9kdWxlJztcbiAgfVxuICByZXR1cm4gbTtcbn07XG5cbi8qKlxuICogVGhlIGNyZWF0aW9uIG9mIHRoaXMgY2xvc3VyZSBpcyBpc29sYXRlZCBmcm9tIG90aGVyIHNjb3Blc1xuICogdG8gYXZvaWQgb3Zlci1yZXRlbnRpb24gb2YgdW5yZWxhdGVkIHZhcmlhYmxlcywgd2hpY2ggaGFzXG4gKiBjYXVzZWQgbWVtb3J5IGxlYWtzLiBTZWUgIzEyNjYuXG4gKi9cbmZ1bmN0aW9uIHRodW5rRm9yKHAsIGNvbnRleHQpIHtcbiAgcmV0dXJuICgpID0+IEV4cG9ydE1hcC5mb3IoY2hpbGRDb250ZXh0KHAsIGNvbnRleHQpKTtcbn1cblxuXG4vKipcbiAqIFRyYXZlcnNlIGEgcGF0dGVybi9pZGVudGlmaWVyIG5vZGUsIGNhbGxpbmcgJ2NhbGxiYWNrJ1xuICogZm9yIGVhY2ggbGVhZiBpZGVudGlmaWVyLlxuICogQHBhcmFtICB7bm9kZX0gICBwYXR0ZXJuXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge3ZvaWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShwYXR0ZXJuLCBjYWxsYmFjaykge1xuICBzd2l0Y2ggKHBhdHRlcm4udHlwZSkge1xuICBjYXNlICdJZGVudGlmaWVyJzogLy8gYmFzZSBjYXNlXG4gICAgY2FsbGJhY2socGF0dGVybik7XG4gICAgYnJlYWs7XG5cbiAgY2FzZSAnT2JqZWN0UGF0dGVybic6XG4gICAgcGF0dGVybi5wcm9wZXJ0aWVzLmZvckVhY2gocCA9PiB7XG4gICAgICBpZiAocC50eXBlID09PSAnRXhwZXJpbWVudGFsUmVzdFByb3BlcnR5JyB8fCBwLnR5cGUgPT09ICdSZXN0RWxlbWVudCcpIHtcbiAgICAgICAgY2FsbGJhY2socC5hcmd1bWVudCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKHAudmFsdWUsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgICBicmVhaztcblxuICBjYXNlICdBcnJheVBhdHRlcm4nOlxuICAgIHBhdHRlcm4uZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgaWYgKGVsZW1lbnQgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PT0gJ0V4cGVyaW1lbnRhbFJlc3RQcm9wZXJ0eScgfHwgZWxlbWVudC50eXBlID09PSAnUmVzdEVsZW1lbnQnKSB7XG4gICAgICAgIGNhbGxiYWNrKGVsZW1lbnQuYXJndW1lbnQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShlbGVtZW50LCBjYWxsYmFjayk7XG4gICAgfSk7XG4gICAgYnJlYWs7XG5cbiAgY2FzZSAnQXNzaWdubWVudFBhdHRlcm4nOlxuICAgIGNhbGxiYWNrKHBhdHRlcm4ubGVmdCk7XG4gICAgYnJlYWs7XG4gIH1cbn1cblxuLyoqXG4gKiBkb24ndCBob2xkIGZ1bGwgY29udGV4dCBvYmplY3QgaW4gbWVtb3J5LCBqdXN0IGdyYWIgd2hhdCB3ZSBuZWVkLlxuICovXG5mdW5jdGlvbiBjaGlsZENvbnRleHQocGF0aCwgY29udGV4dCkge1xuICBjb25zdCB7IHNldHRpbmdzLCBwYXJzZXJPcHRpb25zLCBwYXJzZXJQYXRoIH0gPSBjb250ZXh0O1xuICByZXR1cm4ge1xuICAgIHNldHRpbmdzLFxuICAgIHBhcnNlck9wdGlvbnMsXG4gICAgcGFyc2VyUGF0aCxcbiAgICBwYXRoLFxuICB9O1xufVxuXG5cbi8qKlxuICogc29tZXRpbWVzIGxlZ2FjeSBzdXBwb3J0IGlzbid0IF90aGF0XyBoYXJkLi4uIHJpZ2h0P1xuICovXG5mdW5jdGlvbiBtYWtlU291cmNlQ29kZSh0ZXh0LCBhc3QpIHtcbiAgaWYgKFNvdXJjZUNvZGUubGVuZ3RoID4gMSkge1xuICAgIC8vIEVTTGludCAzXG4gICAgcmV0dXJuIG5ldyBTb3VyY2VDb2RlKHRleHQsIGFzdCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gRVNMaW50IDQsIDVcbiAgICByZXR1cm4gbmV3IFNvdXJjZUNvZGUoeyB0ZXh0LCBhc3QgfSk7XG4gIH1cbn1cbiJdfQ==