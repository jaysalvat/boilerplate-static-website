const fs   = require('fs');
const Svgo = require('svgo-sync');

const svg = function (value, attrs) {
  let svg = fs.readFileSync('./src/img/' + value, 'utf-8');
  let attributes = '';

  const svgo = new Svgo();
  svg = svgo.optimizeSync(svg).data;

  if (attrs) {
    Object.keys(attrs).forEach(function (key) {
      if (key === '_keys') {
        return;
      }
      attributes += key + '="' + attrs[key] + '" ';
    });
    return svg
      .replace('<?undefined undefined?>', '')
      .replace('<svg ', '<svg ' + attributes);
  }

  return svg;
};

module.exports = svg;
