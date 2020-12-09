module.exports = function (plop) {

  // Partials

  plop.setGenerator('partial', {
    description: 'Generate a HTML partial',
    prompts: [
      {
        type: 'input',
        name: 'filename',
        message: 'Partial file name',
        default: 'partial'
      }
    ],
    actions: [{
      type: 'add',
      path: './src/views/_partials/_{{ dashCase filename }}.html',
      templateFile: './templates/partial/html.hbs'
    },
    {
      type: 'add',
      path: './src/sass/partials/{{ dashCase filename }}.sass',
      templateFile: './templates/partial/sass.hbs'
    },
    {
      type: 'append',
      path: './src/sass/styles.sass',
      templateFile: './templates/partial/sass-import.hbs'
    }]
  });

  // Page

  plop.setGenerator('page', {
    description: 'Generate a HTML page',
    prompts: [
      {
        type: 'input',
        name: 'filename',
        message: 'Page file name',
        default: '.'
      },
    ],
    actions: [{
      type: 'add',
      path: './src/views/{{ myPathCase filename }}/index.html',
      templateFile: './templates/page/html.hbs'
    },
    {
      type: 'add',
      path: './src/sass/pages/_{{ dashCase filename }}.sass',
      templateFile: './templates/page/sass.hbs',
    },
    {
      type: 'append',
      path: './src/sass/styles.sass',
      templateFile: './templates/page/sass-import.hbs'
    }]
  });

  // Helpers

  plop.setHelper('relativePath', function (path) {
    let relativePath = '';
    const parts = path.split(/\//g);

    if (path === '.' || !parts.length) {
      return './';
    }

    parts.forEach(() => {
      relativePath += '../';
    });

    return relativePath;
  });

  // like pathCase but keep - in the path

  plop.setHelper('myPathCase', function (path) {
    return path
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .split(/[^\w-]/)
            .join('/')
            .replace(/\/{2,}/g, '/');
  });
};
