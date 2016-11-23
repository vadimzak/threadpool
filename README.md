## threadpool.js [![Build Status](https://travis-ci.org/vadimzak/threadpool.svg?branch=master)](https://travis-ci.org/vadimzak/threadpool) [![npm version](https://badge.fury.io/js/threadpool.svg)](http://badge.fury.io/js/threadpool)

__A thread-pool abstraction for ES6 async operations__

## Install

```bash
npm install --save threadpool
```

## Usage

Sort notation:
```javascript
// Fetch the dev names of all GitHub projects,
// executing no more than 10 active requests at any given time
let devNames = new Set()

let range = [...Array(100000).keys()] // (a neat ES6 trick for getting ranges)
await ThreadPool.run(10, range
  .map(n => fetch(`https://api.github.com/repositories?since=${n}`)
    .then(res => res.json())
    .then(json => devNames.add(json.name))))

console.log(`Found ${devNames.size} distinct developers`)
```

Full notation (allowes queueing, executing and waiting completion in different places):
```javascript
// Fetch the metadata of all GitHub projects,
// executing no more than 10 active requests at any given time
let devNames = new Set()

// init the ThreadPool supplying it the max number of parallel executions.
// an options object can also be supplied with a 'errorHandler' function,
// an error thrown from this function will halt ThreadPool execution
let tp = new ThreadPool(10, { errorHandler: err => { throw err } })

for (let i = 0; i < 10000000; i += 100) {
  // queues sync / async functions or Promises (they don't start running yet)
  tp.queue(async () => {
    await fetch(`https://api.github.com/repositories?since=${i}`)
      .then((res) => res.json())
      .then((json) => devNames.add(json.name))
  })
}

// starts execution (queueing new tasks still possible)
tp.run()

// closes the ThreadPool for the queueing of new tasks (so it's completion can be awaited)
tp.close()

// blocks untill all queued tasks completed
try {
  await tp.waitComplete()
} catch(err) {
  // an error from a task, rethrown by 'errorHandler' can be handled here 
  console.error(`Uncaught error`, err)
}

console.log(`Found ${devNames.size} distinct developers`)
```
