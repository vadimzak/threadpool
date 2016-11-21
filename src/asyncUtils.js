// @flow

export async function sleep(periodMs: number = 0) {
  return new Promise(r => setTimeout(r, periodMs))
}
