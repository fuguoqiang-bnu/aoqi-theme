// ==UserScript==
// @name         奥奇传说主题美化插件 for DeepSeek Harness
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  为 DeepSeek Harness 提供奥奇传说主题美化、点击特效、任务完成通知和输出优化功能
// @author       Your Name
// @match        *://*/*
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('🎮 奥奇传说主题插件（用户脚本版）已加载！');

    // 注入 CSS
    GM_addStyle(\
        /* 导入主题样式 */
        :root {
            --aoqi-primary: #4A90E2;
            --aoqi-secondary: #F5A623;
            --aoqi-accent: #7ED321;
            --aoqi-dark: #2C3E50;
            --aoqi-light: #ECF0F1;
            --aoqi-purple: #9B59B6;
            --aoqi-red: #E74C3C;
            --aoqi-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        body {
            background: var(--aoqi-gradient) !important;
            background-attachment: fixed !important;
        }

        .aoqi-character-decoration {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 120px;
            height: 120px;
            z-index: 9999;
            animation: float 3s ease-in-out infinite;
            pointer-events: none;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        .click-effect {
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            font-size: 30px;
            animation: particleFloat 1s ease-out forwards;
        }

        @keyframes particleFloat {
            0% {
                opacity: 1;
                transform: translateY(0) rotate(0deg);
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) rotate(360deg);
            }
        }
    \);

    // 配置
    const CONFIG = {
        characters: ['小舞王', '小天', '小严', '阿瑞斯', '阿修', '小诺'],
        notificationEnabled: GM_getValue('notifications', true),
        clickEffectsEnabled: GM_getValue('clickEffects', true),
        characterImageBase64: '' // 可以将图片转为 base64 嵌入
    };

    // 点击特效
    document.addEventListener('click', function(e) {
        if (!CONFIG.clickEffectsEnabled) return;
        
        const colors = ['#4A90E2', '#F5A623', '#7ED321', '#9B59B6', '#E74C3C'];
        const shapes = ['●', '★', '♥', '◆', '✦'];
        
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-effect';
            particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
            particle.style.cssText = \
                left: \px;
                top: \px;
                color: \;
            \;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    });

    // 任务完成通知
    function showNotification(title, message) {
        if (!CONFIG.notificationEnabled) return;
        
        GM_notification({
            title: title,
            text: message,
            timeout: 5000,
            onclick: () => window.focus()
        });
    }

    // 监听页面变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                // 检测任务完成
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.textContent.includes('完成')) {
                        showNotification('任务完成！', 'DeepSeek 已完成响应');
                    }
                });
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('✅ 奥奇传说主题插件初始化完成！');
})();
