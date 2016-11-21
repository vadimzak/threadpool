import ThreadPool from './ThreadPool'
import { sleep } from './asyncUtils'
import { expect } from 'chai'

describe('ThreadPool', () => {
  it('runs queued functions in parallel', async () => {
    let nums = 3
    let tp = new ThreadPool(nums)
    let res = []
    for (let i=0; i<nums; i++) {
      let _i = i
      tp.queue(async () => {
        await sleep(100 - i * 10)
        res.push(_i)
      })
    }

    tp.run()
    await tp.closeAndWaitComplete()

    expect(res).to.eql([2,1,0])
  })
})