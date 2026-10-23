# BEAD-WEB-001 Phase 1 / V1 完成记录

记录日期：2026-10-23

## 本轮已实现

- 新增 `src/core/types.ts`：定义 V2 统一 `BeadProject`、`BeadGrid`、`BeadCell`、`BeadPalette`、`SourceImage`、`ImageTransform` 和 `ExportProfile`。
- 新增 `src/core/grid.ts`：网格创建、严格校验和不可变单格更新，含一百万格内存安全上限。
- 新增 `src/core/color.ts`：RGB→Lab、CIE76、CIEDE2000 和加权 RGB 三种距离；默认优先 CIEDE2000。
- 新增 `src/core/project.ts`：`2.0.0` 工程格式、JSON 序列化/解析、旧 `1.x` 字符串矩阵迁移和异常结构拒绝。
- 新增 `src/core/statistics.ts`：颜色计数、空格计数、总数不变量检查。
- 新增 `src/core/pixelExport.ts`：每格一像素 RGBA 数据、透明空白格、1–64 整数倍最近邻复制和 52×52 预设识别。
- 新增 `tests/core.test.ts`：Sharma CIEDE2000 标准样例、单格编辑统计、工程迁移回读、像素映射与整数倍复制测试。
- 新增 `npm run test:core`，测试不依赖 React 或 DOM。

## 测试结果

- `npm ci`：未执行成功。执行环境的 npm 被配置为 `only-if-cached`，缓存缺少 TypeScript 5.9.3 包。
- `npm run build`：未执行成功。依赖未安装，因而本地没有 `tsc`。
- `npm run test:core`：通过，4 项测试全部成功；使用 Node 24 的 TypeScript type stripping，不要求安装第三方包。
- 结论：新增核心层已完成可重复的本地验证；React 全量类型检查和生产构建仍需在可访问 npm 依赖的环境复验。

## 后续任务（不阻塞 V1）

1. V2 实拍逆向原型：四角校正、网格拟合、颜色置信度和人工确认。
2. 将大图转换迁入 Web Worker，进一步降低低端手机主线程占用。
3. 用真实智能拼豆板厂商 App 验证 52×52 PNG 导入规则并记录厂商/版本。
4. 在取得目标 GitHub 仓库写权限后执行 Pages 公网部署。


