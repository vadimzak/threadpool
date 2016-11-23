'use strict';

require('babel-polyfill');

var _ThreadPool = require('../ThreadPool');

var _ThreadPool2 = _interopRequireDefault(_ThreadPool);

var _asyncUtils = require('../asyncUtils');

var _chai = require('chai');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// mocha flow type declarations
describe('ThreadPool', function () {
  it('runs queued functions in parallel', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var nums, tp, res, _loop, i;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            nums = 3;
            tp = new _ThreadPool2.default(nums);
            res = [];

            _loop = function _loop(i) {
              var _i = i;
              tp.queue(_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return (0, _asyncUtils.sleep)(100 - _i * 10);

                      case 2:
                        res.push(_i);

                      case 3:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              })));
            };

            for (i = 0; i < nums; i++) {
              _loop(i);
            }

            tp.run();
            _context2.next = 8;
            return tp.closeAndWaitComplete();

          case 8:

            (0, _chai.expect)(res).to.eql([2, 1, 0]);

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));
});
//# sourceMappingURL=ThreadPool.test.js.map