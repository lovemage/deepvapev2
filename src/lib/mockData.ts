import { Product, CartItem, Coupon, Announcement } from './store';

// 30種口味
const flavors = [
  '草莓', '芒果', '薄荷', '煙草', '香草', '藍莓', '蘋果', '西瓜', '葡萄', '櫻桃',
  '檸檬', '橘子', '桃子', '椰子', '咖啡', '巧克力', '蜂蜜', '奶油', '玫瑰', '薰衣草',
  '青檸', '柚子', '荔枝', '龍眼', '榴蓮', '百香果', '奇異果', '鳳梨', '葡萄柚', '覆盆子'
];

// 顏色選項
const colors = ['黑色', '白色', '銀色', '藍色', '紅色', '金色'];

// 生成產品數據
const generateProducts = (): Product[] => {
  const products: Product[] = [];
  let productId = 1;

  // 主機產品（9個產品）
  const hostBrands = ['JUUL', 'IQOS', 'Vaporesso'];
  for (const brand of hostBrands) {
    for (let i = 0; i < 3; i++) {
      const colorSet = colors.slice(i * 2, i * 2 + 3);
      const productName = `${brand} 主機`;
      const price = 1500 + Math.random() * 1000;
      
      products.push({
        id: productId,
        name: productName,
        category: 'host',
        brand,
        price: Math.round(price),
        description: `${brand} 品牌主機，高品質電子煙設備，支持多種煙彈。`,
        image_url: `/images/hosts/${brand.toLowerCase()}-${i + 1}.jpg`,
        stock: 50 + Math.floor(Math.random() * 50),
        created_at: new Date().toISOString(),
        variants: colorSet.map((color, index) => ({
          id: productId * 10 + index,
          product_id: productId,
          variant_type: 'color',
          variant_value: color,
          stock: 20 + Math.floor(Math.random() * 30),
          price_modifier: index * 100
        }))
      });

      productId++;
    }
  }

  // 煙彈產品（90個產品）
  const cartridgeBrands = ['JUUL', 'IQOS', 'Vaporesso'];
  for (const brand of cartridgeBrands) {
    for (const flavor of flavors) {
      const productName = `${brand} ${flavor}煙彈`;
      const price = 300 + Math.random() * 200;
      
      products.push({
        id: productId,
        name: productName,
        category: 'cartridge',
        brand,
        price: Math.round(price),
        description: `${brand} ${flavor}口味煙彈，純正口感，適合${brand}主機使用。`,
        image_url: `/images/cartridges/${brand.toLowerCase()}-${flavor}.jpg`,
        stock: 30 + Math.floor(Math.random() * 70),
        created_at: new Date().toISOString(),
        variants: []
      });

      productId++;
    }
  }

  // 拋棄式電子煙產品（90個產品）
  const disposableBrands = ['Puff Bar', 'Hyde', 'Elf Bar'];
  for (const brand of disposableBrands) {
    for (const flavor of flavors) {
      const productName = `${brand} ${flavor}拋棄式電子煙`;
      const price = 200 + Math.random() * 150;
      
      products.push({
        id: productId,
        name: productName,
        category: 'disposable',
        brand,
        price: Math.round(price),
        description: `${brand} ${flavor}口味拋棄式電子煙，即開即用，攜帶方便。`,
        image_url: `/images/disposables/${brand.replace(' ', '').toLowerCase()}-${flavor}.jpg`,
        stock: 20 + Math.floor(Math.random() * 80),
        created_at: new Date().toISOString(),
        variants: []
      });

      productId++;
    }
  }

  return products;
};

// 生成分類數據
export const mockCategories = [
  { category: 'host', count: 9 },
  { category: 'cartridge', count: 90 },
  { category: 'disposable', count: 90 }
];

// 生成品牌數據
export const mockBrands = [
  { brand: 'JUUL', count: 33 },
  { brand: 'IQOS', count: 33 },
  { brand: 'Vaporesso', count: 33 },
  { brand: 'Puff Bar', count: 30 },
  { brand: 'Hyde', count: 30 },
  { brand: 'Elf Bar', count: 30 }
];

// 生成優惠券數據
export const mockCoupons: Coupon[] = [
  {
    id: 1,
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    min_amount: 500,
    expires_at: '2025-12-31 23:59:59',
    is_active: true
  },
  {
    id: 2,
    code: 'SAVE50',
    type: 'fixed',
    value: 50,
    min_amount: 1000,
    expires_at: '2025-12-31 23:59:59',
    is_active: true
  },
  {
    id: 3,
    code: 'NEWUSER20',
    type: 'percentage',
    value: 20,
    min_amount: 800,
    expires_at: '2025-12-31 23:59:59',
    is_active: true
  },
  {
    id: 4,
    code: 'SUMMER15',
    type: 'percentage',
    value: 15,
    min_amount: 600,
    expires_at: '2025-08-31 23:59:59',
    is_active: true
  }
];

// 生成公告數據
export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: '歡迎來到電子煙專賣店',
    content: '我們提供各種品牌的高品質電子煙產品，歡迎選購！',
    type: 'info',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: '新用戶優惠',
    content: '新用戶註冊即可獲得20%折扣優惠券，使用代碼：NEWUSER20',
    type: 'promotion',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: '健康提醒',
    content: '請注意：電子煙產品含有尼古丁，未成年人禁止使用。',
    type: 'warning',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

// 主要的產品數據
export const mockProducts = generateProducts();

// 搜索產品
export const searchProducts = (params: {
  category?: string;
  brand?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  let filtered = [...mockProducts];

  // 分類篩選
  if (params.category) {
    filtered = filtered.filter(p => p.category === params.category);
  }

  // 品牌篩選
  if (params.brand) {
    filtered = filtered.filter(p => p.brand === params.brand);
  }

  // 搜索篩選
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    );
  }

  // 分頁
  const page = params.page || 1;
  const limit = params.limit || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filtered.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total: filtered.length,
      pages: Math.ceil(filtered.length / limit)
    }
  };
};

// 根據ID獲取產品
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === parseInt(id));
};

// 驗證優惠券
export const validateCoupon = (code: string, amount: number) => {
  const coupon = mockCoupons.find(c => c.code === code && c.is_active);
  
  if (!coupon) {
    throw new Error('優惠碼不存在或已失效');
  }
  
  // 檢查是否過期
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    throw new Error('優惠碼已過期');
  }
  
  // 檢查最低消費金額
  if (amount < coupon.min_amount) {
    throw new Error(`訂單金額需滿 $${coupon.min_amount} 才能使用此優惠碼`);
  }
  
  // 計算折扣金額
  let discountAmount = 0;
  if (coupon.type === 'percentage') {
    discountAmount = Math.round((amount * coupon.value / 100) * 100) / 100;
  } else if (coupon.type === 'fixed') {
    discountAmount = coupon.value;
  }
  
  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_amount: coupon.min_amount
    },
    discountAmount,
    finalAmount: Math.max(0, amount - discountAmount)
  };
};
