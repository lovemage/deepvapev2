#!/usr/bin/env node

/**
 * Telegram Bot Chat ID 獲取工具
 * 使用方法：
 * 1. 替換 BOT_TOKEN 為您的實際 Bot Token
 * 2. 將 Bot 添加到目標群組
 * 3. 在群組中發送任意消息
 * 4. 運行此腳本：node get-telegram-chat-id.js
 */

const https = require('https');

// 請替換為您的實際 Bot Token
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';

if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.log('❌ 請先設置您的 Bot Token！');
    console.log('1. 在 Telegram 中找到 @BotFather');
    console.log('2. 發送 /newbot 創建新 Bot');
    console.log('3. 將獲得的 Token 替換到此腳本中');
    process.exit(1);
}

function getTelegramUpdates() {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
    
    https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                
                if (!response.ok) {
                    console.log('❌ API 請求失敗:', response.description);
                    return;
                }
                
                const updates = response.result;
                
                if (updates.length === 0) {
                    console.log('📭 沒有找到任何消息');
                    console.log('請確保：');
                    console.log('1. Bot 已添加到群組');
                    console.log('2. 在群組中發送了至少一條消息');
                    console.log('3. Bot 有接收消息的權限');
                    return;
                }
                
                console.log('🎉 找到以下聊天：\n');
                
                const chats = new Map();
                
                updates.forEach((update, index) => {
                    if (update.message && update.message.chat) {
                        const chat = update.message.chat;
                        const chatId = chat.id;
                        
                        if (!chats.has(chatId)) {
                            chats.set(chatId, {
                                id: chatId,
                                type: chat.type,
                                title: chat.title || chat.first_name || '私人聊天',
                                username: chat.username || '無用戶名'
                            });
                        }
                    }
                });
                
                chats.forEach((chat, chatId) => {
                    console.log(`📋 聊天信息：`);
                    console.log(`   Chat ID: ${chatId}`);
                    console.log(`   類型: ${chat.type}`);
                    console.log(`   名稱: ${chat.title}`);
                    if (chat.username !== '無用戶名') {
                        console.log(`   用戶名: @${chat.username}`);
                    }
                    console.log('');
                });
                
                console.log('💡 使用說明：');
                console.log('- 群組 Chat ID 通常是負數（如：-1001234567890）');
                console.log('- 私人聊天 Chat ID 是正數');
                console.log('- 將需要的 Chat ID 複製到您的系統設置中');
                
            } catch (error) {
                console.log('❌ 解析響應失敗:', error.message);
            }
        });
        
    }).on('error', (error) => {
        console.log('❌ 網絡請求失敗:', error.message);
    });
}

console.log('🔍 正在獲取 Telegram Chat ID...\n');
getTelegramUpdates();
