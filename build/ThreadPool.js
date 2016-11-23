'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _asyncUtils = require('./asyncUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_SLEEP_TIME_MS = 100;

var TaskDesc = function TaskDesc() {
  _classCallCheck(this, TaskDesc);

  this.queueTime = Date.now();
};

/**
 * A thread-pool abstraction for ES6 async operations",
 * 
 * @export
 * @class ThreadPool
 * @extends {EventEmitter}
 */


var ThreadPool = function (_EventEmitter) {
  _inherits(ThreadPool, _EventEmitter);

  function ThreadPool() {
    var maxThreadsCount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _os2.default.cpus().length;
    var errorHandler = arguments[1];
    var sleepTimeMs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_SLEEP_TIME_MS;
    var maxQueueSize = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Infinity;

    _classCallCheck(this, ThreadPool);

    var _this = _possibleConstructorReturn(this, (ThreadPool.__proto__ || Object.getPrototypeOf(ThreadPool)).call(this));

    _this.queuedTasks = [];
    _this.queuedCount = 0;
    _this.startedCount = 0;
    _this.endedCount = 0;
    _this.uncaughtErrors = [];
    _this.closed = false;
    _this._taskData = new Map();


    if (maxThreadsCount <= 0) {
      throw new Error('ThreadPool maxThreadsCount must be greater than 0');
    }
    _this.maxThreadsCount = maxThreadsCount;
    _this.errorHandler = errorHandler || function (err) {
      return console.error(err);
    }; // eslint-disable-line no-console
    _this.sleepTimeMs = sleepTimeMs;
    _this.maxQueueSize = maxQueueSize;
    return _this;
  }

  _createClass(ThreadPool, [{
    key: 'queue',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(func) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!this.closed) {
                  _context.next = 2;
                  break;
                }

                throw new Error('Trying to queue a job to a closed ThreadPool');

              case 2:
                if (!(this.maxQueueSize !== Infinity)) {
                  _context.next = 8;
                  break;
                }

              case 3:
                if (!(this.queuedTasks.length >= this.maxQueueSize)) {
                  _context.next = 8;
                  break;
                }

                _context.next = 6;
                return (0, _asyncUtils.sleep)(this.sleepTimeMs);

              case 6:
                _context.next = 3;
                break;

              case 8:

                this.queuedTasks.push({ func: func, index: this.queuedCount });
                this._taskData.set(this.queuedCount, new TaskDesc());
                this.queuedCount++;

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function queue(_x4) {
        return _ref.apply(this, arguments);
      }

      return queue;
    }()
  }, {
    key: '_popAndRunNextTask',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var taskToRun, taskData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                taskToRun = this.queuedTasks.shift();
                taskData = this._taskData.get(taskToRun.index);

                if (taskData) {
                  _context2.next = 4;
                  break;
                }

                throw new Error('unexpected');

              case 4:
                _context2.prev = 4;

                this.startedCount++;
                taskData.startTime = Date.now();
                _context2.next = 9;
                return taskToRun.func();

              case 9:
                _context2.next = 14;
                break;

              case 11:
                _context2.prev = 11;
                _context2.t0 = _context2['catch'](4);

                try {
                  taskData.err = _context2.t0;
                  this.errorHandler(_context2.t0);
                } catch (err2) {
                  this.uncaughtErrors.push(err2);
                }

              case 14:
                this.endedCount++;
                taskData.endTime = Date.now();

                // fire 'progress' event
                this.emit('progress', { endedCount: this.endedCount });

              case 17:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 11]]);
      }));

      function _popAndRunNextTask() {
        return _ref2.apply(this, arguments);
      }

      return _popAndRunNextTask;
    }()
  }, {
    key: 'runAllQueued',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this.close();
                _context3.next = 3;
                return this.run();

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function runAllQueued() {
        return _ref3.apply(this, arguments);
      }

      return runAllQueued;
    }()
  }, {
    key: 'run',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var error;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.startTimeMs = Date.now();

              case 1:
                if (!(!this.closed || this.startedCount - this.endedCount > 0 || this.queuedTasks.length > 0)) {
                  _context4.next = 8;
                  break;
                }

                // TP is still open OR at least one task is running OR queued (we have work to do)

                while (this.startedCount - this.endedCount < this.maxThreadsCount && this.queuedTasks.length > 0) {
                  // we can run more tasks
                  this._popAndRunNextTask();
                }

                if (!(!this.closed || this.startedCount - this.endedCount > 0)) {
                  _context4.next = 6;
                  break;
                }

                _context4.next = 6;
                return (0, _asyncUtils.sleep)(this.sleepTimeMs);

              case 6:
                _context4.next = 1;
                break;

              case 8:
                this.endTimeMs = Date.now();

                if (!(this.uncaughtErrors.length > 0)) {
                  _context4.next = 13;
                  break;
                }

                error = new Error(this.uncaughtErrors.length + ' errors were thrown during ThreadPool execution');

                error.uncaughtErrors = this.uncaughtErrors;
                throw error;

              case 13:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function run() {
        return _ref4.apply(this, arguments);
      }

      return run;
    }()
  }, {
    key: 'waitComplete',
    value: function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!(!this.closed || this.startedCount - this.endedCount > 0 || this.queuedTasks.length > 0)) {
                  _context5.next = 5;
                  break;
                }

                _context5.next = 3;
                return (0, _asyncUtils.sleep)(this.sleepTimeMs);

              case 3:
                _context5.next = 0;
                break;

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function waitComplete() {
        return _ref5.apply(this, arguments);
      }

      return waitComplete;
    }()
  }, {
    key: 'close',
    value: function close() {
      this.closed = true;
    }
  }, {
    key: 'closeAndWaitComplete',
    value: function () {
      var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                this.close();
                _context6.next = 3;
                return this.waitComplete();

              case 3:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function closeAndWaitComplete() {
        return _ref6.apply(this, arguments);
      }

      return closeAndWaitComplete;
    }()
  }, {
    key: 'getLongestStillRunningMs',
    value: function getLongestStillRunningMs() {
      var now = Date.now();
      var runTimes = Array.from(this._taskData.values()).filter(function (td) {
        return td.startTime && !td.endTime;
      })
      // $FlowIgnore
      .map(function (td) {
        return now - td.startTime;
      });
      var longestRunning = Math.max.apply(Math, _toConsumableArray(runTimes));
      return longestRunning;
    }
  }]);

  return ThreadPool;
}(_events2.default);

exports.default = ThreadPool;
//# sourceMappingURL=ThreadPool.js.map