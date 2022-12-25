
    (function(modules) {
      function require(id) {
        const [moduleFn, mapping] = modules[id];

        function localRequire(pathFromRequire) {
          return require(mapping[pathFromRequire]);
        }

        const module = { exports: {} };

        moduleFn(localRequire, module, module.exports);

        return module.exports;
      }

      require(0);
    })({0: [
      function(require, module, exports) {
        "use strict";

var _say = require("./say.js");

(0, _say.say)('Hello from bundler');
      },
      {"./say.js":1}
    ],1: [
      function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.say = say;

var _write = require("./write.js");

function say(str) {
  (0, _write.writeToConsole)(str);
}
      },
      {"./write.js":2}
    ],2: [
      function(require, module, exports) {
        "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeToConsole = writeToConsole;
function writeToConsole(str) {
  console.log(str);
}
      },
      {}
    ],})
  