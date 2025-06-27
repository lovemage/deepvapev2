import fetch from 'node-fetch';

const resetRailwayAdmin = async () => {
  console.log('🔄 重設 Railway 生產環境管理員帳戶...');
  
  try {
    // 調用我們的後端重設 API（如果存在）
    const response = await fetch('https://deepvape.org/api/admin/reset-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: 'deepvape-admin-reset-2024' // 安全密鑰
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Railway 管理員重設成功:', result.message);
    } else {
      console.log('❌ 重設失敗，回應狀態:', response.status);
      const error = await response.text();
      console.log('錯誤詳情:', error);
    }
  } catch (error) {
    console.error('❌ 連接錯誤:', error.message);
    console.log('📝 請手動在 Railway 控制台執行重設命令');
  }
};

resetRailwayAdmin(); 