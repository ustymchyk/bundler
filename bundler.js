const { readFileSync, writeFileSync } = require('fs');
const { parse } = require('babylon');
const path = require('path');
const traverse = require('babel-traverse').default;
const babel = require('babel-core');
let ID = 0;

function createAssets(filename) {
  const file = readFileSync(filename, 'utf-8');
  const ast = parse(file, { sourceType: 'module' });
  const dependencies = [];

  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    },
  });

  return {
    id: ID++,
    filename,
    dependencies,
    code: babel.transformFromAst(ast, null, { presets: ['env'] }).code,
  };
}

function dependenciesGraph(entry) {
  const queue = [createAssets(entry)];

  for (const asset of queue) {
    const dirname = path.dirname(asset.filename);

    asset.mapping = {};

    asset.dependencies.forEach((relativePath) => {
      const absolutePathToFile = path.join(dirname, relativePath);
      const children = createAssets(absolutePathToFile);

      asset.mapping[relativePath] = children.id;

      queue.push(children);
    });
  }

  return queue;
}

function bundle(graph) {
  let modules = '';

  graph.forEach((module) => {
    modules += `${module.id}: [
      function(require, module, exports) {
        ${module.code}
      },
      ${JSON.stringify(module.mapping)}
    ],`;
  });

  let bundle = `
    (function(modules) {
      function require(id) {
        const [moduleFn, mapping] = modules[id];

        function localRequire(pathFromRequire) {
          return require(mapping[pathFromRequire]);
        }

        const module = { exports: {} };

        moduleFn(localRequire, module, module.exports);

        return module.exports;
      }

      require(0);
    })({${modules}})
  `;

  return bundle;
}

function createBundle(input, output) {
  writeFileSync(output, bundle(dependenciesGraph(input)), {
    encoding: 'utf-8',
  });
}

createBundle('./example/entry.js', './bundle.js');
