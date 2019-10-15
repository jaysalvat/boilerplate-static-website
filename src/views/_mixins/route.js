const route = function (path = '', lang = false) {
  let route = '';
  const data = this.context;

  if (lang) {
    route = data.languages[data.currentLang].dir + path;
  } else {
    route = path;
  }

  if (route.indexOf('/') !== 0) {
    route = '/' + route;
  }

  return route;
};

module.exports = route;
