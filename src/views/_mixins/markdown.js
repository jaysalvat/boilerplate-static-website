const fs   = require('fs');
const marked = require('marked');

marked.setOptions({
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: true,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

const markdown = function (value, lang = '') {
  let markdown;
  const pathfile = './src/markdown/' + lang + '/' + value;

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
