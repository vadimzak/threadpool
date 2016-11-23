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
    var res, tp, _loop, i;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            res = [];
            tp = new _ThreadPool2.default(2);

            _loop = function _loop(i) {
              var _i = i;
              tp.queue(_asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        res.push('before' + _i);
                        _context.next = 3;
                        return (0, _asyncUtils.sleep)(10);

                      case 3:
                        res.push('after' + _i);

                      case 4:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              })));
            };

            for (i = 0; i < 2; i++) {
              _loop(i);
            }
            _context2.next = 6;
            return tp.runAllQueued();

          case 6:

            (0, _chai.expect)(res).to.eql(['before0', 'before1', 'after0', 'after1']);

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  it('throttles execution', _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
    var res, tp, _loop2, i;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            res = [];
            tp = new _ThreadPool2.default(2);

            _loop2 = function _loop2(i) {
              var _i = i;
              tp.queue(_asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        res.push('before' + _i);
                        _context3.next = 3;
                        return (0, _asyncUtils.sleep)(10);

                      case 3:
                        res.push('after' + _i);

                      case 4:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, _callee3, undefined);
              })));
            };

            for (i = 0; i < 3; i++) {
              _loop2(i);
            }
            _context4.next = 6;
            return tp.runAllQueued();

          case 6:

            (0, _chai.expect)(res).to.eql(['before0', 'before1', 'after0', 'after1', 'before2', 'after2']);

          case 7:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  })));

  it('does not execute queued tesks sync', _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
    var res, tp;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            res = [];
            tp = new _ThreadPool2.default(3);

            tp.queue(_asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      res.push(2);

                    case 1:
                    case 'end':
                      return _context5.stop();
                  }
                }
              }, _callee5, undefined);
            })));
            tp.run();
            res.push(1);
            _context6.next = 7;
            return tp.closeAndWaitComplete();

          case 7:

            (0, _chai.expect)(res).to.eql([1, 2]);

          case 8:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined);
  })));

  it('works with short notation', _asyncToGenerator(regeneratorRuntime.mark(function _callee8() {
    var res;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            res = [];
            _context8.next = 3;
            return _ThreadPool2.default.run(2, [0, 1].map(function (n) {
              return _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        return _context7.abrupt('return', res.push(n));

                      case 1:
                      case 'end':
                        return _context7.stop();
                    }
                  }
                }, _callee7, undefined);
              }));
            }));

          case 3:

            (0, _chai.expect)(res).to.eql([0, 1]);

          case 4:
          case 'end':
            return _context8.stop();
        }
      }
    }, _callee8, undefined);
  })));

  it('works with Promises', _asyncToGenerator(regeneratorRuntime.mark(function _callee9() {
    var res;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            res = [];
            _context9.next = 3;
            return _ThreadPool2.default.run(2, [0, 1].map(function (n) {
              return new Promise(function (r) {
                res.push('before' + n);
                setTimeout(function () {
                  res.push('after' + n);
                  r();
                }, 10);
              });
            }));

          case 3:
            (0, _chai.expect)(res).to.eql(['before0', 'before1', 'after0', 'after1']);

          case 4:
          case 'end':
            return _context9.stop();
        }
      }
    }, _callee9, undefined);
  })));

  it('catches errors', _asyncToGenerator(regeneratorRuntime.mark(function _callee11() {
    var caughtErr;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            caughtErr = null;
            _context11.prev = 1;
            _context11.next = 4;
            return _ThreadPool2.default.run(2, { errorHandler: function errorHandler(err) {
                throw err;
              } }, [0, 1].map(function (n) {
              return _asyncToGenerator(regeneratorRuntime.mark(function _callee10() {
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        throw n;

                      case 1:
                      case 'end':
                        return _context10.stop();
                    }
                  }
                }, _callee10, undefined);
              }));
            }));

          case 4:
            _context11.next = 9;
            break;

          case 6:
            _context11.prev = 6;
            _context11.t0 = _context11['catch'](1);

            caughtErr = _context11.t0;

          case 9:
            (0, _chai.expect)(caughtErr).to.not.be.null;

          case 10:
          case 'end':
            return _context11.stop();
        }
      }
    }, _callee11, undefined, [[1, 6]]);
  })));

  it('should not to run new tasks after uncaught error', _asyncToGenerator(regeneratorRuntime.mark(function _callee13() {
    var startCount;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            startCount = 0;
            _context13.prev = 1;
            _context13.next = 4;
            return _ThreadPool2.default.run(1, { errorHandler: function errorHandler(err) {
                throw err;
              } }, [0, 1].map(function (n) {
              return _asyncToGenerator(regeneratorRuntime.mark(function _callee12() {
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                  while (1) {
                    switch (_context12.prev = _context12.next) {
                      case 0:
                        startCount++;
                        throw n;

                      case 2:
                      case 'end':
                        return _context12.stop();
                    }
                  }
                }, _callee12, undefined);
              }));
            }));

          case 4:
            _context13.next = 8;
            break;

          case 6:
            _context13.prev = 6;
            _context13.t0 = _context13['catch'](1);

          case 8:
            // eslint-disable-line no-empty

            (0, _chai.expect)(startCount).to.eql(1);

          case 9:
          case 'end':
            return _context13.stop();
        }
      }
    }, _callee13, undefined, [[1, 6]]);
  })));

  it('catches error after completion', _asyncToGenerator(regeneratorRuntime.mark(function _callee15() {
    var caughtErr, tp;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            caughtErr = null;
            tp = new _ThreadPool2.default(2, { errorHandler: function errorHandler(err) {
                throw err;
              } }, [0, 1].map(function (n) {
              return _asyncToGenerator(regeneratorRuntime.mark(function _callee14() {
                return regeneratorRuntime.wrap(function _callee14$(_context14) {
                  while (1) {
                    switch (_context14.prev = _context14.next) {
                      case 0:
                        throw n;

                      case 1:
                      case 'end':
                        return _context14.stop();
                    }
                  }
                }, _callee14, undefined);
              }));
            }));

            tp.run();
            _context15.next = 5;
            return (0, _asyncUtils.sleep)(10);

          case 5:
            _context15.prev = 5;
            _context15.next = 8;
            return tp.waitComplete();

          case 8:
            _context15.next = 13;
            break;

          case 10:
            _context15.prev = 10;
            _context15.t0 = _context15['catch'](5);

            caughtErr = _context15.t0;

          case 13:
            (0, _chai.expect)(caughtErr).to.not.be.null;

          case 14:
          case 'end':
            return _context15.stop();
        }
      }
    }, _callee15, undefined, [[5, 10]]);
  })));
});
//# sourceMappingURL=ThreadPool.test.js.map