// @flow

import "babel-polyfill"
import EventEmitter from 'events'

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

type ThreadPoolOptions = { errorHandler: ?Function, sleepTimeMs: ?number, maxQueueSize: ?number }

/**
 * A thread-pool abstraction for ES6 async operations",
 * 
 * @export
 * @class ThreadPool
 * @extends {EventEmitter}
 */
export default class ThreadPool extends EventEmitter {
  preQueuedTasks: Array<Function | Promise<*>>

  startTimeMs: number
  endTimeMs: number
  maxThreadsCount: number
  queuedTasks: Array<{ func: Function | Promise<*>, index: number }> = []
  queuedCount: number = 0
  startedCount: number = 0
  endedCount: number = 0
  errorHandler: Function
  uncaughtErrors: Array<Error> = []
  sleepTimeMs: number
  closed: boolean = false
  maxQueueSize: number
  _taskData: Map<number, TaskDesc> = new Map()


  static async run(maxThreadsCount: number, freeParam1: ThreadPoolOptions | Array<Function | Promise<*>> | void, freeParam2: Array<Function | Promise<*>> | void) {
    return new ThreadPool(maxThreadsCount, freeParam1, freeParam2).runAllQueued()
  }

  /**
   * Creates an instance of ThreadPool
   */
  constructor(maxThreadsCount: number, freeParam1: ThreadPoolOptions | Array<Function | Promise<*>> | void, freeParam2: Array<Function | Promise<*>> | void) {
    super()

    this.maxThreadsCount = maxThreadsCount 

    // set defualts
    this.errorHandler = (err: Error) => console.error(err)  // eslint-disable-line no-console
    this.sleepTimeMs = DEFAULT_SLEEP_TIME_MS
    this.maxQueueSize = Infinity

    if (Array.isArray(freeParam1)) {
      this.preQueuedTasks = freeParam1
    } else if (typeof freeParam1 === 'object') {
      if (freeParam1.errorHandler != undefined)
        this.errorHandler = freeParam1.errorHandler
      if (freeParam1.sleepTimeMs != undefined)
        this.sleepTimeMs = freeParam1.sleepTimeMs
      if (freeParam1.maxQueueSize != undefined)
        this.maxQueueSize = freeParam1.maxQueueSize
    } 

    if (Array.isArray(freeParam2)) {
      if (this.preQueuedTasks)
        throw new Error('Tasks were set twice')
      this.preQueuedTasks = freeParam2
    } 

    if (maxThreadsCount <= 0) {
      throw new Error(`ThreadPool maxThreadsCount must be greater than 0`)
    }

    if (this.preQueuedTasks) {
      for (let preQueuedTask of this.preQueuedTasks) {
        this._internalQueue(preQueuedTask)
      }
    }
  }

  /**
   * Queues a task (function / async function / Promise)
   * 
   * @param  {Function|Promise<*>} func
   */
  async queue(func: Function | Promise<*>) {
    if (this.closed)
      throw new Error(`Trying to queue a job to a closed ThreadPool`)

    // block till queue has space
    if (this.maxQueueSize !== Infinity) {
      while (this.queuedTasks.length >= this.maxQueueSize) {
        await sleep(this.sleepTimeMs)
      }
    }

    this._internalQueue(func)
  }
  
  /**
   * Starts executing all queued tasks
   * 
   * This function can be awaited - it will return after the ThreadPool has been closed and all it's tasks completed, or after a task threw an error.
   */
  async run() {
    // make sure tasks start executing async
    await sleep(0)

    this.startTimeMs = Date.now()
    while (this._thereIsSomethingToWaitFor) {

      // start new queued tasks
      while (this._thereAreQueuedTasksThatCanRun && this._thereIsSpaceForNewTasks) {
        this._popAndRunNextTask()
      }

      await sleep(this.sleepTimeMs)
    }
    this.endTimeMs = Date.now()

    this._throwUncaughtErrors()
  }

  /**
   * Closes the ThreadPool for further task queueing, the ThreadPool's completion can be awaited afte'r it's called
   */
  close() {
    this.closed = true
  }

  /**
   * Closes the ThreadPool, runs it's tasks and awaits their completion
   */
  async runAllQueued() {
    this.close()
    await this.run()
  }

  /**
   * Awaits the closing and completion of all ThreadPool tasks
   */
  async waitComplete() {
    while (this._thereIsSomethingToWaitFor) {
      await sleep(this.sleepTimeMs)
    }

    this._throwUncaughtErrors()
  }

  /**
   * Closes the ThreadPool and awaits the running and completion of all ThreadPool tasks
   */
  async closeAndWaitComplete() {
    this.close()
    await this.waitComplete()
  }

  /**
   * Returns the time in milliseconds that passed since the last still uncompleted task started executing
   */
  getLongestStillRunningMs() {
    let now = Date.now()
    let runTimes = Array.from(this._taskData.values())
      .filter(td => td.startTime && !td.endTime)
      // $FlowIgnore
      .map(td => now - td.startTime)
    let longestRunning = Math.max(...runTimes)
    return longestRunning
  }

  /****************** privates ******************/

  get _thereIsSpaceForNewTasks(): boolean { return this.startedCount - this.endedCount < this.maxThreadsCount }
  get _thereWereUncaughtErrors(): boolean { return this.uncaughtErrors.length > 0 }
  get _newTasksCanBeQueued(): boolean { return !this.closed && !this._thereWereUncaughtErrors }
  get _thereAreRunningTasks(): boolean { return this.startedCount - this.endedCount > 0 }
  get _thereAreQueuedTasksThatCanRun(): boolean { return this.queuedTasks.length > 0 && !this._thereWereUncaughtErrors }
  get _thereIsSomethingToWaitFor(): boolean { return this._thereAreRunningTasks || this._thereAreQueuedTasksThatCanRun || this._newTasksCanBeQueued }

  _throwUncaughtErrors() {
    if (this._thereWereUncaughtErrors) {
      let error = (new Error(`${this.uncaughtErrors.length} errors were thrown during ThreadPool execution`): Object)
      error.uncaughtErrors = this.uncaughtErrors
      throw error
    }
  }

  _internalQueue(func: Function | Promise<*>) {
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
      if (typeof taskToRun.func === 'function')
        await taskToRun.func()
      else
        await taskToRun.func
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
}
