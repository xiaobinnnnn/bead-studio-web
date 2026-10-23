# BEAD-WEB-001 Phase 0：开源仓库审查

审查日期：2026-10-23  
结论：以 `Jett-Wu/Perler_Beads_Generator` 为唯一代码基线，保留现有编辑器；从两个参考项目中只迁移经过独立封装和测试的算法思想，不直接拼接其单文件实现。三个仓库均声明 MIT License，可以修改和再分发，但发布时必须保留原版权与许可文本。

## 1. 审查范围与基线

| 仓库 | 当前结构 | 许可 | 结论 |
| --- | --- | --- | --- |
| `Jett-Wu/Perler_Beads_Generator` | React + TypeScript + Canvas + Three.js；26 个主要文本文件 | MIT，Copyright 2026 Jett-Wu | 作为主项目，最小改动演进 |
| `belleqaq/perler-bead-generator` | 零构建 HTML/CSS/原生 JS，算法与编辑器分文件 | MIT | 仅参考处理流程；适合迁移 K-Means、双边平滑、Sobel 轮廓等独立算法 |
| `ya-chang/bead-pattern-generator` | 单文件 HTML/JS | MIT | 仅参考数学实现；CIEDE2000、边缘保护、去背景、合色、去杂点具有价值，但必须拆分和测试 |

审查以三个仓库 `main` 分支在 2026-10-23 的公开内容为准。主项目代码通过 GitHub 只读内容接口恢复到本地；展示图片未复制，避免把非运行必需的大型二进制资产带入开发基线。

## 2. 主项目现有能力

### 可直接复用

- 图片按拼豆格区域采样，提供写实/卡通两种风格、色数限制、背景处理和去杂点。
- MARD 221 与 291 色数据、色卡分组、最近使用和选色 UI。
- Canvas 编辑器：画笔、橡皮、填充、吸管、换色、移动、复制、粘贴、镜像、形状、文字、图层、撤销/重做、缩放和平移。
- 用量统计、分层统计、打印 PNG/PDF、Excel 用量和 JSON 编辑记录。
- 本地浏览器处理、响应式布局、GitHub Pages 工作流和基础 CI 工作流。

### 需要改造

- `src/App.tsx` 约 144 KB、`src/WorkspaceCanvas.tsx` 约 91 KB、`src/styles.css` 约 78 KB，职责过度集中；应渐进拆分，不应一次重写。
- 现有 `BeadProject.cells` 是 `string | null` 数组，缺少单元格来源、人工确认、识别置信度和原始采样颜色；V2 无法直接承载。
- 当前色差匹配是加权 RGB 距离，而不是任务要求优先的 Lab/CIEDE2000。
- 已有 PNG 是打印图纸导出，没有严格定义“每格一像素、透明空格、最近邻整数倍”的设备导入格式。
- 图片入口以文件选择为主；URL、剪贴板、EXIF、超大图保护和错误回退需要补齐。
- 工程文件只有现有版本字符串和兼容归一化，没有独立 schema 版本、显式迁移链和严格校验。
- 缺少 Vitest/Playwright 测试和固定图像样本；当前 CI 只覆盖构建。

### 必须新增

- 独立核心域模型与旧项目适配器；图像处理、颜色匹配、统计和导出不得依赖 React UI。
- CIEDE2000/CIE76/加权 RGB 可切换色差模块，以及色卡“数字参考、是否校准”元数据。
- 纯像素 PNG 数据管线、CSV 标准材料清单、52×52 未验证设备预设。
- URL/拖拽/粘贴输入和客户端图像安全限制。
- V2 `photo-reconstruction` 接口、置信度和人工确认字段；OpenCV.js 延后按需加载。
- 固定测试样本、核心单元测试、浏览器端导出回读测试和移动端端到端测试。

## 3. 三个项目的算法比较

