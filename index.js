'use strict';
(function (globalObject) {
  function fulfill (value) {
    if (this.state !== 'pending') {
      return
    }
    if (value instanceof Promise) {
      const fulfillBind = fulfill.bind(this)
      const rejectBind = reject.bind(this)
      if (value === this) {
        rejectBind(new TypeError('Chaining cycle detected for promise'))
        return
      }
      value.then(
        fulfillBind,
        rejectBind
      )
      return
    }

    this.value = value
    this.state = 'fulfilled'
    this.resolveCallbacks.forEach(function (callback) {
      callback()
    })
    delete this.resolveCallbacks
  }

  function reject (reason) {
    if (this.state !== 'pending') {
      return
    }
    this.state = 'rejected'
    this.reason = reason
    this.rejectCallbacks.forEach(function (callback) {
      callback()
    })
    delete this.rejectCallbacks
  }

  function Promise (func) {
    if (typeof func !== 'function') {
      throw TypeError('Promise resolver is not a function')
    }
    if (!(this instanceof Promise)) {
      return new Promise(func)
    }
    this.state = 'pending'
    this.value = null
    this.reason = null
    this.resolveCallbacks = []
    this.rejectCallbacks = []

    let fulfillBind = fulfill.bind(this)
    let rejectBind = reject.bind(this)
    try {
      func(fulfillBind, rejectBind)
    } catch (e) {
      rejectBind(e)
    }
  }

  Promise.prototype.then = function (onFulfilled, onRejected) {
    const self = this

    //TODO Make it global and bind it to Promise
    const onFulfilledWrapper = function (resolve, reject) {
      setTimeout(function () {
        if (typeof onFulfilled === 'function') {
          try {
            const value = onFulfilled(self.value)
            resolve(value)
          } catch (e) {
            reject(e)
          }
        } else {
          resolve(self.value) // Go to next handler
        }
      }, 0)
    }

    //TODO Make it global and bind it to Promise
    const onRejectedWrapper = function (resolve, reject) {
      setTimeout(function () {
        if (typeof onRejected === 'function') {
          try {
            const value = onRejected(self.reason)
            resolve(value)
          } catch (e) {
            reject(e)
          }
        } else {
          reject(self.reason) // Go to next handler
        }
      }, 0)
    }

    return new Promise(function (resolve, reject) {
      switch (self.state) {
        case 'fulfilled':
          onFulfilledWrapper(resolve, reject)
          break
        case 'rejected':
          onRejectedWrapper(resolve, reject)
          break
        case 'pending':
          self.resolveCallbacks.push(function () {
            onFulfilledWrapper(resolve, reject)
          })
          self.rejectCallbacks.push(function () {
            onRejectedWrapper(resolve, reject)
          })
      }
    })
  }

  Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected)
  }

  Promise.resolve = function (value) {
    return new Promise(function (resolve) {
      resolve(value)
    })
  }

  Promise.reject = function (reason) {
    return new Promise(function (_, reject) {
      reject(reason)
    })
  }

  Promise.all = function (iterable) {
    const promises = [...iterable] // I use ES6 syntax, because it can get iterable.
    if (promises.length === 0) {
      return Promise.resolve([])
    }

    let notFiredPromises = promises.length
    const values = new Array(promises.length)

    return new Promise(function (resolve, reject) {
      promises.forEach(function (promise, index) {
        if (promise instanceof Promise) {
          promise.then(
            function (value) {
              values[index] = value
              notFiredPromises--
              if (!notFiredPromises) {
                resolve(values)
              }
            },
            function (reason) {
              reject(reason)
            })
        } else {
          //TODO remove code duplication
          values[index] = promise
          notFiredPromises--
          if (!notFiredPromises) {
            resolve(values)
          }
        }
      })
    })
  }

  Promise.race = function (iterable) {
    const promises = [...iterable] // I use ES6 syntax, because it can get iterable.
    return new Promise(function (resolve, reject) {
      promises.forEach(function (promise) {
        promise.then(resolve, reject)
      })
    })
  }

  globalObject.Promise = Promise
}(window))
