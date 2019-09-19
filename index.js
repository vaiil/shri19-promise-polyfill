//TODO make safe constructor
function Promise (func) {
  this.state = 'pending'
  this.value = null
  this.reason = null
  this.resolveCallbacks = []
  this.rejectCallbacks = []

  let fulfill = this.fulfill.bind(this)
  let reject = this.reject.bind(this)
  //TODO wrap it by try/catch
  func(fulfill, reject)
}

//TODO make it private
Promise.prototype.fulfill = function (value) {
  let fulfill = this.fulfill.bind(this)
  let reject = this.reject.bind(this)

  if (value instanceof Promise) {
    value.then(
      fulfill,
      reject
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

//TODO make it private
Promise.prototype.reject = function (reason) {
  this.state = 'rejected'
  this.reason = reason
  this.rejectCallbacks.forEach(function (callback) {
    callback()
  })
  delete this.rejectCallbacks
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
