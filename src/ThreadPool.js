// @flow

import EventEmitter from 'events'
import os from 'os'

import { sleep } from './asyncUtils'

const DEFAULT_SLEEP_TIME_MS = 100

class TaskDesc {
  queueTime: number
  startTime: ?number
  endTime: ?number
  err: ?Error

  constructor() {
    this.queueTime = Date.now()
  }
}

/**
 * A thread-pool abstraction for ES6 async operations",
 * 
 * @export
 * @class ThreadPool
 * @extends {EventEmitter}
 */
export default class ThreadPool extends EventEmitter {
  startTimeMs: number
  endTimeMs: number
  maxThreadsCount: number
  queuedTasks: Array<{ func: Function, index: number }> = []
  queuedCount: number = 0
  startedCount: number = 0
  endedCount: number = 0
  errorHandler: Function
  uncaughtErrors: Array<Error> = []
  sleepTimeMs: number
  closed: boolean = false
  maxQueueSize: number
  _taskData: Map<number, TaskDesc> = new Map()

  constructor(maxThreadsCount: number = os.cpus().length, errorHandler: ?Function, sleepTimeMs: number = DEFAULT_SLEEP_TIME_MS, maxQueueSize: number = Infinity) {
    super()
    
    if (maxThreadsCount <= 0) {
      throw new Error(`ThreadPool maxThreadsCount must be greater than 0`)
    }
    this.maxThreadsCount = maxThreadsCount
    this.errorHandler = errorHandler || ((err) => console.error(err))  // eslint-disable-line no-console
    this.sleepTimeMs = sleepTimeMs
    this.maxQueueSize = maxQueueSize
  }

  async queue(func: Function) {
    if (this.closed)
      throw new Error(`Trying to queue a job to a closed ThreadPool`)

    if (this.maxQueueSize !== Infinity) {
      while (this.queuedTasks.length >= this.maxQueueSize) {
        await sleep(this.sleepTimeMs)
      }
    }

    this.queuedTasks.push({ func, index: this.queuedCount })
    this._taskData.set(this.queuedCount, new TaskDesc())
    this.queuedCount++
  }

  async _popAndRunNextTask () {
    let taskToRun = this.queuedTasks.shift()
    let taskData = this._taskData.get(taskToRun.index)
    if (!taskData)
      throw new Error('unexpected')
    try {
      this.startedCount++
      taskData.startTime = Date.now()
      await taskToRun.func()
    } catch(err) {
      try {
        taskData.err = err
        this.errorHandler(err)
      } catch(err2) {
        this.uncaughtErrors.push(err2)
      }
    }
    this.endedCount++
    taskData.endTime = Date.now()

    // fire 'progress' event
    this.emit('progress', { endedCount: this.endedCount })
  }

  async runAllQueued() {
    this.close()
    await this.run()
  }

  async run() {
    this.startTimeMs = Date.now()
    while (!this.closed || this.startedCount - this.endedCount > 0 || this.queuedTasks.length > 0) {
      // TP is still open OR at least one task is running OR queued (we have work to do)

      while(this.startedCount - this.endedCount < this.maxThreadsCount && this.queuedTasks.length > 0) {
        // we can run more tasks
        this._popAndRunNextTask()
      }

      if (!this.closed || this.startedCount - this.endedCount > 0) {
        // TP is still open OR we are running and can't run more - now we wait
        await sleep(this.sleepTimeMs)
      }
    }
    this.endTimeMs = Date.now()

    if (this.uncaughtErrors.length > 0) {
      let error = (new Error(`${this.uncaughtErrors.length} errors were thrown during ThreadPool execution`): Object)
      error.uncaughtErrors = this.uncaughtErrors
      throw error
    }
  }

  async waitComplete() {
    while (!this.closed || this.startedCount - this.endedCount > 0 || this.queuedTasks.length > 0) {
      await sleep(this.sleepTimeMs)
    }
  }

  close() {
    this.closed = true
  }

  async closeAndWaitComplete() {
    this.close()
    await this.waitComplete()
  }

  getLongestStillRunningMs() {
    let now = Date.now()
    let runTimes = Array.from(this._taskData.values())
      .filter(td => td.startTime && !td.endTime)
      // $FlowIgnore
      .map(td => now - td.startTime)
    let longestRunning = Math.max(...runTimes)
    return longestRunning
  }
}
