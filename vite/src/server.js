const Koa = require("koa");
const dedent = require("dedent");
const serveStaticPlugin = require("./serverPluginServeStatic");
const moduleRewritePlugin = require("./serverPluginModuleRewrite");
const moduleResolvePlugin = require("./serverPluginModuleResolve");
const injectProcessPlugin = require('./serverPluginInjectProcess')
const vuePlugin = require('./serverPluginVue')

function createServer() {
  const app = new Koa();
  const root = process.cwd();
  // 构建上下文对象
  const context = {
    app,
    root,
  };
  app.use((ctx, next) => {
    // 扩展ctx属性
    Object.assign(ctx, context);
    return next();
  });
  const resolvedPlugins = [
    injectProcessPlugin,
    moduleRewritePlugin,
    moduleResolvePlugin,
    vuePlugin,
    serveStaticPlugin,
  ];
  // 依次注册所有插件
  resolvedPlugins.forEach((plugin) => plugin(context));
  return app;
}
createServer().listen(4000, async () => {
  const chalk = await import("chalk");
  console.log(
    dedent`${chalk.default.green(`vite-cli dev server running at:`)}
           > Local: http://localhost:4000/
    `
  );
});
