function Promise (func) {
  this.state = 'pending'
  this.value = null
  this.reason = null

  let fulfill = this.fulfill.bind(this)
  let reject = this.reject.bind(this)

  setTimeout(function () {
    func(fulfill, reject)
  }, 0)
}

//TODO make it private
Promise.prototype.fulfill = function (value) {
  this.state = 'fulfilled'
  this.value = value
}

//TODO make it private
Promise.prototype.reject = function (reason) {
  this.state = 'rejected'
  this.reason = reason
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  const self = this

  if (this.state === 'fulfilled') {
    if (typeof onFulfilled === 'function') {
      return new Promise(function (resolve, reject) {
        try {
          const value = onFulfilled(self.value)
          resolve(value)
        } catch (e) {
          reject(e)
        }
      })
    } else {
      return Promise.resolve(this.value)
    }
  }

  if (this.state === 'rejected') {
    if (typeof onRejected === 'function') {
      return new Promise(function (resolve, reject) {
        try {
          const value = onRejected(self.reason)
          resolve(value)
        } catch (e) {
          reject(e)
        }
      })
    } else {
      return Promise.reject(self.reason)
    }
  }

  //TODO implement work with pending status
  return new Promise(function (resolve, reject) {

  })
}

Promise.resolve = function (value) {
  //TODO implement Promise as value
  return new Promise(function (resolve) {
    resolve(value)
  })
}

Promise.reject = function (reason) {
  return new Promise(function (_, reject) {
    reject(reason)
  })
}
