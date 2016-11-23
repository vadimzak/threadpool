// @flow

import "babel-polyfill"
import ThreadPool from '../ThreadPool'
import { sleep } from '../asyncUtils'
import { expect } from 'chai'

// mocha flow type declarations
declare function describe(name: string, spec: () => void): void
declare function it(name: string, spec: Function): void

describe('ThreadPool', () => {
  it('runs queued functions in parallel', async () => {
    let res = []
    let tp = new ThreadPool(2)
    for (let i = 0; i < 2; i++) {
      let _i = i
      tp.queue(async () => {
        res.push(`before${_i}`)        
        await sleep(10)
        res.push(`after${_i}`)     
      })
    }
    await tp.runAllQueued()

    expect(res).to.eql(['before0', 'before1', 'after0', 'after1'])
  })

  it('throttles execution', async () => {
    let res = []
    let tp = new ThreadPool(2)
    for (let i = 0; i < 3; i++) {
      let _i = i
      tp.queue(async () => {
        res.push(`before${_i}`)        
        await sleep(10)
        res.push(`after${_i}`)     
      })
    }
    await tp.runAllQueued()

    expect(res).to.eql(['before0', 'before1', 'after0', 'after1', 'before2', 'after2'])
  })

  it('does not execute queued tesks sync', async () => {
    let res = []
    let tp = new ThreadPool(3)
    tp.queue(async () => {
      res.push(2)
    })
    tp.run()
    res.push(1)
    await tp.closeAndWaitComplete()

    expect(res).to.eql([1, 2])
  })

  it('works with short notation', async () => {
    let res = []
    await ThreadPool.run(2, [0, 1].map(n => async () => res.push(n)))

    expect(res).to.eql([0, 1])
  })

  it('works with Promises', async () => {
    let res = []
    await ThreadPool.run(2, [0, 1].map(n => new Promise(r => {
      res.push(`before${n}`) 
      setTimeout(() => { 
        res.push(`after${n}`) 
        r()
      }, 10)
    })))
    expect(res).to.eql(['before0', 'before1', 'after0', 'after1'])
  })
 
  it('catches errors', async () => {
    let caughtErr = null
    try {
      await ThreadPool.run(2, { errorHandler: err => { throw err } }, [0, 1].map(n => async () => { 
        throw n
      }))
    } catch (err) {
      caughtErr = err
    }
    expect(caughtErr).to.not.be.null
  })

  it('should not to run new tasks after uncaught error', async () => {
    let startCount = 0
    try {
      await ThreadPool.run(1, { errorHandler: err => { throw err } }, [0, 1].map(n => async () => { 
        startCount++
        throw n
      }))
    } catch (err) { } // eslint-disable-line no-empty

    expect(startCount).to.eql(1)
  })

  it('catches error after completion', async () => {
    let caughtErr = null
    let tp = new ThreadPool(2, { errorHandler: err => { throw err } }, [0, 1].map(n => async () => { throw n }))
    tp.run()
    await sleep(10)
    try {
      await tp.waitComplete()
    } catch(err) {
      caughtErr = err
    }
    expect(caughtErr).to.not.be.null
  })
})