'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

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

  _createClass(ThreadPool, null, [{
    key: 'run',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(maxThreadsCount, freeParam1, freeParam2) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', new ThreadPool(maxThreadsCount, freeParam1, freeParam2).runAllQueued());

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function run(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return run;
    }()

    /**
     * Creates an instance of ThreadPool
     */

  }]);

  function ThreadPool(maxThreadsCount, freeParam1, freeParam2) {
    _classCallCheck(this, ThreadPool);

    var _this = _possibleConstructorReturn(this, (ThreadPool.__proto__ || Object.getPrototypeOf(ThreadPool)).call(this));

    _this.queuedTasks = [];
    _this.queuedCount = 0;
    _this.startedCount = 0;
    _this.endedCount = 0;
    _this.uncaughtErrors = [];
    _this.closed = false;
    _this._taskData = new Map();


    _this.maxThreadsCount = maxThreadsCount;

    // set defualts
    _this.errorHandler = function (err) {
      return console.error(err);
    }; // eslint-disable-line no-console
    _this.sleepTimeMs = DEFAULT_SLEEP_TIME_MS;
    _this.maxQueueSize = Infinity;

    if (Array.isArray(freeParam1)) {
      _this.preQueuedTasks = freeParam1;
    } else if ((typeof freeParam1 === 'undefined' ? 'undefined' : _typeof(freeParam1)) === 'object') {
      if (freeParam1.errorHandler != undefined) _this.errorHandler = freeParam1.errorHandler;
      if (freeParam1.sleepTimeMs != undefined) _this.sleepTimeMs = freeParam1.sleepTimeMs;
      if (freeParam1.maxQueueSize != undefined) _this.maxQueueSize = freeParam1.maxQueueSize;
    }

    if (Array.isArray(freeParam2)) {
      if (_this.preQueuedTasks) throw new Error('Tasks were set twice');
      _this.preQueuedTasks = freeParam2;
    }

    if (maxThreadsCount <= 0) {
      throw new Error('ThreadPool maxThreadsCount must be greater than 0');
    }

    if (_this.preQueuedTasks) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _this.preQueuedTasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var preQueuedTask = _step.value;

          _this._internalQueue(preQueuedTask);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
    return _this;
  }

  /**
   * Queues a task (function / async function / Promise)
   * 
   * @param  {Function|Promise<*>} func
   */


  _createClass(ThreadPool, [{
    key: 'queue',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(func) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!this.closed) {
                  _context2.next = 2;
                  break;
                }

                throw new Error('Trying to queue a job to a closed ThreadPool');

              case 2:
                if (!(this.maxQueueSize !== Infinity)) {
                  _context2.next = 8;
                  break;
                }

              case 3:
                if (!(this.queuedTasks.length >= this.maxQueueSize)) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 6;
                return (0, _asyncUtils.sleep)(this.sleepTimeMs);

              case 6:
                _context2.next = 3;
                break;

              case 8:

                this._internalQueue(func);

              case 9:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function queue(_x4) {
        return _ref2.apply(this, arguments);
      }

      return queue;
    }()

    /**
     * Starts executing all queued tasks
     * 
     * This function can be awaited - it will return after the ThreadPool has been closed and all it's tasks completed, or after a task threw an error.
     */

  }, {
    key: 'run',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _asyncUtils.sleep)(0);

              case 2:

                this.startTimeMs = Date.now();

              case 3:
                if (!this._thereIsSomethingToWaitFor) {
                  _context3.next = 9;
                  break;
                }

                // start new queued tasks
                while (this._thereAreQueuedTasksThatCanRun && this._thereIsSpaceForNewTasks) {
                  this._popAndRunNextTask();
                }

                _context3.next = 7;
                return (0, _asyncUtils.sleep)(this.sleepTimeMs);

              case 7:
                _context3.next = 3;
                break;

              case 9:
                this.endTimeMs = Date.now();

                this._throwUncaughtErrors();

              case 11:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function run() {
        return _ref3.apply(this, arguments);
      }

      return run;
    }()

    /**
     * Closes the ThreadPool for further task queueing, the ThreadPool's completion can be awaited afte'r it's called
     */

  }, {
    key: 'close',
    value: function close() {
      this.closed = true;
    }

    /**
     * Closes the ThreadPool, runs it's tasks and awaits their completion
     */

  }, {
    key: 'runAllQueued',
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.close();
                _context4.next = 3;
                return this.run();

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function runAllQueued() {
        return _ref4.apply(this, arguments);
      }

      return runAllQueued;
    }()

    /**
     * Awaits the closing and completion of all ThreadPool tasks
     */

  }, {
    key: 'waitComplete',
    value: function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!this._thereIsSomethingToWaitFor) {
                  _context5.next = 5;
                  break;
                }

                _context5.next = 3;
                return (0, _asyncUtils.sleep)(this.sleepTimeMs);

              case 3:
                _context5.next = 0;
                break;

              case 5:

                this._throwUncaughtErrors();

              case 6:
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

    /**
     * Closes the ThreadPool and awaits the running and completion of all ThreadPool tasks
     */

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

    /**
     * Returns the time in milliseconds that passed since the last still uncompleted task started executing
     */

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

    /****************** privates ******************/

  }, {
    key: '_throwUncaughtErrors',
    value: function _throwUncaughtErrors() {
      if (this._thereWereUncaughtErrors) {
        var error = new Error(this.uncaughtErrors.length + ' errors were thrown during ThreadPool execution');
        error.uncaughtErrors = this.uncaughtErrors;
        throw error;
      }
    }
  }, {
    key: '_internalQueue',
    value: function _internalQueue(func) {
      this.queuedTasks.push({ func: func, index: this.queuedCount });
      this._taskData.set(this.queuedCount, new TaskDesc());
      this.queuedCount++;
    }
  }, {
    key: '_popAndRunNextTask',
    value: function () {
      var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7() {
        var taskToRun, taskData;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                taskToRun = this.queuedTasks.shift();
                taskData = this._taskData.get(taskToRun.index);

                if (taskData) {
                  _context7.next = 4;
                  break;
                }

                throw new Error('unexpected');

              case 4:
                _context7.prev = 4;

                this.startedCount++;
                taskData.startTime = Date.now();

                if (!(typeof taskToRun.func === 'function')) {
                  _context7.next = 12;
                  break;
                }

                _context7.next = 10;
                return taskToRun.func();

              case 10:
                _context7.next = 14;
                break;

              case 12:
                _context7.next = 14;
                return taskToRun.func;

              case 14:
                _context7.next = 19;
                break;

              case 16:
                _context7.prev = 16;
                _context7.t0 = _context7['catch'](4);

                try {
                  taskData.err = _context7.t0;
                  this.errorHandler(_context7.t0);
                } catch (err2) {
                  this.uncaughtErrors.push(err2);
                }

              case 19:
                this.endedCount++;
                taskData.endTime = Date.now();

                // fire 'progress' event
                this.emit('progress', { endedCount: this.endedCount });

              case 22:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this, [[4, 16]]);
      }));

      function _popAndRunNextTask() {
        return _ref7.apply(this, arguments);
      }

      return _popAndRunNextTask;
    }()
  }, {
    key: '_thereIsSpaceForNewTasks',
    get: function get() {
      return this.startedCount - this.endedCount < this.maxThreadsCount;
    }
  }, {
    key: '_thereWereUncaughtErrors',
    get: function get() {
      return this.uncaughtErrors.length > 0;
    }
  }, {
    key: '_newTasksCanBeQueued',
    get: function get() {
      return !this.closed && !this._thereWereUncaughtErrors;
    }
  }, {
    key: '_thereAreRunningTasks',
    get: function get() {
      return this.startedCount - this.endedCount > 0;
    }
  }, {
    key: '_thereAreQueuedTasksThatCanRun',
    get: function get() {
      return this.queuedTasks.length > 0 && !this._thereWereUncaughtErrors;
    }
  }, {
    key: '_thereIsSomethingToWaitFor',
    get: function get() {
      return this._thereAreRunningTasks || this._thereAreQueuedTasksThatCanRun || this._newTasksCanBeQueued;
    }
  }]);

  return ThreadPool;
}(_events2.default);

exports.default = ThreadPool;
//# sourceMappingURL=ThreadPool.js.map