// 奥奇传说主题插件 - 主功能脚本
// 说明：本文件由 DSH 适配时修复——原文件的模板字符串被破坏成了 `\ ... \`，
//       导致语法错误（`= \` 直接是非法 JS），在 Chrome 和 DSH 里都无法运行。
//       现在逻辑与结构完全保持原样，仅恢复模板字符串与缺失的局部变量。
(function() {
  'use strict';

  console.log('🎮 奥奇传说主题插件已加载！');

  // ==================== 配置 ====================
  const CONFIG = {
    characters: ['小舞王', '小天', '小严', '阿瑞斯', '阿修', '小诺'],
    maxOutputLength: 100000, // 最大输出长度优化
    notificationEnabled: true,
    clickEffectsEnabled: true,
    autoScrollEnabled: true
  };

  // 资源地址：Chrome 扩展里走 chrome.runtime.getURL，DSH 里走宿主的 /aoqi 路由
  function assetUrl(relative) {
    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.getURL === 'function') {
      return chrome.runtime.getURL(relative);
    }
    return '/aoqi/' + relative;
  }

  // ==================== 点击特效 ====================
  function createClickEffect(e) {
    if (!CONFIG.clickEffectsEnabled) return;

    const colors = ['#4A90E2', '#F5A623', '#7ED321', '#9B59B6', '#E74C3C'];
    const shapes = ['●', '★', '♥', '◆', '✦'];

    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 16 + Math.floor(Math.random() * 14);
      particle.className = 'click-effect';
      particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      particle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        color: ${color};
        font-size: ${size}px;
        pointer-events: none;
        z-index: 10000;
        animation: particleFloat 1s ease-out forwards;
        transform: translate(-50%, -50%);
      `;

      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 1000);
    }
  }

  // 添加粒子动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) translateY(0) rotate(0deg);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) translateY(-100px) rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);

  // 监听点击事件
  document.addEventListener('click', createClickEffect);

  // ==================== 奥奇角色装饰 ====================
  function addCharacterDecoration() {
    const decoration = document.createElement('div');
    decoration.className = 'aoqi-character-decoration';
    decoration.title = CONFIG.characters[Math.floor(Math.random() * CONFIG.characters.length)] + ' 陪你一起工作！';
    decoration.style.backgroundImage = `url("${assetUrl('assets/images/characters.gif')}")`;
    document.body.appendChild(decoration);

    // 点击角色切换
    decoration.addEventListener('click', function() {
      this.style.animation = 'none';
      setTimeout(() => {
        this.style.animation = 'float 3s ease-in-out infinite';
      }, 10);
    });
  }

  // ==================== 任务完成通知 ====================
  function showNotification(title, message, character) {
    if (!CONFIG.notificationEnabled) return;

    // 检查通知权限
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        createNotification(title, message, character);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            createNotification(title, message, character);
          }
        });
      }
    }

    // 创建页面内通知
    createInPageNotification(title, message, character);
  }

  function createNotification(title, message, character) {
    const notification = new Notification(title, {
      body: message,
      icon: assetUrl('assets/images/characters.png'),
      tag: 'aoqi-notification',
      requireInteraction: false
    });

    notification.onclick = function() {
      window.focus();
      notification.close();
    };
  }

  function createInPageNotification(title, message, character) {
    const notification = document.createElement('div');
    notification.className = 'aoqi-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        max-width: 400px;
        animation: slideIn 0.5s ease, slideOut 0.5s ease 4.5s;
      ">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
          🎉 ${title}
        </div>
        <div style="font-size: 14px; opacity: 0.9;">
          ${message}
        </div>
        <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">
          —— ${character}
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // 添加动画
    const notifStyle = document.createElement('style');
    notifStyle.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(500px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(500px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(notifStyle);

    setTimeout(() => notification.remove(), 5000);
  }

  // ==================== 监听任务完成 ====================
  function monitorTaskCompletion() {
    // 监听 AI 响应完成
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // 检查是否是 AI 完成响应的标志
              if (node.classList && (
                node.classList.contains('message-complete') ||
                node.classList.contains('assistant-message') ||
                node.classList.contains('response-complete')
              )) {
                showNotification(
                  '任务完成！',
                  'DeepSeek 已经完成了你的请求，快来查看吧！',
                  CONFIG.characters[Math.floor(Math.random() * CONFIG.characters.length)]
                );
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ==================== 输出长度优化 ====================
  function optimizeOutput() {
    // 查找所有可能的输出区域
    const outputSelectors = [
      '.output',
      '.response',
      '.message-content',
      '.chat-message',
      'pre',
      'code'
    ];

    outputSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.dataset && element.dataset.aoqiOptimized === '1') return;
        // 移除输出长度限制
        element.style.maxHeight = 'none';
        element.style.overflow = 'auto';

        // 添加"显示更多"功能
        if (element.scrollHeight > 1000 && !element.querySelector('.show-more-btn')) {
          const showMoreBtn = document.createElement('button');
          showMoreBtn.className = 'show-more-btn';
          showMoreBtn.textContent = '显示完整内容';
          showMoreBtn.style.cssText = `
            margin-top: 10px;
            padding: 8px 20px;
            background: linear-gradient(135deg, #4A90E2, #F5A623);
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
          `;

          showMoreBtn.addEventListener('click', function() {
            element.style.maxHeight = 'none';
            this.style.display = 'none';
          });

          element.parentNode.insertBefore(showMoreBtn, element.nextSibling);
        }
        if (element.dataset) element.dataset.aoqiOptimized = '1';
      });
    });
  }

  // ==================== 页面最小化检测 ====================
  let wasMinimized = false;
  let hasNewContent = false;

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      wasMinimized = true;
      hasNewContent = false;
    } else {
      if (wasMinimized && hasNewContent) {
        showNotification(
          '欢迎回来！',
          '在你离开的时候有新的响应完成了！',
          CONFIG.characters[0]
        );
        hasNewContent = false;
      }
      wasMinimized = false;
    }
  });

  // 监听新内容
  const contentObserver = new MutationObserver(() => {
    if (wasMinimized) {
      hasNewContent = true;
    }
  });

  contentObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // ==================== 自动滚动到底部 ====================
  function autoScrollToBottom() {
    if (!CONFIG.autoScrollEnabled) return;

    const scrollableElements = document.querySelectorAll('.chat-container, .message-container, .conversation');
    scrollableElements.forEach(element => {
      element.scrollTop = element.scrollHeight;
    });
  }

  // ==================== 添加控制面板 ====================
  function createControlPanel() {
    const panel = document.createElement('div');
    panel.className = 'aoqi-control-panel';
    panel.innerHTML = `
      <div style="
        position: fixed;
        bottom: 160px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        z-index: 9998;
        min-width: 250px;
      ">
        <h3 style="margin: 0 0 15px 0; color: #4A90E2; font-size: 16px;">🎮 奥奇传说设置</h3>
        <label style="display: block; margin-bottom: 10px; cursor: pointer;">
          <input type="checkbox" id="aoqi-notifications" ${CONFIG.notificationEnabled ? 'checked' : ''}> 
          任务完成通知
        </label>
        <label style="display: block; margin-bottom: 10px; cursor: pointer;">
          <input type="checkbox" id="aoqi-click-effects" ${CONFIG.clickEffectsEnabled ? 'checked' : ''}> 
          点击特效
        </label>
        <label style="display: block; margin-bottom: 10px; cursor: pointer;">
          <input type="checkbox" id="aoqi-auto-scroll" ${CONFIG.autoScrollEnabled ? 'checked' : ''}> 
          自动滚动
        </label>
        <button id="aoqi-close-panel" style="
          margin-top: 10px;
          padding: 8px 20px;
          background: #E74C3C;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          width: 100%;
        ">关闭面板</button>
      </div>
    `;

    document.body.appendChild(panel);

    // 绑定事件
    document.getElementById('aoqi-notifications').addEventListener('change', function() {
      CONFIG.notificationEnabled = this.checked;
      localStorage.setItem('aoqi-notifications', this.checked);
    });

    document.getElementById('aoqi-click-effects').addEventListener('change', function() {
      CONFIG.clickEffectsEnabled = this.checked;
      localStorage.setItem('aoqi-click-effects', this.checked);
    });

    document.getElementById('aoqi-auto-scroll').addEventListener('change', function() {
      CONFIG.autoScrollEnabled = this.checked;
      localStorage.setItem('aoqi-auto-scroll', this.checked);
    });

    document.getElementById('aoqi-close-panel').addEventListener('click', function() {
      panel.style.display = 'none';
    });
  }

  // ==================== 加载保存的设置 ====================
  function loadSettings() {
    const notifications = localStorage.getItem('aoqi-notifications');
    const clickEffects = localStorage.getItem('aoqi-click-effects');
    const autoScroll = localStorage.getItem('aoqi-auto-scroll');

    if (notifications !== null) CONFIG.notificationEnabled = notifications === 'true';
    if (clickEffects !== null) CONFIG.clickEffectsEnabled = clickEffects === 'true';
    if (autoScroll !== null) CONFIG.autoScrollEnabled = autoScroll === 'true';
  }

  // ==================== 初始化 ====================
  function init() {
    loadSettings();

    // 延迟执行，确保页面加载完成
    setTimeout(() => {
      addCharacterDecoration();
      monitorTaskCompletion();
      optimizeOutput();
      createControlPanel();

      // 请求通知权限
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // 显示欢迎通知
      showNotification(
        '奥奇传说主题已激活！',
        '所有功能已就绪，祝你使用愉快！',
        CONFIG.characters[0]
      );

      console.log('✅ 奥奇传说主题插件初始化完成！');
    }, 1000);

    // 定期检查输出优化
    setInterval(optimizeOutput, 2000);

    // 定期自动滚动
    setInterval(autoScrollToBottom, 1000);
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露给 DSH 适配层，便于验证与手动触发
  window.__AOQI_THEME__ = {
    CONFIG: CONFIG,
    showNotification: showNotification,
    optimizeOutput: optimizeOutput,
  };

})();
