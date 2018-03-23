const fs   = require('fs');
const marked = require('marked');

const markdown = function (value) {
  let markdown;
  const pathfile = './src/markdown/' + value;

  if (fs.existsSync(pathfile)) {
    markdown = fs.readFileSync(pathfile, 'utf-8');
  } else {
    markdown = value;

    markdown = markdown.replace(/ {1,}/g, ' ');
  }

  let html = marked(markdown);

  return html;
};

module.exports = markdown;
