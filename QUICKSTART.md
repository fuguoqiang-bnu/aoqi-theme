# 🚀 快速开始指南

## 👋 欢迎使用奥奇传说主题插件！

这是一个为 DeepSeek Harness 设计的完整美化插件，包含点击特效、任务通知、输出优化等功能。

## 📋 开始前的准备

### ✅ 已完成的内容
- ✅ 完整的插件代码（content.js, background.js, styles.css）
- ✅ 详细的中英文文档（7 个文档文件）
- ✅ 奥奇角色图片（characters.png, characters.gif）
- ✅ Chrome 扩展配置（manifest.json）
- ✅ 用户脚本版本（aoqi-legend-userscript.js）
- ✅ 图标生成工具（icon-generator.html）

### ⚠️ 需要完成的步骤
- ⏳ 生成图标文件（使用 icon-generator.html）
- ⏳ 安装并测试插件
- ⏳ 上传到 GitHub（可选）
- ⏳ 修改个人信息（作者名、邮箱等）

---

## 🎯 三步快速安装

### 步骤 1️⃣：生成图标

1. 双击打开 icon-generator.html
2. 点击 "生成所有图标" 按钮
3. 分别点击每个尺寸的 "下载" 按钮
4. 将下载的图标重命名并覆盖 ssets/images/ 中的：
   - icon-16.png
   - icon-48.png
   - icon-128.png

### 步骤 2️⃣：安装到浏览器

**方式 A：Chrome 扩展（推荐）**

`
1. 打开 Chrome 浏览器
2. 地址栏输入：chrome://extensions/
3. 打开右上角 "开发者模式" 开关
4. 点击 "加载已解压的扩展程序"
5. 选择 aoqi-legend-theme-plugin 文件夹
6. 完成！
`

**方式 B：Tampermonkey 用户脚本**

`
1. 安装 Tampermonkey 扩展
2. 打开 Tampermonkey 管理面板
3. 点击 "+" 创建新脚本
4. 复制 aoqi-legend-userscript.js 的全部内容
5. 粘贴并保存
6. 确保脚本已启用
7. 完成！
`

### 步骤 3️⃣：测试效果

1. 打开 DeepSeek Harness 网页
2. 刷新页面（F5 或 Ctrl+R）
3. 观察效果：
   - ✨ 背景变成紫色渐变
   - 🐾 右下角出现奥奇角色
   - 🖱️ 点击页面产生粒子特效
   - 🔔 首次打开会请求通知权限（点击"允许"）

---

## 📖 详细文档

### 必读文档
- 📘 **README.md** - 完整功能说明（中文）
- 📕 **INSTALL_GUIDE.md** - 详细安装指南
- 📗 **SUMMARY.md** - 项目完成总结

### 参考文档
- 📙 **README_EN.md** - 英文文档
- 📓 **PROJECT_OVERVIEW.md** - 项目概览
- 📔 **CONTRIBUTING.md** - 贡献指南
- 📒 **CHANGELOG.md** - 版本历史

---

## 🎮 主要功能

### 1. 界面美化
- 紫色渐变背景
- 圆角卡片设计
- 流畅动画效果
- 自定义滚动条

### 2. 点击特效
- 多彩粒子效果
- 5 种随机形状
- 飘动旋转动画

### 3. 任务通知
- 系统通知
- 页面内通知
- 最小化提醒

### 4. 输出优化
- 移除长度限制
- 自动滚动
- 智能展开

### 5. 控制面板
- 功能开关
- 设置保存
- 实时生效

---

## 🔧 自定义配置

### 修改主题颜色
编辑 src/styles.css 第 3-11 行：
`css
:root {
  --aoqi-primary: #4A90E2;    /* 改成你喜欢的颜色 */
  --aoqi-secondary: #F5A623;  /* 改成你喜欢的颜色 */
  /* ... */
}
`

### 更换角色图片
1. 准备你的角色图片（PNG 或 GIF）
2. 重命名为 characters.png 或 characters.gif
3. 替换 ssets/images/ 中的文件
4. 在扩展管理页面点击刷新

### 修改角色列表
编辑 src/content.js 第 7 行：
`javascript
characters: ['小舞王', '小天', '小严', '阿瑞斯', '阿修', '小诺'],
`

---

## ❓ 常见问题

### Q: 安装后没有效果？
**A:** 刷新 DeepSeek Harness 页面（Ctrl+Shift+R 强制刷新）

### Q: 通知不弹出？
**A:** 检查浏览器通知权限：地址栏锁图标 → 通知 → 允许

### Q: 点击特效太多导致卡顿？
**A:** 打开控制面板（右下角），取消勾选"点击特效"

### Q: 如何卸载？
**A:** chrome://extensions/ → 找到插件 → 点击"移除"

---

## 📤 上传到 GitHub（可选）

`ash
# 1. 在 GitHub 创建新仓库
# 仓库名：aoqi-legend-theme-plugin

# 2. 在插件目录中初始化 Git
cd aoqi-legend-theme-plugin
git init

# 3. 添加文件
git add .

# 4. 提交
git commit -m "feat: 初始版本 - 奥奇传说主题插件"

# 5. 关联远程仓库（替换为你的地址）
git remote add origin https://github.com/你的用户名/aoqi-legend-theme-plugin.git

# 6. 推送
git branch -M main
git push -u origin main
`

---

## 🎯 下一步建议

### 立即可做
- ✅ 生成图标文件
- ✅ 安装测试插件
- ✅ 体验所有功能
- ✅ 调整个人偏好

### 进阶操作
- 📝 修改 README 中的个人信息
- 🎨 自定义主题颜色
- 🖼️ 更换角色图片
- 🌐 上传到 GitHub 分享

### 贡献项目
- 🐛 报告发现的 Bug
- 💡 提出新功能建议
- 📖 改进文档
- 🔧 提交代码改进

---

## 📞 获取帮助

- 📖 查看文档：README.md, INSTALL_GUIDE.md
- 🐛 报告问题：GitHub Issues
- 📧 邮件联系：your.email@example.com

---

## 🎉 完成！

恭喜你获得了一个功能完整的奥奇传说主题插件！

**主要特点：**
- ✅ 21 个文件，~4200 行代码和文档
- ✅ 完整的功能实现
- ✅ 详细的中英文文档
- ✅ 双版本支持（Chrome + Tampermonkey）
- ✅ 开箱即用，无需编译

**祝你使用愉快！🎮✨**

---

**快速开始 | Created on 2026-09-29 | Version 1.0.0**