| 能力 | Jett-Wu 主项目 | belleqaq 参考 A | ya-chang 参考 B | 采用策略 |
| --- | --- | --- | --- | --- |
| 网格采样 | 多点区域采样，写实/卡通 profile | mode sampling、风格处理 | mean/dominant/edge-aware/pixel | 保留主项目，后续抽象采样策略接口 |
| 色差 | 加权 RGB | 主要依赖现有色板距离 | RGB→Lab、CIE76、CIEDE2000 | 新建独立 CIEDE2000 模块并保留切换 |
| 限色 | 排名、特征色保护、相似色合并 | K-Means、扩散、量化 | 相似合并、K-Means | 保留主项目特征色策略；K-Means作为可选策略，不耦合 UI |
| 边缘保护 | 通过特征色和区域后处理间接实现 | Sobel outline | Sobel gradient、edge-aware sample | V1 图案模式引入可选 Sobel 权重，需固定样本测试 |
| 去背景 | 白底/估计背景与采样阈值 | 编辑器内 flood-fill | 角点采样 + flood-fill + Sobel | V1 先做简单背景；复杂抠图作为独立策略 |
| 去杂点 | tiny region + speckle reduction | small-region merge、bilateral smooth | removeStray | 保留主项目，补充稳定性和边界测试 |
| 导出 | 打印 PNG/PDF、XLSX、JSON | PNG/SVG/PDF/JSON | 图纸 PNG、raw PNG、SVG、CSV | 主项目新增严格 raw PNG 和 CSV；PDF沿用 |

参考 A 的 `processor.js` 已经相对模块化，但仍依赖其全局状态和数据格式，不能直接复制。参考 B 的算法全部嵌在 `index.html`，数学实现值得验证，应用代码不适合作为长期依赖。Phase 1 首批已根据公开算法定义独立实现 CIEDE2000，并使用 Sharma 标准样例测试，不直接复制参考项目代码。

## 4. 依赖、构建与部署风险

| 风险 | 等级 | 处理 |
| --- | --- | --- |
| React 18 配合 `@types/react` 19 | 中 | 后续统一到 React 18 类型或整体升级，避免隐性类型差异 |
| TypeScript 使用宽松 semver，锁文件当前解析到 5.9.3 | 低 | CI 固定使用 `npm ci`；必要时精确锁定版本 |
| 自定义 tsc 构建脚本而非 Vite | 中 | V1 可继续沿用；新增测试后再评估迁移，避免为换工具重写 |
| 三个大文件承担过多职责 | 高 | 按 `core / input / processing / editor / export` 渐进抽取 |
| Canvas 最大边长与大图内存 | 高 | 输入端限制解码像素、转换在 Worker 中执行、导出显式上限 |
| URL 图片 CORS | 中 | 只允许浏览器可读响应；失败提示用户下载后上传，不设置绕过代理 |
| 色卡 RGB 未经实体测量 | 高 | 数据模型记录 `calibrated: false`，界面禁止宣称真实校准色 |
| 智能板 App 导入规则未知 | 高 | 52×52 只标记“测试预设”；厂商 App 实测前不标记兼容 |
| OpenCV.js 包体和首屏性能 | 中 | V2 动态加载，不能进入 V1 首屏包 |

本地首次安装命令为 `npm ci`，原始构建命令为 `npm run build`，部署目标为 `generated/dist/`。本次执行环境启用了 npm 离线缓存模式，且缓存中缺少 `typescript-5.9.3.tgz`，因此依赖安装和原始 TypeScript 构建无法在当前主机完成；该限制已作为发布前复验门禁，不将失败伪装为代码通过。

## 5. 推荐架构

```text
src/
  core/                纯数据模型、迁移、统计、颜色数学、像素导出
  input/               file / drag / clipboard / URL / EXIF / image limits
  processing/          sampler / adjustments / cleanup / palette matching
  editor/              Canvas 交互与历史栈（由旧 WorkspaceCanvas 渐迁）
  export/              raw PNG / chart PNG / PDF / CSV / project JSON
  reconstruction/      V2 接口与原型，OpenCV.js 动态加载
  ui/                  React 面板和响应式布局
```

核心原则是算法接收普通数据并返回普通数据，不读取 React state，也不操作 DOM；浏览器 Canvas 只负责解码/显示/编码。旧 `string | null` 数组通过适配器迁移到带元数据的 `BeadCell[]`，在迁移完成前不得同时维护两个可写真源。

## 6. Phase 0 门禁结论

- 主项目功能覆盖度高且许可证兼容，确认可作为 V1 基线。
- 不采用重写方案；编辑器和现有导出继续复用。
- Phase 1 可以开始，优先建立核心域模型、色差、工程迁移和 raw pixel 导出，再接入 UI。
- V2 只预留 `photo-reconstruction`、置信度和采样字段，不引入 OpenCV.js，不阻塞 V1。
- 公开部署仍需项目所有者提供目标 GitHub 仓库的推送/Pages 权限；本次没有也不会假设远程写权限。

