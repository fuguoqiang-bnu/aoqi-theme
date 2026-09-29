# 📖 安装和使用指南

## 快速开始

### 第一步：下载插件

1. 访问 GitHub 仓库
2. 点击绿色的 "Code" 按钮
3. 选择 "Download ZIP"
4. 解压到任意文件夹

### 第二步：安装插件

#### 方式 A：Chrome 扩展（推荐）

**适用于：** Chrome, Edge, Opera, Brave 等 Chromium 内核浏览器

1. 打开浏览器，在地址栏输入：
   - Chrome: chrome://extensions/
   - Edge: dge://extensions/
   - Opera: opera://extensions/

2. 打开右上角的 **"开发者模式"** 开关

3. 点击 **"加载已解压的扩展程序"** 按钮

4. 选择解压后的 oqi-legend-theme-plugin 文件夹

5. 看到插件图标出现，说明安装成功！

#### 方式 B：用户脚本（Tampermonkey）

**适用于：** 所有支持 Tampermonkey 的浏览器

1. 先安装 Tampermonkey：
   - [Chrome 版本](https://chrome.google.com/webstore/detail/tampermonkey/)
   - [Firefox 版本](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - [Edge 版本](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/)

2. 安装完成后，点击 Tampermonkey 图标

3. 选择 **"管理面板"**

4. 点击 **"+"** 号或 **"新建脚本"**

5. 删除默认内容，粘贴 oqi-legend-userscript.js 的全部内容

6. 按 Ctrl+S 保存

7. 确保脚本已启用（开关为绿色）

### 第三步：使用插件

1. 打开 DeepSeek Harness 网页

2. 刷新页面（按 F5 或 Ctrl+R）

3. 你会看到：
   - 背景变成了梦幻的渐变色
   - 右下角出现可爱的奥奇角色
   - 点击页面会有炫酷的特效

4. 第一次使用时，浏览器会请求通知权限，请点击 **"允许"**

## 功能使用说明

### 🔔 任务完成通知

**自动触发：** 当 DeepSeek Harness 完成任务时

- 浏览器右上角会弹出系统通知
- 页面右上角显示精美的通知卡片
- 即使你切换到其他窗口，也能收到提醒

**如果没有收到通知？**
1. 检查浏览器通知权限：
   - 点击地址栏左侧的锁图标
   - 确保 "通知" 设置为 "允许"
2. 打开控制面板，确保 "任务完成通知" 已勾选

### 🖱️ 点击特效

**使用方法：** 在页面任意位置点击鼠标

- 会出现 5 个彩色粒子
- 粒子向上飘动并旋转
- 自动消失

**关闭特效：**
- 打开控制面板
- 取消勾选 "点击特效"

### 🐾 奥奇角色

**位置：** 页面右下角

- 角色会上下浮动
- 鼠标悬停显示角色名称
- 点击会触发动画

### ⚙️ 控制面板

**打开方式：** 查看页面右下角，角色上方的设置面板

**可配置项：**
- ✅ 任务完成通知
- ✅ 点击特效
- ✅ 自动滚动

**保存设置：** 所有设置自动保存，下次打开自动恢复

### 📊 输出优化

**自动生效：** 无需手动操作

- 插件会自动移除输出长度限制
- 对于超长内容，会添加 "显示完整内容" 按钮
- 新内容会自动滚动到可见区域

## 常见问题 FAQ

### Q1: 安装后没有效果？

**解决方法：**
1. 确认插件已启用（扩展管理页面中开关为蓝色）
2. 完全刷新页面（Ctrl+Shift+R 或 Ctrl+F5）
3. 打开浏览器控制台（F12），查看是否有错误信息
4. 检查是否在正确的 DeepSeek Harness 页面

### Q2: 通知不弹出？

**解决方法：**
1. 检查浏览器通知权限：
   - 点击地址栏的锁图标
   - 找到 "通知" 选项
   - 设置为 "允许"
2. 检查系统通知是否开启：
   - Windows: 设置 → 系统 → 通知
   - Mac: 系统偏好设置 → 通知
3. 打开控制面板，确保 "任务完成通知" 已勾选

### Q3: 点击特效太多，感觉卡顿？

**解决方法：**
1. 打开控制面板
2. 取消勾选 "点击特效"
3. 或者减少点击频率

### Q4: 如何更换角色图片？

**解决方法：**
1. 准备你的角色图片（PNG 或 GIF 格式）
2. 替换 ssets/images/characters.png 或 characters.gif
3. 重新加载扩展（扩展管理页面点击刷新图标）

### Q5: 如何修改主题颜色？

**解决方法：**
1. 用文本编辑器打开 src/styles.css
2. 找到 :root 部分
3. 修改颜色代码，例如：
   `css
   --aoqi-primary: #YOUR_COLOR;
   `
4. 保存文件
5. 重新加载扩展

### Q6: 插件与其他扩展冲突？

**解决方法：**
1. 尝试禁用其他可能冲突的扩展
2. 逐个启用，找出冲突的扩展
3. 在 GitHub Issues 中报告问题

### Q7: 如何卸载插件？

**Chrome 扩展版：**
1. 访问 chrome://extensions/
2. 找到 "奥奇传说主题美化插件"
3. 点击 "移除"

**Tampermonkey 版：**
1. 点击 Tampermonkey 图标
2. 选择 "管理面板"
3. 找到脚本，点击删除图标

## 高级配置

### 自定义配置选项

编辑 src/content.js 文件中的 CONFIG 对象：

`javascript
const CONFIG = {
  characters: ['小舞王', '小天', '小严', '阿瑞斯', '阿修', '小诺'],
  maxOutputLength: 100000,        // 最大输出长度
  notificationEnabled: true,      // 通知开关
  clickEffectsEnabled: true,      // 点击特效开关
  autoScrollEnabled: true         // 自动滚动开关
};
`

### 修改动画效果

编辑 src/styles.css 中的动画参数：

`css
/* 调整浮动速度 */
@keyframes float {
  /* 原来是 3s，改成 5s 会更慢 */
  animation-duration: 5s;
}

/* 调整粒子效果 */
@keyframes particleFloat {
  /* 调整飘动距离 */
  100% {
    transform: translateY(-150px); /* 原来是 -100px */
  }
}
`

### 添加自定义 CSS

在 src/styles.css 文件末尾添加你的自定义样式：

`css
/* 我的自定义样式 */
.my-custom-class {
  /* 你的样式 */
}
`

## 性能优化建议

1. **关闭不需要的功能**
   - 如果不需要点击特效，在控制面板中关闭

2. **减少动画效果**
   - 如果页面卡顿，可以注释掉部分动画

3. **定期清理缓存**
   - 定期清理浏览器缓存可提升性能

## 更新插件

### 自动更新（如果发布到 Chrome 网上应用店）
- 插件会自动更新到最新版本

### 手动更新
1. 从 GitHub 下载最新版本
2. 解压到原来的文件夹（覆盖）
3. 访问扩展管理页面
4. 点击插件的刷新图标

## 技术支持

如果遇到问题：

1. **查看文档**：先阅读 README.md
2. **搜索 Issues**：在 GitHub Issues 中搜索类似问题
3. **提交 Issue**：描述问题、提供截图、包含错误信息
4. **联系作者**：通过邮箱或 GitHub 联系

## 贡献代码

欢迎贡献代码！请参考 README.md 中的贡献指南。

---

**祝你使用愉快！ Enjoy coding with Aoqi! 🎮✨**
