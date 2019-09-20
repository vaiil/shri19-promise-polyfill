global.window = global
const NativePromise = global.Promise
require('./index')

describe('correction init', () => {
  test('NativePromise and Promise object are different', () => {
    expect(NativePromise).not.toEqual(Promise)
  })

  test('Promise is not native', () => {
    expect(Object.prototype.toString.call(new Promise(v => v()))).toEqual('[object Object]')
  })

  test('NativePromise is native', () => {
    expect(Object.prototype.toString.call(new NativePromise(v => v()))).toEqual('[object Promise]')
  })
})

describe('constructor tests', () => {
  test('base test', async () => {
    expect(
      await new Promise(resolve => {
          resolve(1)
        }
      )
    ).toEqual(1)
  })

  test('reject base test', async () => {
    await expect(
      new Promise((resolve, reject) => {
        reject('reason')
      })
    ).rejects.toEqual('reason')
  })

  test('Only one resolve', async () => {
    let a = 0

    await new Promise(resolve => {
      resolve()
      resolve()
    })
      .then(() => {
        a++
      })

    expect(a).toEqual(1)
  })

  test('Don`t resolve when rejected', async () => {
    let a = 0

    await expect(
      new Promise((resolve, reject) => {
        reject(new Error('reason message'))
        resolve()
      })
        .then(() => {
          a++
        })
    ).rejects.toEqual(new Error('reason message'))

    expect(a).toEqual(0)
  })
})
