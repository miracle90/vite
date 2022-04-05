const fs = require("fs").promises;
const path = require("path");
const hash = require("hash-sum");
const {
  parse,
  compileScript,
  compileTemplate,
  rewriteDefault,
  compileStyleAsync,
} = require("@vue/compiler-sfc");

var descriptorCache = new Map();

/**
 * 针对vue模板文件进行处理
 * @param {*} param0 
 */
function vuePlugin({ root, app }) {
  app.use(async (ctx, next) => {
    if (!ctx.path.endsWith(".vue")) {
      return await next();
    }
    const filePath = path.join(root, ctx.path);
    const descriptor = await getDescriptor(filePath, root);
    // console.log(ctx.query.type)
    if (ctx.query.type === "style") {
      const block = descriptor.styles[Number(ctx.query.index)];
      let result = await transformStyle(
        block.content,
        descriptor,
        ctx.query.index
      );
      ctx.type = "js";
      ctx.body = `
        let style = document.createElement('style');
        style.innerHTML = ${JSON.stringify(result.code)};
        document.head.appendChild(style);
      `;
    } else {
      // console.log(descriptor.styles)
      // console.log(descriptor.script)
      // console.log(descriptor.template)
      let targetCode = ``;
      if (descriptor.styles.length) {
        // 如果遇到vue sfc中有style
        let stylesCode = "";
        descriptor.styles.forEach((style, index) => {
          const query = `?vue&type=style&index=${index}&lang.css`;
          const id = ctx.path;
          const styleRequest = (id + query).replace(/\\/g, "/");
          stylesCode += `\nimport ${JSON.stringify(styleRequest)}`;
        });
        targetCode += stylesCode;
      }
      //js
      if (descriptor.script) {
        let script = compileScript(descriptor, {
          id: filePath,
          reactivityTransform: false,
        });
        scriptCode = rewriteDefault(script.content, "_sfc_main");
        targetCode += scriptCode;
      }
      //template
      if (descriptor.template) {
        let templateContent = descriptor.template.content;
        let { code } = compileTemplate({
          id: filePath,
          source: templateContent,
        });
        code = code.replace(/export function render/, "function _sfc_render");
        targetCode += code;
      }
      targetCode += `\n_sfc_main.render=_sfc_render`;
      targetCode += `\nexport default _sfc_main`;
      ctx.type = "js";
      ctx.body = targetCode;
    }
  });
}
async function transformStyle(code, descriptor, index) {
  const block = descriptor.styles[index];
  const result = await compileStyleAsync({
    filename: descriptor.filename,
    source: code,
    id: `data-v-${Date.now()}`,
    scoped: block.scoped,
  });
  return result;
}
async function getDescriptor(filePath) {
  if (descriptorCache.has(filePath)) {
    return descriptorCache.get(filePath);
  }
  const content = await fs.readFile(filePath, "utf8");
  const { descriptor } = parse(content, { filename: filePath });
  descriptorCache.set(filePath, descriptor);
  return descriptor;
}
module.exports = vuePlugin;
