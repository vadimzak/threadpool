"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var sleep = exports.sleep = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var periodMs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (r) {
              return setTimeout(r, periodMs);
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function sleep(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
//# sourceMappingURL=asyncUtils.js.map