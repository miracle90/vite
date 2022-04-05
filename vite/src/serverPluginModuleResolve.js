// const fs = require("fs").promises;
// const path = require("path");
// const reg = /^\/@modules\//;

// function moduleResolvePlugin({ app, root }) {
//   app.use(async (ctx, next) => {
//     // 如果没有匹配到 /@modules... 就往下执行
//     if (!reg.test(ctx.path)) {
//       return next();
//     }

//     let mapping = {
//       vue: path.resolve(
//         root,
//         "node_modules",
//         "@vue/runtime-dom/dist/runtime-dom.esm-browser.js"
//       ),
//     };
//     const id = ctx.path.replace(reg, "");
//     const content = await fs.readFile(mapping[id], "utf-8");
//     ctx.type = "js";
//     ctx.body = content;
//   });
// }

const fs = require("fs").promises;
const node_modulesRegexp = /^\/node_modules\/\.vite\/(.+?)\.js/;
const { resolveVue } = require("./utils");

function moduleResolvePlugin({ app, root }) {
  const vueResolved = resolveVue(root);
  app.use(async (ctx, next) => {
    if (!node_modulesRegexp.test(ctx.path)) {
      return next();
    }
    const moduleId = ctx.path.match(node_modulesRegexp)[1];
    const modulePath = vueResolved[moduleId];
    //如果vite预构建
    //const modulePath = path.join(root, ctx.path)
    const content = await fs.readFile(modulePath, "utf8");
    ctx.type = "js";

    ctx.body = content;
  });
}
module.exports = moduleResolvePlugin;
