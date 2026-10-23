const fs = require('fs');
const path = require('path');

const html = `<!doctype html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="拼豆工坊：在浏览器本地把图片转换成可编辑的真实色号拼豆图纸，并导出 PNG、PDF、CSV 和工程文件。"
    />
    <title>拼豆工坊 · Bead Studio</title>
    <link rel="stylesheet" href="./styles.css" />
    <script type="importmap">
      {
        "imports": {
          "three": "./vendor/three.module.js"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script src="./vendor/react.production.min.js"></script>
    <script src="./vendor/react-dom.production.min.js"></script>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(process.cwd(), 'generated', 'dist', 'index.html'), html);

