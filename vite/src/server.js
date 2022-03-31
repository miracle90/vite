const Koa = require("koa");
const { moduleRewritePlugin } = require("./serverPluginModuleRewrite");
const serveStaticPlugin = require("./serverPluginServeStatic");

function createServer() {
  let app = new Koa();
  // 创建一个上下文，来给不同的插件共享功能
  const context = {
    app,
    root: process.cwd(),
  };
  console.log(context.root);
  // 洋葱模型，先按顺序执行，后面的按照相反的顺序再执行一遍
  const resolvePlugin = [
    moduleRewritePlugin, // 2、重写请求的路径
    serveStaticPlugin, // 1、静态服务插件，实现返回插件的功能
  ];
  resolvePlugin.forEach((plugiin) => plugiin(context));

  // 实现静态服务功能，访问我们的服务器，可以返回对应的文件 koa-static
  return app;
}
createServer().listen(4000, () => {
  console.log("vite started  at 4000");
});
