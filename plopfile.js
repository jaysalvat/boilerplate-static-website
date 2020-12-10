const gulpTasks = require('./gulpfile');

module.exports = function (plop) {

  // Components

  plop.setGenerator('component', {
    description: 'Generate a HTML component',
    prompts: [
      {
        type: 'input',
        name: 'filename',
        message: 'Component file name',
        default: 'component'
      },
      {
        type: 'confirm',
        name: 'sass',
        message: 'Add a SASS file ?',
        default: true
      }
    ],
    actions: function (data) {
      const actions = [];

      actions.push({
        type: 'add',
        path: './src/views/_components/_{{ dashCase filename }}.html',
        templateFile: './templates/component/html.hbs'
      });

      if (data.sass) {
        actions.push({
          type: 'add',
          path: './src/views/_components/_{{ dashCase filename }}.sass',
          templateFile: './templates/component/sass.hbs'
        });
        actions.push(() => {
          gulpTasks.generateSassImports();
          return 'SASS generated';
        });
      }

      return actions;
    }
  });

  // Partials

  plop.setGenerator('partial', {
    description: 'Generate a HTML partial',
    prompts: [
      {
        type: 'input',
        name: 'filename',
        message: 'Partial file name',
        default: 'partial'
      },
      {
        type: 'confirm',
        name: 'sass',
        message: 'Add a SASS file ?',
        default: true
      }
    ],
    actions: function (data) {
      const actions = [];

      actions.push({
        type: 'add',
        path: './src/views/_partials/_{{ dashCase filename }}.html',
        templateFile: './templates/partial/html.hbs'
      });

      if (data.sass) {
        actions.push({
          type: 'add',
          path: './src/views/_partials/_{{ dashCase filename }}.sass',
          templateFile: './templates/partial/sass.hbs'
        });
        actions.push(() => {
          gulpTasks.generateSassImports();
          return 'SASS generated';
        });
      }

      return actions;
    }
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
      {
        type: 'confirm',
        name: 'sass',
        message: 'Add a SASS file ?',
        default: true
      }
    ],
    actions: function (data) {
      const actions = [];

      actions.push({
        type: 'add',
        path: './src/views/{{ myPathCase filename }}/index.html',
        templateFile: './templates/page/html.hbs'
      });

      if (data.sass) {
        actions.push({
          type: 'add',
          path: './src/views/{{ myPathCase filename }}/index.sass',
          templateFile: './templates/page/sass.hbs',
        });
        actions.push(() => {
          gulpTasks.generateSassImports();
          return 'SASS generated';
        });
      }

      return actions;
    }
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
