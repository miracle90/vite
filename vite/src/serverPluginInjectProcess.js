const { readBody } = require("./utils");

function injectProcessPlugin({ root, app }) {
  const devInjection = `
    <script>
        window.process = {env:{NODE_ENV:'development'}}
    </script>
    `;
  app.use(async (ctx, next) => {
    await next();
    if (ctx.response.is("html")) {
      const html = await readBody(ctx.body);
      ctx.body = html.replace(/<head>/, `$&${devInjection}`);
    }
  });
}
module.exports = injectProcessPlugin;
