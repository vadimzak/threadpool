'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _asyncUtils = require('./asyncUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const DEFAULT_SLEEP_TIME_MS = 100;

class TaskDesc {

  constructor() {
    this.queueTime = Date.now();
  }
}

/**
 * A thread-pool abstraction for ES6 async operations",
 * 
 * @export
 * @class ThreadPool
 * @extends {EventEmitter}
 */
class ThreadPool extends _events2.default {

  constructor(maxThreadsCount = _os2.default.cpus().length, errorHandler, sleepTimeMs = DEFAULT_SLEEP_TIME_MS, maxQueueSize = Infinity) {
    super();

    this.queuedTasks = [];
    this.queuedCount = 0;
    this.startedCount = 0;
    this.endedCount = 0;
    this.uncaughtErrors = [];
    this.closed = false;
    this._taskData = new Map();
    if (maxThreadsCount <= 0) {
      throw new Error(`ThreadPool maxThreadsCount must be greater than 0`);
    }
    this.maxThreadsCount = maxThreadsCount;
    this.errorHandler = errorHandler || (err => console.error(err)); // eslint-disable-line no-console
    this.sleepTimeMs = sleepTimeMs;
    this.maxQueueSize = maxQueueSize;
  }

  queue(func) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.closed) throw new Error(`Trying to queue a job to a closed ThreadPool`);

      if (_this.maxQueueSize !== Infinity) {
        while (_this.queuedTasks.length >= _this.maxQueueSize) {
          yield (0, _asyncUtils.sleep)(_this.sleepTimeMs);
        }
      }

      _this.queuedTasks.push({ func, index: _this.queuedCount });
      _this._taskData.set(_this.queuedCount, new TaskDesc());
      _this.queuedCount++;
    })();
  }

  _popAndRunNextTask() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let taskToRun = _this2.queuedTasks.shift();
      let taskData = _this2._taskData.get(taskToRun.index);
      if (!taskData) throw new Error('unexpected');
      try {
        _this2.startedCount++;
        taskData.startTime = Date.now();
        yield taskToRun.func();
      } catch (err) {
        try {
          taskData.err = err;
          _this2.errorHandler(err);
        } catch (err2) {
          _this2.uncaughtErrors.push(err2);
        }
      }
      _this2.endedCount++;
      taskData.endTime = Date.now();

      // fire 'progress' event
      _this2.emit('progress', { endedCount: _this2.endedCount });
    })();
  }

  runAllQueued() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _this3.close();
      yield _this3.run();
    })();
  }

  run() {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      _this4.startTimeMs = Date.now();
      while (!_this4.closed || _this4.startedCount - _this4.endedCount > 0 || _this4.queuedTasks.length > 0) {
        // TP is still open OR at least one task is running OR queued (we have work to do)

        while (_this4.startedCount - _this4.endedCount < _this4.maxThreadsCount && _this4.queuedTasks.length > 0) {
          // we can run more tasks
          _this4._popAndRunNextTask();
        }

        if (!_this4.closed || _this4.startedCount - _this4.endedCount > 0) {
          // TP is still open OR we are running and can't run more - now we wait
          yield (0, _asyncUtils.sleep)(_this4.sleepTimeMs);
        }
      }
      _this4.endTimeMs = Date.now();

      if (_this4.uncaughtErrors.length > 0) {
        let error = new Error(`${ _this4.uncaughtErrors.length } errors were thrown during ThreadPool execution`);
        error.uncaughtErrors = _this4.uncaughtErrors;
        throw error;
      }
    })();
  }

  waitComplete() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      while (!_this5.closed || _this5.startedCount - _this5.endedCount > 0 || _this5.queuedTasks.length > 0) {
        yield (0, _asyncUtils.sleep)(_this5.sleepTimeMs);
      }
    })();
  }

  close() {
    this.closed = true;
  }

  closeAndWaitComplete() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      _this6.close();
      yield _this6.waitComplete();
    })();
  }

  getLongestStillRunningMs() {
    let now = Date.now();
    let runTimes = Array.from(this._taskData.values()).filter(td => td.startTime && !td.endTime)
    // $FlowIgnore
    .map(td => now - td.startTime);
    let longestRunning = Math.max(...runTimes);
    return longestRunning;
  }
}
exports.default = ThreadPool;
//# sourceMappingURL=ThreadPool.js.map