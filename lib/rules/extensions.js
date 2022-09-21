'use strict';var _path = require('path');var _path2 = _interopRequireDefault(_path);

var _resolve = require('eslint-module-utils/resolve');var _resolve2 = _interopRequireDefault(_resolve);
var _importType = require('../core/importType');
var _moduleVisitor = require('eslint-module-utils/moduleVisitor');var _moduleVisitor2 = _interopRequireDefault(_moduleVisitor);
var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

var enumValues = { 'enum': ['always', 'ignorePackages', 'never'] };
var patternProperties = {
  type: 'object',
  patternProperties: { '.*': enumValues } };

var properties = {
  type: 'object',
  properties: {
    'pattern': patternProperties,
    'ignorePackages': { type: 'boolean' } } };



function buildProperties(context) {

  var result = {
    defaultConfig: 'never',
    pattern: {},
    ignorePackages: false };


  context.options.forEach(function (obj) {

    // If this is a string, set defaultConfig to its value
    if (typeof obj === 'string') {
      result.defaultConfig = obj;
      return;
    }

    // If this is not the new structure, transfer all props to result.pattern
    if (obj.pattern === undefined && obj.ignorePackages === undefined) {
      Object.assign(result.pattern, obj);
      return;
    }

    // If pattern is provided, transfer all props
    if (obj.pattern !== undefined) {
      Object.assign(result.pattern, obj.pattern);
    }

    // If ignorePackages is provided, transfer it to result
    if (obj.ignorePackages !== undefined) {
      result.ignorePackages = obj.ignorePackages;
    }
  });

  if (result.defaultConfig === 'ignorePackages') {
    result.defaultConfig = 'always';
    result.ignorePackages = true;
  }

  return result;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      url: (0, _docsUrl2['default'])('extensions') },


    schema: {
      anyOf: [
      {
        type: 'array',
        items: [enumValues],
        additionalItems: false },

      {
        type: 'array',
        items: [
        enumValues,
        properties],

        additionalItems: false },

      {
        type: 'array',
        items: [properties],
        additionalItems: false },

      {
        type: 'array',
        items: [patternProperties],
        additionalItems: false },

      {
        type: 'array',
        items: [
        enumValues,
        patternProperties],

        additionalItems: false }] } },





  create: function () {function create(context) {

      var props = buildProperties(context);

      function getModifier(extension) {
        return props.pattern[extension] || props.defaultConfig;
      }

      function isUseOfExtensionRequired(extension, isPackage) {
        return getModifier(extension) === 'always' && (!props.ignorePackages || !isPackage);
      }

      function isUseOfExtensionForbidden(extension) {
        return getModifier(extension) === 'never';
      }

      function isResolvableWithoutExtension(file) {
        var extension = _path2['default'].extname(file);
        var fileWithoutExtension = file.slice(0, -extension.length);
        var resolvedFileWithoutExtension = (0, _resolve2['default'])(fileWithoutExtension, context);

        return resolvedFileWithoutExtension === (0, _resolve2['default'])(file, context);
      }

      function isExternalRootModule(file) {
        var slashCount = file.split('/').length - 1;

        if (slashCount === 0) return true;
        if ((0, _importType.isScoped)(file) && slashCount <= 1) return true;
        return false;
      }

      function checkFileExtension(source, node) {
        // bail if the declaration doesn't have a source, e.g. "export { foo };", or if it's only partially typed like in an editor
        if (!source || !source.value) return;

        var importPathWithQueryString = source.value;

        // don't enforce anything on builtins
        if ((0, _importType.isBuiltIn)(importPathWithQueryString, context.settings)) return;

        var importPath = importPathWithQueryString.replace(/\?(.*)$/, '');

        // don't enforce in root external packages as they may have names with `.js`.
        // Like `import Decimal from decimal.js`)
        if (isExternalRootModule(importPath)) return;

        var resolvedPath = (0, _resolve2['default'])(importPath, context);

        // get extension from resolved path, if possible.
        // for unresolved, use source value.
        var extension = _path2['default'].extname(resolvedPath || importPath).substring(1);

        // determine if this is a module
        var isPackage = (0, _importType.isExternalModule)(
        importPath,
        (0, _resolve2['default'])(importPath, context),
        context) ||
        (0, _importType.isScoped)(importPath);

        if (!extension || !importPath.endsWith('.' + String(extension))) {
          // ignore type-only imports and exports
          if (node.importKind === 'type' || node.exportKind === 'type') return;
          var extensionRequired = isUseOfExtensionRequired(extension, isPackage);
          var extensionForbidden = isUseOfExtensionForbidden(extension);
          if (extensionRequired && !extensionForbidden) {
            context.report({
              node: source,
              message: 'Missing file extension ' + (
              extension ? '"' + String(extension) + '" ' : '') + 'for "' + String(importPathWithQueryString) + '"' });

          }
        } else if (extension) {
          if (isUseOfExtensionForbidden(extension) && isResolvableWithoutExtension(importPath)) {
            context.report({
              node: source,
              message: 'Unexpected use of file extension "' + String(extension) + '" for "' + String(importPathWithQueryString) + '"' });

          }
        }
      }

      return (0, _moduleVisitor2['default'])(checkFileExtension, { commonjs: true });
    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9leHRlbnNpb25zLmpzIl0sIm5hbWVzIjpbImVudW1WYWx1ZXMiLCJwYXR0ZXJuUHJvcGVydGllcyIsInR5cGUiLCJwcm9wZXJ0aWVzIiwiYnVpbGRQcm9wZXJ0aWVzIiwiY29udGV4dCIsInJlc3VsdCIsImRlZmF1bHRDb25maWciLCJwYXR0ZXJuIiwiaWdub3JlUGFja2FnZXMiLCJvcHRpb25zIiwiZm9yRWFjaCIsIm9iaiIsInVuZGVmaW5lZCIsIk9iamVjdCIsImFzc2lnbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsInVybCIsInNjaGVtYSIsImFueU9mIiwiaXRlbXMiLCJhZGRpdGlvbmFsSXRlbXMiLCJjcmVhdGUiLCJwcm9wcyIsImdldE1vZGlmaWVyIiwiZXh0ZW5zaW9uIiwiaXNVc2VPZkV4dGVuc2lvblJlcXVpcmVkIiwiaXNQYWNrYWdlIiwiaXNVc2VPZkV4dGVuc2lvbkZvcmJpZGRlbiIsImlzUmVzb2x2YWJsZVdpdGhvdXRFeHRlbnNpb24iLCJmaWxlIiwicGF0aCIsImV4dG5hbWUiLCJmaWxlV2l0aG91dEV4dGVuc2lvbiIsInNsaWNlIiwibGVuZ3RoIiwicmVzb2x2ZWRGaWxlV2l0aG91dEV4dGVuc2lvbiIsImlzRXh0ZXJuYWxSb290TW9kdWxlIiwic2xhc2hDb3VudCIsInNwbGl0IiwiY2hlY2tGaWxlRXh0ZW5zaW9uIiwic291cmNlIiwibm9kZSIsInZhbHVlIiwiaW1wb3J0UGF0aFdpdGhRdWVyeVN0cmluZyIsInNldHRpbmdzIiwiaW1wb3J0UGF0aCIsInJlcGxhY2UiLCJyZXNvbHZlZFBhdGgiLCJzdWJzdHJpbmciLCJlbmRzV2l0aCIsImltcG9ydEtpbmQiLCJleHBvcnRLaW5kIiwiZXh0ZW5zaW9uUmVxdWlyZWQiLCJleHRlbnNpb25Gb3JiaWRkZW4iLCJyZXBvcnQiLCJtZXNzYWdlIiwiY29tbW9uanMiXSwibWFwcGluZ3MiOiJhQUFBLDRCOztBQUVBLHNEO0FBQ0E7QUFDQSxr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VUFBVSxJQUFaLEVBQWxDLENBQVA7QUFDRCxLQS9IYyxtQkFBakIiLCJmaWxlIjoiZXh0ZW5zaW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgcmVzb2x2ZSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3Jlc29sdmUnO1xuaW1wb3J0IHsgaXNCdWlsdEluLCBpc0V4dGVybmFsTW9kdWxlLCBpc1Njb3BlZCB9IGZyb20gJy4uL2NvcmUvaW1wb3J0VHlwZSc7XG5pbXBvcnQgbW9kdWxlVmlzaXRvciBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL21vZHVsZVZpc2l0b3InO1xuaW1wb3J0IGRvY3NVcmwgZnJvbSAnLi4vZG9jc1VybCc7XG5cbmNvbnN0IGVudW1WYWx1ZXMgPSB7IGVudW06IFsgJ2Fsd2F5cycsICdpZ25vcmVQYWNrYWdlcycsICduZXZlcicgXSB9O1xuY29uc3QgcGF0dGVyblByb3BlcnRpZXMgPSB7XG4gIHR5cGU6ICdvYmplY3QnLFxuICBwYXR0ZXJuUHJvcGVydGllczogeyAnLionOiBlbnVtVmFsdWVzIH0sXG59O1xuY29uc3QgcHJvcGVydGllcyA9IHtcbiAgdHlwZTogJ29iamVjdCcsXG4gIHByb3BlcnRpZXM6IHtcbiAgICAncGF0dGVybic6IHBhdHRlcm5Qcm9wZXJ0aWVzLFxuICAgICdpZ25vcmVQYWNrYWdlcyc6IHsgdHlwZTogJ2Jvb2xlYW4nIH0sXG4gIH0sXG59O1xuXG5mdW5jdGlvbiBidWlsZFByb3BlcnRpZXMoY29udGV4dCkge1xuXG4gIGNvbnN0IHJlc3VsdCA9IHtcbiAgICBkZWZhdWx0Q29uZmlnOiAnbmV2ZXInLFxuICAgIHBhdHRlcm46IHt9LFxuICAgIGlnbm9yZVBhY2thZ2VzOiBmYWxzZSxcbiAgfTtcblxuICBjb250ZXh0Lm9wdGlvbnMuZm9yRWFjaChvYmogPT4ge1xuXG4gICAgLy8gSWYgdGhpcyBpcyBhIHN0cmluZywgc2V0IGRlZmF1bHRDb25maWcgdG8gaXRzIHZhbHVlXG4gICAgaWYgKHR5cGVvZiBvYmogPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXN1bHQuZGVmYXVsdENvbmZpZyA9IG9iajtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGlzIGlzIG5vdCB0aGUgbmV3IHN0cnVjdHVyZSwgdHJhbnNmZXIgYWxsIHByb3BzIHRvIHJlc3VsdC5wYXR0ZXJuXG4gICAgaWYgKG9iai5wYXR0ZXJuID09PSB1bmRlZmluZWQgJiYgb2JqLmlnbm9yZVBhY2thZ2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LnBhdHRlcm4sIG9iaik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgcGF0dGVybiBpcyBwcm92aWRlZCwgdHJhbnNmZXIgYWxsIHByb3BzXG4gICAgaWYgKG9iai5wYXR0ZXJuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LnBhdHRlcm4sIG9iai5wYXR0ZXJuKTtcbiAgICB9XG5cbiAgICAvLyBJZiBpZ25vcmVQYWNrYWdlcyBpcyBwcm92aWRlZCwgdHJhbnNmZXIgaXQgdG8gcmVzdWx0XG4gICAgaWYgKG9iai5pZ25vcmVQYWNrYWdlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXN1bHQuaWdub3JlUGFja2FnZXMgPSBvYmouaWdub3JlUGFja2FnZXM7XG4gICAgfVxuICB9KTtcblxuICBpZiAocmVzdWx0LmRlZmF1bHRDb25maWcgPT09ICdpZ25vcmVQYWNrYWdlcycpIHtcbiAgICByZXN1bHQuZGVmYXVsdENvbmZpZyA9ICdhbHdheXMnO1xuICAgIHJlc3VsdC5pZ25vcmVQYWNrYWdlcyA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIHR5cGU6ICdzdWdnZXN0aW9uJyxcbiAgICBkb2NzOiB7XG4gICAgICB1cmw6IGRvY3NVcmwoJ2V4dGVuc2lvbnMnKSxcbiAgICB9LFxuXG4gICAgc2NoZW1hOiB7XG4gICAgICBhbnlPZjogW1xuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgICBpdGVtczogW2VudW1WYWx1ZXNdLFxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICBlbnVtVmFsdWVzLFxuICAgICAgICAgICAgcHJvcGVydGllcyxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnYXJyYXknLFxuICAgICAgICAgIGl0ZW1zOiBbcHJvcGVydGllc10sXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgaXRlbXM6IFtwYXR0ZXJuUHJvcGVydGllc10sXG4gICAgICAgICAgYWRkaXRpb25hbEl0ZW1zOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdhcnJheScsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIGVudW1WYWx1ZXMsXG4gICAgICAgICAgICBwYXR0ZXJuUHJvcGVydGllcyxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGFkZGl0aW9uYWxJdGVtczogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIH0sXG5cbiAgY3JlYXRlKGNvbnRleHQpIHtcblxuICAgIGNvbnN0IHByb3BzID0gYnVpbGRQcm9wZXJ0aWVzKGNvbnRleHQpO1xuXG4gICAgZnVuY3Rpb24gZ2V0TW9kaWZpZXIoZXh0ZW5zaW9uKSB7XG4gICAgICByZXR1cm4gcHJvcHMucGF0dGVybltleHRlbnNpb25dIHx8IHByb3BzLmRlZmF1bHRDb25maWc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNVc2VPZkV4dGVuc2lvblJlcXVpcmVkKGV4dGVuc2lvbiwgaXNQYWNrYWdlKSB7XG4gICAgICByZXR1cm4gZ2V0TW9kaWZpZXIoZXh0ZW5zaW9uKSA9PT0gJ2Fsd2F5cycgJiYgKCFwcm9wcy5pZ25vcmVQYWNrYWdlcyB8fCAhaXNQYWNrYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1VzZU9mRXh0ZW5zaW9uRm9yYmlkZGVuKGV4dGVuc2lvbikge1xuICAgICAgcmV0dXJuIGdldE1vZGlmaWVyKGV4dGVuc2lvbikgPT09ICduZXZlcic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNSZXNvbHZhYmxlV2l0aG91dEV4dGVuc2lvbihmaWxlKSB7XG4gICAgICBjb25zdCBleHRlbnNpb24gPSBwYXRoLmV4dG5hbWUoZmlsZSk7XG4gICAgICBjb25zdCBmaWxlV2l0aG91dEV4dGVuc2lvbiA9IGZpbGUuc2xpY2UoMCwgLWV4dGVuc2lvbi5sZW5ndGgpO1xuICAgICAgY29uc3QgcmVzb2x2ZWRGaWxlV2l0aG91dEV4dGVuc2lvbiA9IHJlc29sdmUoZmlsZVdpdGhvdXRFeHRlbnNpb24sIGNvbnRleHQpO1xuXG4gICAgICByZXR1cm4gcmVzb2x2ZWRGaWxlV2l0aG91dEV4dGVuc2lvbiA9PT0gcmVzb2x2ZShmaWxlLCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0V4dGVybmFsUm9vdE1vZHVsZShmaWxlKSB7XG4gICAgICBjb25zdCBzbGFzaENvdW50ID0gZmlsZS5zcGxpdCgnLycpLmxlbmd0aCAtIDE7XG5cbiAgICAgIGlmIChzbGFzaENvdW50ID09PSAwKSAgcmV0dXJuIHRydWU7XG4gICAgICBpZiAoaXNTY29wZWQoZmlsZSkgJiYgc2xhc2hDb3VudCA8PSAxKSByZXR1cm4gdHJ1ZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja0ZpbGVFeHRlbnNpb24oc291cmNlLCBub2RlKSB7XG4gICAgICAvLyBiYWlsIGlmIHRoZSBkZWNsYXJhdGlvbiBkb2Vzbid0IGhhdmUgYSBzb3VyY2UsIGUuZy4gXCJleHBvcnQgeyBmb28gfTtcIiwgb3IgaWYgaXQncyBvbmx5IHBhcnRpYWxseSB0eXBlZCBsaWtlIGluIGFuIGVkaXRvclxuICAgICAgaWYgKCFzb3VyY2UgfHwgIXNvdXJjZS52YWx1ZSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBpbXBvcnRQYXRoV2l0aFF1ZXJ5U3RyaW5nID0gc291cmNlLnZhbHVlO1xuXG4gICAgICAvLyBkb24ndCBlbmZvcmNlIGFueXRoaW5nIG9uIGJ1aWx0aW5zXG4gICAgICBpZiAoaXNCdWlsdEluKGltcG9ydFBhdGhXaXRoUXVlcnlTdHJpbmcsIGNvbnRleHQuc2V0dGluZ3MpKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IGltcG9ydFBhdGggPSBpbXBvcnRQYXRoV2l0aFF1ZXJ5U3RyaW5nLnJlcGxhY2UoL1xcPyguKikkLywgJycpO1xuXG4gICAgICAvLyBkb24ndCBlbmZvcmNlIGluIHJvb3QgZXh0ZXJuYWwgcGFja2FnZXMgYXMgdGhleSBtYXkgaGF2ZSBuYW1lcyB3aXRoIGAuanNgLlxuICAgICAgLy8gTGlrZSBgaW1wb3J0IERlY2ltYWwgZnJvbSBkZWNpbWFsLmpzYClcbiAgICAgIGlmIChpc0V4dGVybmFsUm9vdE1vZHVsZShpbXBvcnRQYXRoKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlKGltcG9ydFBhdGgsIGNvbnRleHQpO1xuXG4gICAgICAvLyBnZXQgZXh0ZW5zaW9uIGZyb20gcmVzb2x2ZWQgcGF0aCwgaWYgcG9zc2libGUuXG4gICAgICAvLyBmb3IgdW5yZXNvbHZlZCwgdXNlIHNvdXJjZSB2YWx1ZS5cbiAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IHBhdGguZXh0bmFtZShyZXNvbHZlZFBhdGggfHwgaW1wb3J0UGF0aCkuc3Vic3RyaW5nKDEpO1xuXG4gICAgICAvLyBkZXRlcm1pbmUgaWYgdGhpcyBpcyBhIG1vZHVsZVxuICAgICAgY29uc3QgaXNQYWNrYWdlID0gaXNFeHRlcm5hbE1vZHVsZShcbiAgICAgICAgaW1wb3J0UGF0aCxcbiAgICAgICAgcmVzb2x2ZShpbXBvcnRQYXRoLCBjb250ZXh0KSxcbiAgICAgICAgY29udGV4dCxcbiAgICAgICkgfHwgaXNTY29wZWQoaW1wb3J0UGF0aCk7XG5cbiAgICAgIGlmICghZXh0ZW5zaW9uIHx8ICFpbXBvcnRQYXRoLmVuZHNXaXRoKGAuJHtleHRlbnNpb259YCkpIHtcbiAgICAgICAgLy8gaWdub3JlIHR5cGUtb25seSBpbXBvcnRzIGFuZCBleHBvcnRzXG4gICAgICAgIGlmIChub2RlLmltcG9ydEtpbmQgPT09ICd0eXBlJyB8fCBub2RlLmV4cG9ydEtpbmQgPT09ICd0eXBlJykgcmV0dXJuO1xuICAgICAgICBjb25zdCBleHRlbnNpb25SZXF1aXJlZCA9IGlzVXNlT2ZFeHRlbnNpb25SZXF1aXJlZChleHRlbnNpb24sIGlzUGFja2FnZSk7XG4gICAgICAgIGNvbnN0IGV4dGVuc2lvbkZvcmJpZGRlbiA9IGlzVXNlT2ZFeHRlbnNpb25Gb3JiaWRkZW4oZXh0ZW5zaW9uKTtcbiAgICAgICAgaWYgKGV4dGVuc2lvblJlcXVpcmVkICYmICFleHRlbnNpb25Gb3JiaWRkZW4pIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgICBub2RlOiBzb3VyY2UsXG4gICAgICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgICAgICBgTWlzc2luZyBmaWxlIGV4dGVuc2lvbiAke2V4dGVuc2lvbiA/IGBcIiR7ZXh0ZW5zaW9ufVwiIGAgOiAnJ31mb3IgXCIke2ltcG9ydFBhdGhXaXRoUXVlcnlTdHJpbmd9XCJgLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGV4dGVuc2lvbikge1xuICAgICAgICBpZiAoaXNVc2VPZkV4dGVuc2lvbkZvcmJpZGRlbihleHRlbnNpb24pICYmIGlzUmVzb2x2YWJsZVdpdGhvdXRFeHRlbnNpb24oaW1wb3J0UGF0aCkpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgICBub2RlOiBzb3VyY2UsXG4gICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCB1c2Ugb2YgZmlsZSBleHRlbnNpb24gXCIke2V4dGVuc2lvbn1cIiBmb3IgXCIke2ltcG9ydFBhdGhXaXRoUXVlcnlTdHJpbmd9XCJgLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1vZHVsZVZpc2l0b3IoY2hlY2tGaWxlRXh0ZW5zaW9uLCB7IGNvbW1vbmpzOiB0cnVlIH0pO1xuICB9LFxufTtcbiJdfQ==