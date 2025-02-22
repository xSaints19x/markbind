// coerce convert som types of data into another type
export const coerce = {
  // Convert a string to booleam. Otherwise, return the value without modification, so if is not boolean, Vue throw a warning.
  boolean: val => (typeof val === 'string' ? val === '' || val === 'true' ? true : (val === 'false' || val === 'null' || val === 'undefined' ? false : val) : val),
  // Attempt to convert a string value to a Number. Otherwise, return 0.
  number: (val, alt = null) => (typeof val === 'number' ? val : val === undefined || val === null || isNaN(Number(val)) ? alt : Number(val)),
  // Attempt to convert to string any value, except for null or undefined.
  string: val => (val === undefined || val === null ? '' : val + ''),
  // Pattern accept RegExp, function, or string (converted to RegExp). Otherwise return null.
  pattern: val => (val instanceof Function || val instanceof RegExp ? val : typeof val === 'string' ? new RegExp(val) : null)
}

export function toBoolean (val) {
  return (typeof val === 'string')
    ? ((val === '' || val === 'true')
      ? true
      : ((val === 'false' || val === 'null' || val === 'undefined')
        ? false
        : val))
    : val;
}

export function toNumber (val) {
  return (typeof val === 'number')
    ? val
    : ((val === undefined || val === null || isNaN(Number(val)))
      ? null
      : Number(val));
}

export function getJSON (url) {
  var request = new window.XMLHttpRequest()
  var data = {}
  // p (-simulated- promise)
  var p = {
    then (fn1, fn2) { return p.done(fn1).fail(fn2) },
    catch (fn) { return p.fail(fn) },
    always (fn) { return p.done(fn).fail(fn) }
  };
  ['done', 'fail'].forEach(name => {
    data[name] = []
    p[name] = (fn) => {
      if (fn instanceof Function) data[name].push(fn)
      return p
    }
  })
  p.done(JSON.parse)
  request.onreadystatechange = () => {
    if (request.readyState === 4) {
      let e = {status: request.status}
      if (request.status === 200) {
        try {
          var response = request.responseText
          for (var i in data.done) {
            var value = data.done[i](response)
            if (value !== undefined) { response = value }
          }
        } catch (err) {
          data.fail.forEach(fail => fail(err))
        }
      } else {
        data.fail.forEach(fail => fail(e))
      }
    }
  }
  request.open('GET', url)
  request.setRequestHeader('Accept', 'application/json')
  request.send()
  return p
}

export function getScrollBarWidth () {
  if (document.documentElement.scrollHeight <= document.documentElement.clientHeight) {
    return 0
  }
  let inner = document.createElement('p')
  inner.style.width = '100%'
  inner.style.height = '200px'

  let outer = document.createElement('div')
  outer.style.position = 'absolute'
  outer.style.top = '0px'
  outer.style.left = '0px'
  outer.style.visibility = 'hidden'
  outer.style.width = '200px'
  outer.style.height = '150px'
  outer.style.overflow = 'hidden'
  outer.appendChild(inner)

  document.body.appendChild(outer)
  let w1 = inner.offsetWidth
  outer.style.overflow = 'scroll'
  let w2 = inner.offsetWidth
  if (w1 === w2) w2 = outer.clientWidth

  document.body.removeChild(outer)

  return (w1 - w2)
}

// delayer: set a function that execute after a delay
// @params (function, delay_prop or value, default_value)
export function delayer (fn, varTimer, ifNaN = 100) {
  function toInt (el) { return /^[0-9]+$/.test(el) ? Number(el) || 1 : null }
  var timerId
  return function (...args) {
    if (timerId) clearTimeout(timerId)
    timerId = setTimeout(() => {
      fn.apply(this, args)
    }, toInt(varTimer) || toInt(this[varTimer]) || ifNaN)
  }
}

export function getFragmentByHash(url) {
  var type = url.split('#');
  var hash = '';
  if(type.length > 1) {
    hash = type[1];
  }
  return hash;
}

// Fix a vue instance Lifecycle to vue 1/2 (just the basic elements, is not a real parser, so this work only if your code is compatible with both)
export function VueFixer (vue) {
  var vue2 = !window.Vue || !window.Vue.partial
  var mixin = {
    computed: {
      vue2 () { return !this.$dispatch }
    }
  }
  if (!vue2) {
    if (vue.beforeCreate) {
      mixin.create = vue.beforeCreate
      delete vue.beforeCreate
    }
    if (vue.beforeMount) {
      vue.beforeCompile = vue.beforeMount
      delete vue.beforeMount
    }
    if (vue.mounted) {
      vue.ready = vue.mounted
      delete vue.mounted
    }
  } else {
    if (vue.beforeCompile) {
      vue.beforeMount = vue.beforeCompile
      delete vue.beforeCompile
    }
    if (vue.compiled) {
      mixin.compiled = vue.compiled
      delete vue.compiled
    }
    if (vue.ready) {
      vue.mounted = vue.ready
      delete vue.ready
    }
  }
  if (!vue.mixins) { vue.mixins = [] }
  vue.mixins.unshift(mixin)
  return vue
}

// Used in the TipBox component to classify the different styles used by bootstrap from the user input.
// @params (the user input type of the box)
export function classifyBootstrapStyle(type, theme) {
  const defaultStyles
    = ['warning', 'info', 'definition', 'success', 'danger', 'tip', 'important', 'wrong'];
  const colorStyles
    = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
  
  const typeStyle = defaultStyles.includes(type) ? type : '';
  const themeStyle = colorStyles.includes(theme) ? theme : '';

  let mainStyle;
  let iconStyle;

  if (themeStyle) {
    mainStyle = themeStyle;
  } else {
    switch (typeStyle) {
    case 'warning':
      mainStyle = 'warning';
      break;
    case 'info':
      mainStyle = 'info';
      break;
    case 'definition':
      mainStyle = 'primary';
      break;
    case 'success':
    case 'tip':
      mainStyle = 'success';
      break;
    case 'important':
    case 'wrong':
      mainStyle = 'danger';
      break;
    default:
      mainStyle = 'default';
      break;
    }
  }

  switch (typeStyle) {
    case 'wrong':
      iconStyle = 'fa-times';
      break;
    case 'warning':
      iconStyle = 'fa-exclamation';
      break;
    case 'info':
      iconStyle = 'fa-info';
      break;
    case 'success':
      iconStyle = 'fa-check';
      break;
    case 'important':
      iconStyle = 'fa-flag';
      break;
    case 'tip':
      iconStyle = 'fa-lightbulb';
      break;
    case 'definition':
      iconStyle = 'fa-atlas';
      break;
    default:
      iconStyle = '';
      break;
    }

  return {style: mainStyle, icon: iconStyle};
}
