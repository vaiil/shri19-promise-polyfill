function Promise (func) {
  this.state = 'pending'

  const self = this
  setTimeout(function () {
    func(self.fulfill, self.reject)
  }, 0)
}

Promise.prototype.fulfill = function (value) {
  this.state = 'fulfilled'
}

Promise.prototype.reject = function (reason) {
  this.state = 'rejected'
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  return new Promise(function (resolve, reject) {

  })
}