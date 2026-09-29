# 贡献指南 / Contributing Guide

感谢你考虑为奥奇传说主题插件做出贡献！

Thank you for considering contributing to the Aoqi Legend Theme Plugin!

## 🤝 如何贡献 / How to Contribute

### 报告 Bug / Reporting Bugs

如果你发现了 Bug，请：
1. 检查 [Issues](https://github.com/fuguoqiang-bnu/aoqi-legend-theme-plugin/issues) 确认问题未被报告
2. 创建新 Issue，包含：
   - 清晰的标题
   - 详细的问题描述
   - 复现步骤
   - 预期行为 vs 实际行为
   - 截图（如果适用）
   - 浏览器版本和操作系统

### 提出新功能 / Suggesting Features

如果你有好的想法：
1. 先在 Issues 中搜索类似建议
2. 创建 Feature Request，说明：
   - 功能描述
   - 使用场景
   - 为什么这个功能有用
   - 可能的实现方式（可选）

### 提交代码 / Submitting Code

#### 第一步：Fork 项目

1. 点击 GitHub 页面右上角的 "Fork" 按钮
2. Clone 你的 fork 到本地：
   `ash
   git clone https://github.com/YOUR_USERNAME/aoqi-legend-theme-plugin.git
   cd aoqi-legend-theme-plugin
   `

#### 第二步：创建分支

`ash
git checkout -b feature/amazing-feature
# 或
git checkout -b fix/bug-fix
`

分支命名规范：
- eature/ - 新功能
- ix/ - Bug 修复
- docs/ - 文档更新
- style/ - 代码格式化
- 
efactor/ - 代码重构
- 	est/ - 测试相关
- chore/ - 构建/工具链相关

#### 第三步：编写代码

遵循项目的编码规范：

**JavaScript 规范：**
`javascript
// 使用 2 空格缩进
// 使用单引号
// 函数名使用驼峰命名
function myFunction() {
  const myVariable = 'value';
  // ...
}

// 添加适当的注释
// 使用 ES6+ 语法
`

**CSS 规范：**
`css
/* 使用 2 空格缩进 */
/* 属性按字母排序 */
/* 使用有意义的类名 */
.aoqi-component {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
}
`

#### 第四步：测试

在提交前测试你的更改：
1. 在 Chrome 中加载扩展
2. 测试所有相关功能
3. 检查控制台是否有错误
4. 在不同浏览器中测试（如果可能）

#### 第五步：提交

`ash
git add .
git commit -m "feat: 添加新功能描述"
`

提交信息格式：
- eat: - 新功能
- ix: - Bug 修复
- docs: - 文档更新
- style: - 代码格式
- 
efactor: - 重构
- 	est: - 测试
- chore: - 构建/工具

示例：
`
feat: 添加暗黑模式支持
fix: 修复通知不弹出的问题
docs: 更新安装指南
style: 格式化 CSS 代码
`

#### 第六步：推送并创建 PR

`ash
git push origin feature/amazing-feature
`

然后在 GitHub 上创建 Pull Request：
1. 填写 PR 标题和描述
2. 关联相关 Issue（如果有）
3. 等待 Review

## 📝 代码规范 / Code Standards

### JavaScript

- 使用 ES6+ 语法
- 使用 const 和 let，避免 ar
- 使用箭头函数
- 使用模板字符串
- 添加适当的注释
- 函数保持简洁（<50 行）

### CSS

- 使用 CSS 变量
- 移动端优先（如果适用）
- 使用 flexbox/grid 布局
- 添加浏览器前缀（如需要）
- 保持样式模块化

### 文件组织

`
aoqi-legend-theme-plugin/
├── assets/          # 静态资源
├── src/            # 源代码
│   ├── content.js  # 内容脚本
│   ├── background.js # 后台脚本
│   └── styles.css  # 样式文件
├── docs/           # 文档（可选）
└── tests/          # 测试（可选）
`

## 🔍 审查流程 / Review Process

1. 提交 PR 后，维护者会进行审查
2. 可能会提出修改建议
3. 根据反馈修改代码
4. 审查通过后会被合并
5. 你的名字会被添加到贡献者列表

## 🎨 设计指南 / Design Guidelines

### 颜色使用

保持与奥奇传说主题一致：
`css
--aoqi-primary: #4A90E2;    /* 蓝色 */
--aoqi-secondary: #F5A623;  /* 橙色 */
--aoqi-accent: #7ED321;     /* 绿色 */
`

### 动画效果

- 使用 ease-in-out
- 保持流畅（避免卡顿）
- 提供关闭选项

### 用户体验

- 功能应该直观易用
- 提供清晰的反馈
- 避免干扰用户工作流
- 考虑性能影响

## 🐛 调试技巧 / Debugging Tips

1. **使用控制台**
   `javascript
   console.log('调试信息:', variable);
   console.error('错误信息:', error);
   `

2. **检查元素**
   - 按 F12 打开开发者工具
   - 使用 Elements 面板检查 DOM
   - 使用 Console 面板查看日志

3. **断点调试**
   - 在 Sources 面板设置断点
   - 单步执行代码
   - 检查变量值

4. **性能分析**
   - 使用 Performance 面板
   - 查找性能瓶颈
   - 优化慢速操作

## 📚 资源链接 / Resources

- [Chrome 扩展开发文档](https://developer.chrome.com/docs/extensions/)
- [MDN Web 文档](https://developer.mozilla.org/)
- [JavaScript 风格指南](https://github.com/airbnb/javascript)
- [Git 提交规范](https://www.conventionalcommits.org/)

## 🌟 贡献者 / Contributors

感谢所有贡献者！你们的名字会出现在这里：

<!-- 贡献者列表会自动更新 -->

## 💬 联系方式 / Contact

如有问题，可以通过以下方式联系：
- 创建 [GitHub Issue](https://github.com/fuguoqiang-bnu/aoqi-legend-theme-plugin/issues)
- 发送邮件至：your.email@example.com

## 📜 行为准则 / Code of Conduct

参与本项目即表示你同意遵守以下准则：

- 尊重所有贡献者
- 接受建设性批评
- 关注项目最佳利益
- 保持友好和专业
- 避免不当言论和行为

---

**再次感谢你的贡献！🎉**

**Thank you for your contribution! 🎉**
