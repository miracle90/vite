const Module = require("module");
const { Readable } = require("stream");
const path = require("path");
async function readBody(stream) {
  if (stream instanceof Readable) {
    return new Promise((resolve) => {
      let buffers = [];
      stream
        .on("data", (chunk) => buffers.push(chunk))
        .on("end", () => resolve(Buffer.concat(buffers).toString()));
    });
  } else {
    return stream.toString();
  }
}
function resolveVue(root) {
  let require = Module.createRequire(root);
  const resolvePath = (moduleName) =>
    require.resolve(
      path.resolve(
        root,
        "node_modules",
        `@vue/${moduleName}/dist/${moduleName}.esm-bundler.js`
      )
    );
  return {
    "@vue/shared": resolvePath("shared"),
    "@vue/reactivity": resolvePath("reactivity"),
    "@vue/runtime-core": resolvePath("runtime-core"),
    vue: resolvePath("runtime-dom"),
  };
}

exports.readBody = readBody;
exports.resolveVue = resolveVue;
