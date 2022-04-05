const static = require("koa-static");
const path = require("path");

function serveStaticPlugin({ app, root }) {
  app.use(static(root));
  app.use(static(path.resolve(root, "public")));
}

module.exports = serveStaticPlugin;
