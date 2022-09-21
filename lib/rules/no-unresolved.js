'use strict';




var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _ModuleCache = require('eslint-module-utils/ModuleCache');var _ModuleCache2 = _interopRequireDefault(_ModuleCache);
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };} /**
                                                                                                                                                                                       * @fileOverview Ensures that an imported path exists, given resolution rules.
                                                                                                                                                                                       * @author Ben Mosher
                                                                                                                                                                                       */module.exports = { meta: {
    type: 'problem',
    docs: {
      url: (0, _docsUrl2['default'])('no-unresolved') },


    schema: [
    (0, _moduleVisitor.makeOptionsSchema)({
      caseSensitive: { type: 'boolean', 'default': true },
      caseSensitiveStrict: { type: 'boolean', 'default': false } })] },




  create: function () {function create(context) {
      var options = context.options[0] || {};

      function checkSourceValue(source, node) {
        // ignore type-only imports and exports
        if (node.importKind === 'type' || node.exportKind === 'type') {
          return;
        }

        var caseSensitive = !_resolve.CASE_SENSITIVE_FS && options.caseSensitive !== false;
        var caseSensitiveStrict = !_resolve.CASE_SENSITIVE_FS && options.caseSensitiveStrict;

        var resolvedPath = (0, _resolve2['default'])(source.value, context);

        if (resolvedPath === undefined) {
          context.report(
          source, 'Unable to resolve path to module \'' + String(
          source.value) + '\'.');

        } else if (caseSensitive || caseSensitiveStrict) {
          var cacheSettings = _ModuleCache2['default'].getSettings(context.settings);
          if (!(0, _resolve.fileExistsWithCaseSync)(resolvedPath, cacheSettings, caseSensitiveStrict)) {
            context.report(
            source, 'Casing of ' + String(
            source.value) + ' does not match the underlying filesystem.');

          }
        }
      }

      return (0, _moduleVisitor2['default'])(checkSourceValue, options);
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9uby11bnJlc29sdmVkLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImRvY3MiLCJ1cmwiLCJzY2hlbWEiLCJjYXNlU2Vuc2l0aXZlIiwiY2FzZVNlbnNpdGl2ZVN0cmljdCIsImNyZWF0ZSIsImNvbnRleHQiLCJvcHRpb25zIiwiY2hlY2tTb3VyY2VWYWx1ZSIsInNvdXJjZSIsIm5vZGUiLCJpbXBvcnRLaW5kIiwiZXhwb3J0S2luZCIsIkNBU0VfU0VOU0lUSVZFX0ZTIiwicmVzb2x2ZWRQYXRoIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJyZXBvcnQiLCJjYWNoZVNldHRpbmdzIiwiTW9kdWxlQ2FjaGUiLCJnZXRTZXR0aW5ncyIsInNldHRpbmdzIl0sIm1hcHBpbmdzIjoiOzs7OztBQUtBLHNEO0FBQ0EsOEQ7QUFDQSxrRTtBQUNBLHFDLGlKQVJBOzs7eUxBVUFBLE9BQU9DLE9BQVAsR0FBaUIsRUFDZkMsTUFBTTtBQUNKQyxVQUFNLFNBREY7QUFFSkMsVUFBTTtBQUNKQyxXQUFLLDBCQUFRLGVBQVIsQ0FERCxFQUZGOzs7QUFNSkMsWUFBUTtBQUNOLDBDQUFrQjtBQUNoQkMscUJBQWUsRUFBRUosTUFBTSxTQUFSLEVBQW1CLFdBQVMsSUFBNUIsRUFEQztBQUVoQkssMkJBQXFCLEVBQUVMLE1BQU0sU0FBUixFQUFtQixXQUFTLEtBQTVCLEVBRkwsRUFBbEIsQ0FETSxDQU5KLEVBRFM7Ozs7O0FBZWZNLFFBZmUsK0JBZVJDLE9BZlEsRUFlQztBQUNkLFVBQU1DLFVBQVVELFFBQVFDLE9BQVIsQ0FBZ0IsQ0FBaEIsS0FBc0IsRUFBdEM7O0FBRUEsZUFBU0MsZ0JBQVQsQ0FBMEJDLE1BQTFCLEVBQWtDQyxJQUFsQyxFQUF3QztBQUN0QztBQUNBLFlBQUlBLEtBQUtDLFVBQUwsS0FBb0IsTUFBcEIsSUFBOEJELEtBQUtFLFVBQUwsS0FBb0IsTUFBdEQsRUFBOEQ7QUFDNUQ7QUFDRDs7QUFFRCxZQUFNVCxnQkFBZ0IsQ0FBQ1UsMEJBQUQsSUFBc0JOLFFBQVFKLGFBQVIsS0FBMEIsS0FBdEU7QUFDQSxZQUFNQyxzQkFBc0IsQ0FBQ1MsMEJBQUQsSUFBc0JOLFFBQVFILG1CQUExRDs7QUFFQSxZQUFNVSxlQUFlLDBCQUFRTCxPQUFPTSxLQUFmLEVBQXNCVCxPQUF0QixDQUFyQjs7QUFFQSxZQUFJUSxpQkFBaUJFLFNBQXJCLEVBQWdDO0FBQzlCVixrQkFBUVcsTUFBUjtBQUNFUixnQkFERjtBQUV1Q0EsaUJBQU9NLEtBRjlDOztBQUlELFNBTEQsTUFLTyxJQUFJWixpQkFBaUJDLG1CQUFyQixFQUEwQztBQUMvQyxjQUFNYyxnQkFBZ0JDLHlCQUFZQyxXQUFaLENBQXdCZCxRQUFRZSxRQUFoQyxDQUF0QjtBQUNBLGNBQUksQ0FBQyxxQ0FBdUJQLFlBQXZCLEVBQXFDSSxhQUFyQyxFQUFvRGQsbUJBQXBELENBQUwsRUFBK0U7QUFDN0VFLG9CQUFRVyxNQUFSO0FBQ0VSLGtCQURGO0FBRWVBLG1CQUFPTSxLQUZ0Qjs7QUFJRDtBQUNGO0FBQ0Y7O0FBRUQsYUFBTyxnQ0FBY1AsZ0JBQWQsRUFBZ0NELE9BQWhDLENBQVA7QUFDRCxLQTlDYyxtQkFBakIiLCJmaWxlIjoibm8tdW5yZXNvbHZlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVPdmVydmlldyBFbnN1cmVzIHRoYXQgYW4gaW1wb3J0ZWQgcGF0aCBleGlzdHMsIGdpdmVuIHJlc29sdXRpb24gcnVsZXMuXG4gKiBAYXV0aG9yIEJlbiBNb3NoZXJcbiAqL1xuXG5pbXBvcnQgcmVzb2x2ZSwgeyBDQVNFX1NFTlNJVElWRV9GUywgZmlsZUV4aXN0c1dpdGhDYXNlU3luYyB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcmVzb2x2ZSc7XG5pbXBvcnQgTW9kdWxlQ2FjaGUgZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9Nb2R1bGVDYWNoZSc7XG5pbXBvcnQgbW9kdWxlVmlzaXRvciwgeyBtYWtlT3B0aW9uc1NjaGVtYSB9IGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvbW9kdWxlVmlzaXRvcic7XG5pbXBvcnQgZG9jc1VybCBmcm9tICcuLi9kb2NzVXJsJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgZG9jczoge1xuICAgICAgdXJsOiBkb2NzVXJsKCduby11bnJlc29sdmVkJyksXG4gICAgfSxcblxuICAgIHNjaGVtYTogW1xuICAgICAgbWFrZU9wdGlvbnNTY2hlbWEoe1xuICAgICAgICBjYXNlU2Vuc2l0aXZlOiB7IHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogdHJ1ZSB9LFxuICAgICAgICBjYXNlU2Vuc2l0aXZlU3RyaWN0OiB7IHR5cGU6ICdib29sZWFuJywgZGVmYXVsdDogZmFsc2UgfSxcbiAgICAgIH0pLFxuICAgIF0sXG4gIH0sXG5cbiAgY3JlYXRlKGNvbnRleHQpIHtcbiAgICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9O1xuXG4gICAgZnVuY3Rpb24gY2hlY2tTb3VyY2VWYWx1ZShzb3VyY2UsIG5vZGUpIHtcbiAgICAgIC8vIGlnbm9yZSB0eXBlLW9ubHkgaW1wb3J0cyBhbmQgZXhwb3J0c1xuICAgICAgaWYgKG5vZGUuaW1wb3J0S2luZCA9PT0gJ3R5cGUnIHx8IG5vZGUuZXhwb3J0S2luZCA9PT0gJ3R5cGUnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2FzZVNlbnNpdGl2ZSA9ICFDQVNFX1NFTlNJVElWRV9GUyAmJiBvcHRpb25zLmNhc2VTZW5zaXRpdmUgIT09IGZhbHNlO1xuICAgICAgY29uc3QgY2FzZVNlbnNpdGl2ZVN0cmljdCA9ICFDQVNFX1NFTlNJVElWRV9GUyAmJiBvcHRpb25zLmNhc2VTZW5zaXRpdmVTdHJpY3Q7XG5cbiAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmUoc291cmNlLnZhbHVlLCBjb250ZXh0KTtcblxuICAgICAgaWYgKHJlc29sdmVkUGF0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRleHQucmVwb3J0KFxuICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICBgVW5hYmxlIHRvIHJlc29sdmUgcGF0aCB0byBtb2R1bGUgJyR7c291cmNlLnZhbHVlfScuYCxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoY2FzZVNlbnNpdGl2ZSB8fCBjYXNlU2Vuc2l0aXZlU3RyaWN0KSB7XG4gICAgICAgIGNvbnN0IGNhY2hlU2V0dGluZ3MgPSBNb2R1bGVDYWNoZS5nZXRTZXR0aW5ncyhjb250ZXh0LnNldHRpbmdzKTtcbiAgICAgICAgaWYgKCFmaWxlRXhpc3RzV2l0aENhc2VTeW5jKHJlc29sdmVkUGF0aCwgY2FjaGVTZXR0aW5ncywgY2FzZVNlbnNpdGl2ZVN0cmljdCkpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydChcbiAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgIGBDYXNpbmcgb2YgJHtzb3VyY2UudmFsdWV9IGRvZXMgbm90IG1hdGNoIHRoZSB1bmRlcmx5aW5nIGZpbGVzeXN0ZW0uYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZHVsZVZpc2l0b3IoY2hlY2tTb3VyY2VWYWx1ZSwgb3B0aW9ucyk7XG4gIH0sXG59O1xuIl19