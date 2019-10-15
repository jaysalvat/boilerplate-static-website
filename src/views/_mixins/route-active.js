const routeActive = function (path = '', exact = false, className = 'active') {
  const data = this.context;

  if (exact && data.template === path) {
    return className;
  }

  if (!exact && data.template.indexOf(path) !== -1) {
    return className;
  }

  return '';
};

module.exports = routeActive;
