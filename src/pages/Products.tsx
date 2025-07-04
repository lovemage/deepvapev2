import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import ProductCard from '@/components/ProductCard';
import SEO, { createBreadcrumbStructuredData } from '@/components/SEO';
import { useProductStore } from '@/lib/store';
import { productsAPI } from '@/lib/api';
import { getCategoryName, debounce } from '@/lib/utils';

const Products: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    products,
    categories,
    brands,
    loading,
    totalPages,
    setProducts,
    setCategories,
    setBrands,
    setTotalPages,
    setLoading,
  } = useProductStore();

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedCategory = useMemo(() => searchParams.get('category') || '', [searchParams]);
  const selectedBrand = useMemo(() => searchParams.get('brand') || '', [searchParams]);
  const searchQuery = useMemo(() => searchParams.get('search') || '', [searchParams]);
  const currentPage = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const updateUrlParams = useCallback((newParams: Record<string, string | null>, resetPage = true) => {
    const currentParams = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    });
    // 只有在篩選條件改變時才重置頁面，分頁操作不重置
    // 檢查是否有篩選條件的變更（不包括 page 參數）
    const hasFilterChanges = Object.keys(newParams).some(key =>
      key !== 'page' && (key === 'category' || key === 'brand' || key === 'search')
    );

    if (resetPage && hasFilterChanges) {
      currentParams.set('page', '1');
    }
    navigate(`/products?${currentParams.toString()}`, { replace: true });
  }, [navigate, location.search]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        console.log('🔍 開始載入產品...', { category: selectedCategory, brand: selectedBrand, search: searchQuery, page: currentPage });
        const response = await productsAPI.getProducts({
          category: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          search: searchQuery || undefined,
          page: currentPage,
          limit: 12,
        });
        console.log('✅ 產品載入成功:', response.data);
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
      } catch (error: any) {
        console.error('❌ 載入產品失敗:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategory, selectedBrand, searchQuery, currentPage, setProducts, setTotalPages, setLoading]);

  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [catResponse, brandResponse] = await Promise.all([
          productsAPI.getCategories(),
          productsAPI.getBrands()
        ]);
        setCategories(catResponse.data);
        setBrands(brandResponse.data);
      } catch (error) {
        console.error('載入初始數據失敗:', error);
      }
    };
    loadStaticData();
  }, [setCategories, setBrands]);

  const debouncedSearch = useMemo(() => debounce((query: string) => {
    updateUrlParams({ search: query });
  }, 500), [updateUrlParams]);

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  const handleCategoryChange = (category: string) => {
    updateUrlParams({ category: selectedCategory === category ? null : category });
  };
  
  const handleBrandChange = (brand: string) => {
    updateUrlParams({ brand: selectedBrand === brand ? null : brand });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: page.toString() }, false); // 不重置頁面
  };

  const resetFilters = () => {
    setSearchInput('');
    setPriceRange([0, 5000]);
    navigate('/products', { replace: true });
  };

  const filteredProducts = products.filter(product => {
    return product.price >= priceRange[0] && product.price <= priceRange[1];
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">
          搜索商品
        </label>
        <Input
          type="search"
          placeholder="輸入商品名稱..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-3 block">
          商品分類
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={!selectedCategory}
              onCheckedChange={() => handleCategoryChange('')}
            />
            <label htmlFor="all-categories" className="text-sm">
              所有分類
            </label>
          </div>
          {categories.map((category) => (
            <div key={category.category} className="flex items-center space-x-2">
              <Checkbox
                id={category.category}
                checked={selectedCategory === category.category}
                onCheckedChange={() => handleCategoryChange(category.category)}
              />
              <label htmlFor={category.category} className="text-sm">
                {getCategoryName(category.category)} ({category.count})
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-3 block">
          品牌
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-brands"
              checked={!selectedBrand}
              onCheckedChange={() => handleBrandChange('')}
            />
            <label htmlFor="all-brands" className="text-sm">
              所有品牌
            </label>
          </div>
          {brands.map((brand) => (
            <div key={brand.brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand.brand}
                checked={selectedBrand === brand.brand}
                onCheckedChange={() => handleBrandChange(brand.brand)}
              />
              <label htmlFor={brand.brand} className="text-sm">
                {brand.brand} ({brand.count})
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900 mb-3 block">
          價格範圍
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="最低價"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="text-sm"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="最高價"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="text-sm"
            />
          </div>
          <div className="text-xs text-gray-500">
            ${priceRange[0]} - ${priceRange[1]}
          </div>
        </div>
      </div>

      <Button variant="outline" onClick={resetFilters} className="w-full">
        重置篩選
      </Button>
    </div>
  );

  const generateSEOContent = () => {
    let title = '商品列表';
    let description = '瀏覽 DeepVape 電子煙商城的所有商品';
    let keywords = '電子煙,電子煙商品,電子煙購買';

    if (selectedCategory) {
      const categoryName = getCategoryName(selectedCategory);
      title = `${categoryName} - 商品列表`;
      description = `瀏覽 DeepVape 的${categoryName}商品，提供優質的電子煙產品`;
      keywords += `,${categoryName}`;
    }

    if (selectedBrand) {
      title = selectedCategory
        ? `${selectedBrand} ${getCategoryName(selectedCategory)} - 商品列表`
        : `${selectedBrand} 商品 - 商品列表`;
      description = `瀏覽 ${selectedBrand} 品牌的電子煙產品，正品保證`;
      keywords += `,${selectedBrand}`;
    }

    if (searchQuery) {
      title = `"${searchQuery}" 搜索結果 - 商品列表`;
      description = `搜索 "${searchQuery}" 的相關電子煙產品`;
    }

    return { title, description, keywords };
  };

  const seoContent = generateSEOContent();
  const breadcrumbs = [
    { name: '首頁', url: '/' },
    { name: '商品列表', url: '/products' }
  ];

  if (selectedCategory) {
    breadcrumbs.push({
      name: getCategoryName(selectedCategory),
      url: `/products?category=${selectedCategory}`
    });
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <SEO
        title={seoContent.title}
        description={seoContent.description}
        keywords={seoContent.keywords}
        url={`/products${selectedCategory ? `?category=${selectedCategory}` : ''}${selectedBrand ? `${selectedCategory ? '&' : '?'}brand=${selectedBrand}` : ''}`}
        structuredData={createBreadcrumbStructuredData(breadcrumbs)}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">商品列表</h1>
          <p className="text-gray-600">
            找到 {sortedProducts.length} 個商品
            {selectedCategory && ` · ${getCategoryName(selectedCategory)}`}
            {selectedBrand && ` · ${selectedBrand}`}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">最新上架</SelectItem>
              <SelectItem value="price_asc">價格低到高</SelectItem>
              <SelectItem value="price_desc">價格高到低</SelectItem>
              <SelectItem value="name">名稱排序</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                篩選
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>篩選商品</SheetTitle>
                <SheetDescription>
                  使用篩選條件來找到您想要的商品
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5" />
                <h2 className="font-semibold">篩選商品</h2>
              </div>
              <FilterSidebar />
            </div>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                找不到商品
              </h3>
              <p className="text-gray-600 mb-6">
                請嘗試調整篩選條件或搜索關鍵字
              </p>
              <Button onClick={resetFilters}>
                重置篩選條件
              </Button>
            </div>
          ) : (
            <>
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      上一頁
                    </Button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      下一頁
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
