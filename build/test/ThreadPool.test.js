'use strict';

var _ThreadPool = require('../ThreadPool');

var _ThreadPool2 = _interopRequireDefault(_ThreadPool);

var _asyncUtils = require('../asyncUtils');

var _chai = require('chai');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// mocha flow type declarations
describe('ThreadPool', () => {
  it('runs queued functions in parallel', _asyncToGenerator(function* () {
    let nums = 3;
    let tp = new _ThreadPool2.default(nums);
    let res = [];
    for (let i = 0; i < nums; i++) {
      let _i = i;
      tp.queue(_asyncToGenerator(function* () {
        yield (0, _asyncUtils.sleep)(100 - _i * 10);
        res.push(_i);
      }));
    }

    tp.run();
    yield tp.closeAndWaitComplete();

    (0, _chai.expect)(res).to.eql([2, 1, 0]);
  }));
});
//# sourceMappingURL=ThreadPool.test.js.map