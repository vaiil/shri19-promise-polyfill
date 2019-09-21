# shri19-promise-polyfill
Promise polyfill

Для тестов
```
npm test
```

В коде полифилла ES6 использовался только как const и let, и для получения массива из iterable. 
При желании это можно заменить на ES5.

В тестах использовались стрелочные функции, async/await и прочее.

Для того чтобы сломать нативный полифилл в браузере:

```js
const NativePromise = window.Promise
window.Promise = undefined // Break default promises
```
