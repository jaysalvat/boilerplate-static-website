const fs   = require('fs');
const marked = require('marked');

const markdown = function (value) {
  let markdown = fs.readFileSync('./src/markdown/' + value, 'utf-8');
  let html = marked(markdown);

  return html;
};

module.exports = markdown;
