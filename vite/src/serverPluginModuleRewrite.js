// const { readBody } = require("./util");
// const { parse } = require("es-module-lexer"); // 解析所有import语法，把代码变成ast
// const MagicString = require("magic-string"); // 处理字符串

// function rewriteImports(source) {
//   let imports = parse(source)[0];
//   let ms = new MagicString(source);
//   if (imports.length > 0) {
//     for (let i = 0; i < imports.length; i++) {
//       let { n, s, e } = imports[i];
//       // 1、vue
//       // 2、./App.vue
//       // 3、./index.css
//       if (/^[^\/\.]/.test(n)) {
//         let id = `/@modules/${n}`;
//         ms.overwrite(s, e, id);
//       }
//     }
//   }
//   return ms.toString();
// }
// // 洋葱模型
// // 先走next的上面部分
// // 然后继续走next的下面的部分
// // 类似于loader-runner
// function moduleRewritePlugin({ app, root }) {
//   app.use(async (ctx, next) => {
//     // todo
//     await next();
//     // 默认会先执行静态服务中间件
//     // 需要将流转换成字符串，只需要处理js中的引用问题
//     if (ctx.body && ctx.response.is("js")) {
//       let content = await readBody(ctx.body);
//       let result = rewriteImports(content);
//       ctx.body = result;
//     }
//   });
// }
let { readBody } = require("./utils");
let MagicString = require("magic-string");
let { parse } = require("es-module-lexer");
let path = require("path");

async function rewriteImports(content) {
  var magicString = new MagicString(content);
  let imports = await parse(content);
  if (imports && imports.length > 0) {
    for (let i = 0; i < imports[0].length; i++) {
      const { n, s, e } = imports[0][i];
      //如果开头既不是/也不是.的话才会需要替换
      if (/^[^\/\.]/.test(n)) {
        const rewriteModuleId = `/node_modules/.vite/${n}.js`;
        magicString.overwrite(s, e, rewriteModuleId);
      }
    }
  }
  return magicString.toString();
}

function moduleRewritePlugin({ root, app }) {
  app.use(async (ctx, next) => {
    await next(); //一上来就next了 next之前神马都没有
    //如果有响应体，并且此响应体的内容类型是js  mime-type=application/javascript
    if (ctx.body && ctx.response.is("js")) {
      const content = await readBody(ctx.body);
      const result = await rewriteImports(content);
      ctx.body = result;
    }
  });
}

module.exports = moduleRewritePlugin;
