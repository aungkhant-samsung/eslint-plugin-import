'use strict';var _docsUrl = require('../docsUrl');var _docsUrl2 = _interopRequireDefault(_docsUrl);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}

function isComma(token) {
  return token.type === 'Punctuator' && token.value === ',';
}

function removeSpecifiers(fixes, fixer, sourceCode, specifiers) {var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
    for (var _iterator = specifiers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var specifier = _step.value;
      // remove the trailing comma
      var comma = sourceCode.getTokenAfter(specifier, isComma);
      if (comma) {
        fixes.push(fixer.remove(comma));
      }
      fixes.push(fixer.remove(specifier));
    }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator['return']) {_iterator['return']();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
}

function getImportText(
node,
sourceCode,
specifiers,
kind)
{
  var sourceString = sourceCode.getText(node.source);
  if (specifiers.length === 0) {
    return '';
  }

  var names = specifiers.map(function (s) {
    if (s.imported.name === s.local.name) {
      return s.imported.name;
    }
    return String(s.imported.name) + ' as ' + String(s.local.name);
  });
  // insert a fresh top-level import
  return 'import ' + String(kind) + ' {' + String(names.join(', ')) + '} from ' + String(sourceString) + ';';
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce or ban the use of inline type-only markers for named imports',
      url: (0, _docsUrl2['default'])('consistent-type-specifier-style') },

    fixable: 'code',
    schema: [
    {
      type: 'string',
      'enum': ['prefer-inline', 'prefer-top-level'],
      'default': 'prefer-inline' }] },




  create: function () {function create(context) {
      var sourceCode = context.getSourceCode();

      if (context.options[0] === 'prefer-inline') {
        return {
          ImportDeclaration: function () {function ImportDeclaration(node) {
              if (node.importKind === 'value' || node.importKind == null) {
                // top-level value / unknown is valid
                return;
              }

              if (
              // no specifiers (import type {} from '') have no specifiers to mark as inline
              node.specifiers.length === 0 ||
              node.specifiers.length === 1 && (
              // default imports are both "inline" and "top-level"
              node.specifiers[0].type === 'ImportDefaultSpecifier' ||
              // namespace imports are both "inline" and "top-level"
              node.specifiers[0].type === 'ImportNamespaceSpecifier'))
              {
                return;
              }

              context.report({
                node: node,
                message: 'Prefer using inline {{kind}} specifiers instead of a top-level {{kind}}-only import.',
                data: {
                  kind: node.importKind },

                fix: function () {function fix(fixer) {
                    var kindToken = sourceCode.getFirstToken(node, { skip: 1 });

                    return [].concat(
                    kindToken ? fixer.remove(kindToken) : [],
                    node.specifiers.map(function (specifier) {return fixer.insertTextBefore(specifier, String(node.importKind) + ' ');}));

                  }return fix;}() });

            }return ImportDeclaration;}() };

      }

      // prefer-top-level
      return {
        ImportDeclaration: function () {function ImportDeclaration(node) {
            if (
            // already top-level is valid
            node.importKind === 'type' ||
            node.importKind === 'typeof' ||
            // no specifiers (import {} from '') cannot have inline - so is valid
            node.specifiers.length === 0 ||
            node.specifiers.length === 1 && (
            // default imports are both "inline" and "top-level"
            node.specifiers[0].type === 'ImportDefaultSpecifier' ||
            // namespace imports are both "inline" and "top-level"
            node.specifiers[0].type === 'ImportNamespaceSpecifier'))
            {
              return;
            }

            var typeSpecifiers = [];
            var typeofSpecifiers = [];
            var valueSpecifiers = [];
            var defaultSpecifier = null;var _iteratorNormalCompletion2 = true;var _didIteratorError2 = false;var _iteratorError2 = undefined;try {
              for (var _iterator2 = node.specifiers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {var specifier = _step2.value;
                if (specifier.type === 'ImportDefaultSpecifier') {
                  defaultSpecifier = specifier;
                  continue;
                }

                if (specifier.importKind === 'type') {
                  typeSpecifiers.push(specifier);
                } else if (specifier.importKind === 'typeof') {
                  typeofSpecifiers.push(specifier);
                } else if (specifier.importKind === 'value' || specifier.importKind == null) {
                  valueSpecifiers.push(specifier);
                }
              }} catch (err) {_didIteratorError2 = true;_iteratorError2 = err;} finally {try {if (!_iteratorNormalCompletion2 && _iterator2['return']) {_iterator2['return']();}} finally {if (_didIteratorError2) {throw _iteratorError2;}}}

            var typeImport = getImportText(node, sourceCode, typeSpecifiers, 'type');
            var typeofImport = getImportText(node, sourceCode, typeofSpecifiers, 'typeof');
            var newImports = (String(typeImport) + '\n' + String(typeofImport)).trim();

            if (typeSpecifiers.length + typeofSpecifiers.length === node.specifiers.length) {
              // all specifiers have inline specifiers - so we replace the entire import
              var kind = [].concat(
              typeSpecifiers.length > 0 ? 'type' : [],
              typeofSpecifiers.length > 0 ? 'typeof' : []);


              context.report({
                node: node,
                message: 'Prefer using a top-level {{kind}}-only import instead of inline {{kind}} specifiers.',
                data: {
                  kind: kind.join('/') },

                fix: function () {function fix(fixer) {
                    return fixer.replaceText(node, newImports);
                  }return fix;}() });

            } else {
              // remove specific specifiers and insert new imports for them
              var _iteratorNormalCompletion3 = true;var _didIteratorError3 = false;var _iteratorError3 = undefined;try {for (var _iterator3 = typeSpecifiers.concat(typeofSpecifiers)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {var _specifier = _step3.value;
                  context.report({
                    node: _specifier,
                    message: 'Prefer using a top-level {{kind}}-only import instead of inline {{kind}} specifiers.',
                    data: {
                      kind: _specifier.importKind },

                    fix: function () {function fix(fixer) {
                        var fixes = [];

                        // if there are no value specifiers, then the other report fixer will be called, not this one

                        if (valueSpecifiers.length > 0) {
                          // import { Value, type Type } from 'mod';

                          // we can just remove the type specifiers
                          removeSpecifiers(fixes, fixer, sourceCode, typeSpecifiers);
                          removeSpecifiers(fixes, fixer, sourceCode, typeofSpecifiers);

                          // make the import nicely formatted by also removing the trailing comma after the last value import
                          // eg
                          // import { Value, type Type } from 'mod';
                          // to
                          // import { Value  } from 'mod';
                          // not
                          // import { Value,  } from 'mod';
                          var maybeComma = sourceCode.getTokenAfter(valueSpecifiers[valueSpecifiers.length - 1]);
                          if (isComma(maybeComma)) {
                            fixes.push(fixer.remove(maybeComma));
                          }
                        } else if (defaultSpecifier) {
                          // import Default, { type Type } from 'mod';

                          // remove the entire curly block so we don't leave an empty one behind
                          // NOTE - the default specifier *must* be the first specifier always!
                          //        so a comma exists that we also have to clean up or else it's bad syntax
                          var comma = sourceCode.getTokenAfter(defaultSpecifier, isComma);
                          var closingBrace = sourceCode.getTokenAfter(
                          node.specifiers[node.specifiers.length - 1],
                          function (token) {return token.type === 'Punctuator' && token.value === '}';});

                          fixes.push(fixer.removeRange([
                          comma.range[0],
                          closingBrace.range[1]]));

                        }

                        return fixes.concat(
                        // insert the new imports after the old declaration
                        fixer.insertTextAfter(node, '\n' + String(newImports)));

                      }return fix;}() });

                }} catch (err) {_didIteratorError3 = true;_iteratorError3 = err;} finally {try {if (!_iteratorNormalCompletion3 && _iterator3['return']) {_iterator3['return']();}} finally {if (_didIteratorError3) {throw _iteratorError3;}}}
            }
          }return ImportDeclaration;}() };

    }return create;}() };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ydWxlcy9jb25zaXN0ZW50LXR5cGUtc3BlY2lmaWVyLXN0eWxlLmpzIl0sIm5hbWVzIjpbImlzQ29tbWEiLCJ0b2tlbiIsInR5cGUiLCJ2YWx1ZSIsInJlbW92ZVNwZWNpZmllcnMiLCJmaXhlcyIsImZpeGVyIiwic291cmNlQ29kZSIsInNwZWNpZmllcnMiLCJzcGVjaWZpZXIiLCJjb21tYSIsImdldFRva2VuQWZ0ZXIiLCJwdXNoIiwicmVtb3ZlIiwiZ2V0SW1wb3J0VGV4dCIsIm5vZGUiLCJraW5kIiwic291cmNlU3RyaW5nIiwiZ2V0VGV4dCIsInNvdXJjZSIsImxlbmd0aCIsIm5hbWVzIiwibWFwIiwicyIsImltcG9ydGVkIiwibmFtZSIsImxvY2FsIiwiam9pbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwiZG9jcyIsImRlc2NyaXB0aW9uIiwidXJsIiwiZml4YWJsZSIsInNjaGVtYSIsImNyZWF0ZSIsImNvbnRleHQiLCJnZXRTb3VyY2VDb2RlIiwib3B0aW9ucyIsIkltcG9ydERlY2xhcmF0aW9uIiwiaW1wb3J0S2luZCIsInJlcG9ydCIsIm1lc3NhZ2UiLCJkYXRhIiwiZml4Iiwia2luZFRva2VuIiwiZ2V0Rmlyc3RUb2tlbiIsInNraXAiLCJjb25jYXQiLCJpbnNlcnRUZXh0QmVmb3JlIiwidHlwZVNwZWNpZmllcnMiLCJ0eXBlb2ZTcGVjaWZpZXJzIiwidmFsdWVTcGVjaWZpZXJzIiwiZGVmYXVsdFNwZWNpZmllciIsInR5cGVJbXBvcnQiLCJ0eXBlb2ZJbXBvcnQiLCJuZXdJbXBvcnRzIiwidHJpbSIsInJlcGxhY2VUZXh0IiwibWF5YmVDb21tYSIsImNsb3NpbmdCcmFjZSIsInJlbW92ZVJhbmdlIiwicmFuZ2UiLCJpbnNlcnRUZXh0QWZ0ZXIiXSwibWFwcGluZ3MiOiJhQUFBLHFDOztBQUVBLFNBQVNBLE9BQVQsQ0FBaUJDLEtBQWpCLEVBQXdCO0FBQ3RCLFNBQU9BLE1BQU1DLElBQU4sS0FBZSxZQUFmLElBQStC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LFlBQWYsSUFBK0JELE1BQU1FLEtBQU4sS0FBZ0IsR0FBeEQsRUFGbUIsQ0FBckI7O0FBSUFFLGdDQUFNTyxJQUFOLENBQVdOLE1BQU13RCxXQUFOLENBQWtCO0FBQzNCcEQsZ0NBQU1xRCxLQUFOLENBQVksQ0FBWixDQUQyQjtBQUUzQkYsdUNBQWFFLEtBQWIsQ0FBbUIsQ0FBbkIsQ0FGMkIsQ0FBbEIsQ0FBWDs7QUFJRDs7QUFFRCwrQkFBTzFELE1BQU00QyxNQUFOO0FBQ0w7QUFDQTNDLDhCQUFNMEQsZUFBTixDQUFzQmpELElBQXRCLGdCQUFpQzBDLFVBQWpDLEVBRkssQ0FBUDs7QUFJRCx1QkFsRFksZ0JBQWY7O0FBb0RELGlCQXZESTtBQXdETjtBQUNGLFdBbEhJLDhCQUFQOztBQW9IRCxLQWhMYyxtQkFBakIiLCJmaWxlIjoiY29uc2lzdGVudC10eXBlLXNwZWNpZmllci1zdHlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb2NzVXJsIGZyb20gJy4uL2RvY3NVcmwnO1xuXG5mdW5jdGlvbiBpc0NvbW1hKHRva2VuKSB7XG4gIHJldHVybiB0b2tlbi50eXBlID09PSAnUHVuY3R1YXRvcicgJiYgdG9rZW4udmFsdWUgPT09ICcsJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3BlY2lmaWVycyhmaXhlcywgZml4ZXIsIHNvdXJjZUNvZGUsIHNwZWNpZmllcnMpIHtcbiAgZm9yIChjb25zdCBzcGVjaWZpZXIgb2Ygc3BlY2lmaWVycykge1xuICAgIC8vIHJlbW92ZSB0aGUgdHJhaWxpbmcgY29tbWFcbiAgICBjb25zdCBjb21tYSA9IHNvdXJjZUNvZGUuZ2V0VG9rZW5BZnRlcihzcGVjaWZpZXIsIGlzQ29tbWEpO1xuICAgIGlmIChjb21tYSkge1xuICAgICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUoY29tbWEpKTtcbiAgICB9XG4gICAgZml4ZXMucHVzaChmaXhlci5yZW1vdmUoc3BlY2lmaWVyKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0SW1wb3J0VGV4dChcbiAgbm9kZSxcbiAgc291cmNlQ29kZSxcbiAgc3BlY2lmaWVycyxcbiAga2luZCxcbikge1xuICBjb25zdCBzb3VyY2VTdHJpbmcgPSBzb3VyY2VDb2RlLmdldFRleHQobm9kZS5zb3VyY2UpO1xuICBpZiAoc3BlY2lmaWVycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBjb25zdCBuYW1lcyA9IHNwZWNpZmllcnMubWFwKHMgPT4ge1xuICAgIGlmIChzLmltcG9ydGVkLm5hbWUgPT09IHMubG9jYWwubmFtZSkge1xuICAgICAgcmV0dXJuIHMuaW1wb3J0ZWQubmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIGAke3MuaW1wb3J0ZWQubmFtZX0gYXMgJHtzLmxvY2FsLm5hbWV9YDtcbiAgfSk7XG4gIC8vIGluc2VydCBhIGZyZXNoIHRvcC1sZXZlbCBpbXBvcnRcbiAgcmV0dXJuIGBpbXBvcnQgJHtraW5kfSB7JHtuYW1lcy5qb2luKCcsICcpfX0gZnJvbSAke3NvdXJjZVN0cmluZ307YDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAnc3VnZ2VzdGlvbicsXG4gICAgZG9jczoge1xuICAgICAgZGVzY3JpcHRpb246ICdFbmZvcmNlIG9yIGJhbiB0aGUgdXNlIG9mIGlubGluZSB0eXBlLW9ubHkgbWFya2VycyBmb3IgbmFtZWQgaW1wb3J0cycsXG4gICAgICB1cmw6IGRvY3NVcmwoJ2NvbnNpc3RlbnQtdHlwZS1zcGVjaWZpZXItc3R5bGUnKSxcbiAgICB9LFxuICAgIGZpeGFibGU6ICdjb2RlJyxcbiAgICBzY2hlbWE6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGVudW06IFsncHJlZmVyLWlubGluZScsICdwcmVmZXItdG9wLWxldmVsJ10sXG4gICAgICAgIGRlZmF1bHQ6ICdwcmVmZXItaW5saW5lJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcblxuICBjcmVhdGUoY29udGV4dCkge1xuICAgIGNvbnN0IHNvdXJjZUNvZGUgPSBjb250ZXh0LmdldFNvdXJjZUNvZGUoKTtcblxuICAgIGlmIChjb250ZXh0Lm9wdGlvbnNbMF0gPT09ICdwcmVmZXItaW5saW5lJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgSW1wb3J0RGVjbGFyYXRpb24obm9kZSkge1xuICAgICAgICAgIGlmIChub2RlLmltcG9ydEtpbmQgPT09ICd2YWx1ZScgfHwgbm9kZS5pbXBvcnRLaW5kID09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIHRvcC1sZXZlbCB2YWx1ZSAvIHVua25vd24gaXMgdmFsaWRcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAvLyBubyBzcGVjaWZpZXJzIChpbXBvcnQgdHlwZSB7fSBmcm9tICcnKSBoYXZlIG5vIHNwZWNpZmllcnMgdG8gbWFyayBhcyBpbmxpbmVcbiAgICAgICAgICAgIG5vZGUuc3BlY2lmaWVycy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgIChub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAxICYmXG4gICAgICAgICAgICAgIC8vIGRlZmF1bHQgaW1wb3J0cyBhcmUgYm90aCBcImlubGluZVwiIGFuZCBcInRvcC1sZXZlbFwiXG4gICAgICAgICAgICAgIChub2RlLnNwZWNpZmllcnNbMF0udHlwZSA9PT0gJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInIHx8XG4gICAgICAgICAgICAgICAgLy8gbmFtZXNwYWNlIGltcG9ydHMgYXJlIGJvdGggXCJpbmxpbmVcIiBhbmQgXCJ0b3AtbGV2ZWxcIlxuICAgICAgICAgICAgICAgIG5vZGUuc3BlY2lmaWVyc1swXS50eXBlID09PSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJykpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmZXIgdXNpbmcgaW5saW5lIHt7a2luZH19IHNwZWNpZmllcnMgaW5zdGVhZCBvZiBhIHRvcC1sZXZlbCB7e2tpbmR9fS1vbmx5IGltcG9ydC4nLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBraW5kOiBub2RlLmltcG9ydEtpbmQsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZml4KGZpeGVyKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGtpbmRUb2tlbiA9IHNvdXJjZUNvZGUuZ2V0Rmlyc3RUb2tlbihub2RlLCB7IHNraXA6IDEgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIFtdLmNvbmNhdChcbiAgICAgICAgICAgICAgICBraW5kVG9rZW4gPyBmaXhlci5yZW1vdmUoa2luZFRva2VuKSA6IFtdLFxuICAgICAgICAgICAgICAgIG5vZGUuc3BlY2lmaWVycy5tYXAoKHNwZWNpZmllcikgPT4gZml4ZXIuaW5zZXJ0VGV4dEJlZm9yZShzcGVjaWZpZXIsIGAke25vZGUuaW1wb3J0S2luZH0gYCkpLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gcHJlZmVyLXRvcC1sZXZlbFxuICAgIHJldHVybiB7XG4gICAgICBJbXBvcnREZWNsYXJhdGlvbihub2RlKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAvLyBhbHJlYWR5IHRvcC1sZXZlbCBpcyB2YWxpZFxuICAgICAgICAgIG5vZGUuaW1wb3J0S2luZCA9PT0gJ3R5cGUnIHx8XG4gICAgICAgICAgbm9kZS5pbXBvcnRLaW5kID09PSAndHlwZW9mJyB8fFxuICAgICAgICAgIC8vIG5vIHNwZWNpZmllcnMgKGltcG9ydCB7fSBmcm9tICcnKSBjYW5ub3QgaGF2ZSBpbmxpbmUgLSBzbyBpcyB2YWxpZFxuICAgICAgICAgIG5vZGUuc3BlY2lmaWVycy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAobm9kZS5zcGVjaWZpZXJzLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgICAgICAgLy8gZGVmYXVsdCBpbXBvcnRzIGFyZSBib3RoIFwiaW5saW5lXCIgYW5kIFwidG9wLWxldmVsXCJcbiAgICAgICAgICAgIChub2RlLnNwZWNpZmllcnNbMF0udHlwZSA9PT0gJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInIHx8XG4gICAgICAgICAgICAgIC8vIG5hbWVzcGFjZSBpbXBvcnRzIGFyZSBib3RoIFwiaW5saW5lXCIgYW5kIFwidG9wLWxldmVsXCJcbiAgICAgICAgICAgICAgbm9kZS5zcGVjaWZpZXJzWzBdLnR5cGUgPT09ICdJbXBvcnROYW1lc3BhY2VTcGVjaWZpZXInKSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdHlwZVNwZWNpZmllcnMgPSBbXTtcbiAgICAgICAgY29uc3QgdHlwZW9mU3BlY2lmaWVycyA9IFtdO1xuICAgICAgICBjb25zdCB2YWx1ZVNwZWNpZmllcnMgPSBbXTtcbiAgICAgICAgbGV0IGRlZmF1bHRTcGVjaWZpZXIgPSBudWxsO1xuICAgICAgICBmb3IgKGNvbnN0IHNwZWNpZmllciBvZiBub2RlLnNwZWNpZmllcnMpIHtcbiAgICAgICAgICBpZiAoc3BlY2lmaWVyLnR5cGUgPT09ICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJykge1xuICAgICAgICAgICAgZGVmYXVsdFNwZWNpZmllciA9IHNwZWNpZmllcjtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzcGVjaWZpZXIuaW1wb3J0S2luZCA9PT0gJ3R5cGUnKSB7XG4gICAgICAgICAgICB0eXBlU3BlY2lmaWVycy5wdXNoKHNwZWNpZmllcik7XG4gICAgICAgICAgfSBlbHNlIGlmIChzcGVjaWZpZXIuaW1wb3J0S2luZCA9PT0gJ3R5cGVvZicpIHtcbiAgICAgICAgICAgIHR5cGVvZlNwZWNpZmllcnMucHVzaChzcGVjaWZpZXIpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3BlY2lmaWVyLmltcG9ydEtpbmQgPT09ICd2YWx1ZScgfHwgc3BlY2lmaWVyLmltcG9ydEtpbmQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFsdWVTcGVjaWZpZXJzLnB1c2goc3BlY2lmaWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0eXBlSW1wb3J0ID0gZ2V0SW1wb3J0VGV4dChub2RlLCBzb3VyY2VDb2RlLCB0eXBlU3BlY2lmaWVycywgJ3R5cGUnKTtcbiAgICAgICAgY29uc3QgdHlwZW9mSW1wb3J0ID0gZ2V0SW1wb3J0VGV4dChub2RlLCBzb3VyY2VDb2RlLCB0eXBlb2ZTcGVjaWZpZXJzLCAndHlwZW9mJyk7XG4gICAgICAgIGNvbnN0IG5ld0ltcG9ydHMgPSBgJHt0eXBlSW1wb3J0fVxcbiR7dHlwZW9mSW1wb3J0fWAudHJpbSgpO1xuXG4gICAgICAgIGlmICh0eXBlU3BlY2lmaWVycy5sZW5ndGggKyB0eXBlb2ZTcGVjaWZpZXJzLmxlbmd0aCA9PT0gbm9kZS5zcGVjaWZpZXJzLmxlbmd0aCkge1xuICAgICAgICAgIC8vIGFsbCBzcGVjaWZpZXJzIGhhdmUgaW5saW5lIHNwZWNpZmllcnMgLSBzbyB3ZSByZXBsYWNlIHRoZSBlbnRpcmUgaW1wb3J0XG4gICAgICAgICAgY29uc3Qga2luZCA9IFtdLmNvbmNhdChcbiAgICAgICAgICAgIHR5cGVTcGVjaWZpZXJzLmxlbmd0aCA+IDAgPyAndHlwZScgOiBbXSxcbiAgICAgICAgICAgIHR5cGVvZlNwZWNpZmllcnMubGVuZ3RoID4gMCA/ICd0eXBlb2YnIDogW10sXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiAnUHJlZmVyIHVzaW5nIGEgdG9wLWxldmVsIHt7a2luZH19LW9ubHkgaW1wb3J0IGluc3RlYWQgb2YgaW5saW5lIHt7a2luZH19IHNwZWNpZmllcnMuJyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAga2luZDoga2luZC5qb2luKCcvJyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZml4KGZpeGVyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmaXhlci5yZXBsYWNlVGV4dChub2RlLCBuZXdJbXBvcnRzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gcmVtb3ZlIHNwZWNpZmljIHNwZWNpZmllcnMgYW5kIGluc2VydCBuZXcgaW1wb3J0cyBmb3IgdGhlbVxuICAgICAgICAgIGZvciAoY29uc3Qgc3BlY2lmaWVyIG9mIHR5cGVTcGVjaWZpZXJzLmNvbmNhdCh0eXBlb2ZTcGVjaWZpZXJzKSkge1xuICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICAgICAgICBub2RlOiBzcGVjaWZpZXIsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmZXIgdXNpbmcgYSB0b3AtbGV2ZWwge3traW5kfX0tb25seSBpbXBvcnQgaW5zdGVhZCBvZiBpbmxpbmUge3traW5kfX0gc3BlY2lmaWVycy4nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAga2luZDogc3BlY2lmaWVyLmltcG9ydEtpbmQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGZpeChmaXhlcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpeGVzID0gW107XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbm8gdmFsdWUgc3BlY2lmaWVycywgdGhlbiB0aGUgb3RoZXIgcmVwb3J0IGZpeGVyIHdpbGwgYmUgY2FsbGVkLCBub3QgdGhpcyBvbmVcblxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZVNwZWNpZmllcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgLy8gaW1wb3J0IHsgVmFsdWUsIHR5cGUgVHlwZSB9IGZyb20gJ21vZCc7XG5cbiAgICAgICAgICAgICAgICAgIC8vIHdlIGNhbiBqdXN0IHJlbW92ZSB0aGUgdHlwZSBzcGVjaWZpZXJzXG4gICAgICAgICAgICAgICAgICByZW1vdmVTcGVjaWZpZXJzKGZpeGVzLCBmaXhlciwgc291cmNlQ29kZSwgdHlwZVNwZWNpZmllcnMpO1xuICAgICAgICAgICAgICAgICAgcmVtb3ZlU3BlY2lmaWVycyhmaXhlcywgZml4ZXIsIHNvdXJjZUNvZGUsIHR5cGVvZlNwZWNpZmllcnMpO1xuXG4gICAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSBpbXBvcnQgbmljZWx5IGZvcm1hdHRlZCBieSBhbHNvIHJlbW92aW5nIHRoZSB0cmFpbGluZyBjb21tYSBhZnRlciB0aGUgbGFzdCB2YWx1ZSBpbXBvcnRcbiAgICAgICAgICAgICAgICAgIC8vIGVnXG4gICAgICAgICAgICAgICAgICAvLyBpbXBvcnQgeyBWYWx1ZSwgdHlwZSBUeXBlIH0gZnJvbSAnbW9kJztcbiAgICAgICAgICAgICAgICAgIC8vIHRvXG4gICAgICAgICAgICAgICAgICAvLyBpbXBvcnQgeyBWYWx1ZSAgfSBmcm9tICdtb2QnO1xuICAgICAgICAgICAgICAgICAgLy8gbm90XG4gICAgICAgICAgICAgICAgICAvLyBpbXBvcnQgeyBWYWx1ZSwgIH0gZnJvbSAnbW9kJztcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG1heWJlQ29tbWEgPSBzb3VyY2VDb2RlLmdldFRva2VuQWZ0ZXIodmFsdWVTcGVjaWZpZXJzW3ZhbHVlU3BlY2lmaWVycy5sZW5ndGggLSAxXSk7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNDb21tYShtYXliZUNvbW1hKSkge1xuICAgICAgICAgICAgICAgICAgICBmaXhlcy5wdXNoKGZpeGVyLnJlbW92ZShtYXliZUNvbW1hKSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZWZhdWx0U3BlY2lmaWVyKSB7XG4gICAgICAgICAgICAgICAgICAvLyBpbXBvcnQgRGVmYXVsdCwgeyB0eXBlIFR5cGUgfSBmcm9tICdtb2QnO1xuXG4gICAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIGVudGlyZSBjdXJseSBibG9jayBzbyB3ZSBkb24ndCBsZWF2ZSBhbiBlbXB0eSBvbmUgYmVoaW5kXG4gICAgICAgICAgICAgICAgICAvLyBOT1RFIC0gdGhlIGRlZmF1bHQgc3BlY2lmaWVyICptdXN0KiBiZSB0aGUgZmlyc3Qgc3BlY2lmaWVyIGFsd2F5cyFcbiAgICAgICAgICAgICAgICAgIC8vICAgICAgICBzbyBhIGNvbW1hIGV4aXN0cyB0aGF0IHdlIGFsc28gaGF2ZSB0byBjbGVhbiB1cCBvciBlbHNlIGl0J3MgYmFkIHN5bnRheFxuICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWEgPSBzb3VyY2VDb2RlLmdldFRva2VuQWZ0ZXIoZGVmYXVsdFNwZWNpZmllciwgaXNDb21tYSk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjbG9zaW5nQnJhY2UgPSBzb3VyY2VDb2RlLmdldFRva2VuQWZ0ZXIoXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc3BlY2lmaWVyc1tub2RlLnNwZWNpZmllcnMubGVuZ3RoIC0gMV0sXG4gICAgICAgICAgICAgICAgICAgIHRva2VuID0+IHRva2VuLnR5cGUgPT09ICdQdW5jdHVhdG9yJyAmJiB0b2tlbi52YWx1ZSA9PT0gJ30nLFxuICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgIGZpeGVzLnB1c2goZml4ZXIucmVtb3ZlUmFuZ2UoW1xuICAgICAgICAgICAgICAgICAgICBjb21tYS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICAgICAgY2xvc2luZ0JyYWNlLnJhbmdlWzFdLFxuICAgICAgICAgICAgICAgICAgXSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBmaXhlcy5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAvLyBpbnNlcnQgdGhlIG5ldyBpbXBvcnRzIGFmdGVyIHRoZSBvbGQgZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgICAgIGZpeGVyLmluc2VydFRleHRBZnRlcihub2RlLCBgXFxuJHtuZXdJbXBvcnRzfWApLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfTtcbiAgfSxcbn07XG4iXX0=