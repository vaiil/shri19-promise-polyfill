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

  test('Only one reject', async () => {
    let a = 0
    await new Promise((resolve, reject) => {
      reject()
      reject()
    })
      .catch(() => {
        a++
      })

    expect(a).toEqual(1)
  })

  test('TypeError when resolver is not function', async () => {
    expect(() => {
      new Promise(334)
    }).toThrow(TypeError)
  })

  test('Reject if resolver function throw error', async () => {
    await expect(new Promise(() => {
      throw 'some error'
    })).rejects.toEqual('some error')
  })

  test('Reject if resolver return the same promise', async () => {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve(promise)
      }, 0)
    })

    await expect(promise).rejects.toBeInstanceOf(TypeError)
  })

  test('just for fun', () => {
    // This case isn't checking. It will be pending anyway (in native realisation too).
    // Just save it as an example of cycling promises
    const p = {}
    p.a = new Promise(res => setTimeout(() => res(p.b), 0))
    p.b = new Promise(res => res(p.a))
  })
})

describe('then', () => {
  test('then chain', async () => {
    const promise = new Promise(resolve => resolve(120))
      .then(value => value * 2) // 240
      .then(value => value + 2) // 242
      .catch(() => 0) // will be ignored
      .then(12345) // Also will be ignored
      .then(12345, () => {}) // Also will be ignored

    expect(await promise).toEqual(242)
  })

  test('multiple then on one promise', async () => {
    let prop = 0
    let promise = new Promise(resolve => resolve(1))
    promise.then(value => {prop += value})
    promise.then(value => {prop += value})
    promise.then(value => {prop += value})
    promise.then(value => {prop += value})
    await promise
    expect(prop).toEqual(4)
  })

  test('then return Promise', async () => {
    const promise = new Promise(resolve => resolve(1)).then(value => new Promise(res => res(value * 10)))
    expect(await promise).toEqual(10)
  })
})

describe('static methods', () => {
  test('Promise.all', async () => {
    const range = [1, 2, 3, 4, 5, 6, 7]
    const promises = range
      .map(
        i => new Promise(
          resolve => {
            setTimeout(() => resolve(i * 10), Math.random() * 100)
          }
        )
      )

    expect(await Promise.all(promises))
      .toEqual(range.map(i => i * 10))

    await expect(
      Promise.all(
        promises.concat(
          new Promise(
            (_, reject) => reject('error')
          )
        )
      )
    ).rejects.toEqual('error')
  })

  test('Promise.race', async () => {
    const p1 = new Promise(function (resolve) {
      setTimeout(resolve, 500, 'one')
    })
    const p2 = new Promise(function (resolve) {
      setTimeout(resolve, 100, 'two')
    })
    expect(await Promise.race([p1, p2])).toEqual('two')
  })

  test('Promise resolve/reject', () => {
    expect(Promise.resolve(Promise.resolve(5))).resolves.toEqual(5)
    expect(Promise.resolve(Promise.reject(5))).rejects.toEqual(5)
  })
})