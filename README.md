## threadpool.js

__A thread-pool abstraction for ES6 async operations__

## Usage
```javascript
// Fetch the metadata of all GitHub projects,
// with no more than 10 active requests at any given time
let developerNames = new Set()
const PARALLEL_REQUESTS = 10
let threadpool = new ThreadPool(PARALLEL_REQUESTS)
for (let i = 0; i < 10000000; i += 100) {
  tp.queue(async () => {
    await fetch(`https://api.github.com/repositories?since=${i}`)
      .then((res) => res.json())
      .then((json) => developerNames.add(json.name))
  })
}
await tp.runAllQueued()
console.log(`Found ${developerNames.size} distinct developers`)
```

