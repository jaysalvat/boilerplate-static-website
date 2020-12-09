const route = function (path = '', lang = true) {
  let route = '';
  const data = this.context;

  if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
    return path;
  }

  if (lang === true) {
    route = data.languages[data.currentLang].dir + path;
  } else if (typeof lang === 'string') {
    route = lang + path;
  } else {
    route = path;
  }

  if (route.indexOf('/') !== 0) {
    route = '/' + route;
  }

  return route.replace(/\/{2,}/g, "/");
};

module.exports = route;
