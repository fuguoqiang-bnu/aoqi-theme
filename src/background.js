// 奥奇传说主题插件 - 后台服务
console.log('🎮 奥奇传说主题插件后台服务已启动！');

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TASK_COMPLETED') {
    // 显示通知
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/images/characters.png',
      title: request.title || '任务完成！',
      message: request.message || 'DeepSeek 已完成你的请求',
      priority: 2
    });
  }
  
  if (request.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['notifications', 'clickEffects', 'autoScroll'], (data) => {
      sendResponse(data);
    });
    return true;
  }
  
  if (request.type === 'SAVE_SETTINGS') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 监听窗口焦点变化
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    console.log('窗口失去焦点');
  } else {
    console.log('窗口获得焦点');
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('页面加载完成:', tab.url);
  }
});
