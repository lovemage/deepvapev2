import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  MoveVertical, 
  Image as ImageIcon,
  Star,
  Plus,
  Link,
  FolderOpen,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getImages } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductImageManagerProps {
  images: Array<{ url: string; file?: File }>;
  onImagesChange: (images: Array<{ url: string; file?: File }>) => void;
  maxImages?: number;
}

interface ImageFile {
  name: string;
  path: string;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  images,
  onImagesChange,
  maxImages = 3
}) => {
  const { toast } = useToast();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  const [imageLibrary, setImageLibrary] = useState<ImageFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // 載入圖片庫
  const loadImageLibrary = async () => {
    setIsLoadingImages(true);
    try {
      const response = await getImages();
      if (response.success) {
        setImageLibrary(response.images || []);
      } else {
        toast({
          title: '載入圖片庫失敗',
          description: '無法載入圖片庫',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '載入圖片庫失敗',
        description: '請稍後再試',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingImages(false);
    }
  };

  // 過濾圖片庫
  const filteredImages = imageLibrary.filter(img => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: '請輸入圖片URL',
        description: '請輸入有效的圖片URL',
        variant: 'destructive'
      });
      return;
    }

    if (images.length >= maxImages) {
      toast({
        title: '圖片數量限制',
        description: `每個產品最多只能添加 ${maxImages} 張圖片`,
        variant: 'destructive'
      });
      return;
    }

    // 驗證URL格式 - 支持相對路徑和包含空格的URL
    const trimmedUrl = newImageUrl.trim();
    
    // 如果是相對路徑（以/開頭），直接接受
    if (trimmedUrl.startsWith('/')) {
      // 檢查是否包含有效的圖片擴展名
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const hasValidExtension = validExtensions.some(ext => 
        trimmedUrl.toLowerCase().includes(ext)
      );
      
      if (!hasValidExtension) {
        toast({
          title: '無效的圖片格式',
          description: '請輸入有效的圖片URL（支持jpg, jpeg, png, gif, webp, svg）',
          variant: 'destructive'
        });
        return;
      }
    } else {
      // 如果是完整URL，驗證格式
      try {
        new URL(trimmedUrl);
      } catch {
        toast({
          title: '無效的URL格式',
          description: '請輸入有效的圖片URL或相對路徑',
          variant: 'destructive'
        });
        return;
      }
    }

    const newImages = [...images, { url: trimmedUrl }];
    onImagesChange(newImages);
    setNewImageUrl('');
    toast({ title: '圖片添加成功！' });
  };

  const handleSelectFromLibrary = (image: ImageFile) => {
    if (images.length >= maxImages) {
      toast({
        title: '圖片數量限制',
        description: `每個產品最多只能添加 ${maxImages} 張圖片`,
        variant: 'destructive'
      });
      return;
    }

    const newImages = [...images, { url: image.path }];
    onImagesChange(newImages);
    setIsImageLibraryOpen(false);
    toast({ title: '圖片添加成功！' });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // 移除拖拽的項目
    newImages.splice(draggedIndex, 1);
    // 插入到新位置
    newImages.splice(dropIndex, 0, draggedImage);
    
    onImagesChange(newImages);
    setDraggedIndex(null);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const item = newImages.splice(fromIndex, 1)[0];
    newImages.splice(toIndex, 0, item);
    
    onImagesChange(newImages);
  };

  const getImageLabel = (index: number) => {
    if (index === 0) return '卡片主圖-原始';
    if (index === 1) return '產品詳細頁1';
    if (index === 2) return '產品詳細頁2';
    return `圖片 ${index + 1}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          產品圖片 ({images.length}/{maxImages})
        </Label>
        {images.length < maxImages && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="輸入圖片URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-48"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddImage}
            >
              <Plus className="mr-2 h-4 w-4" />
              添加
            </Button>
            <Dialog open={isImageLibraryOpen} onOpenChange={setIsImageLibraryOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadImageLibrary();
                    setIsImageLibraryOpen(true);
                  }}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  圖片庫
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>選擇圖片</DialogTitle>
                  <DialogDescription>
                    從圖片庫中選擇圖片添加到產品
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* 搜索框 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索圖片..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* 圖片列表 */}
                  <ScrollArea className="h-96">
                    {isLoadingImages ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">載入中...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.map((image) => (
                          <Card
                            key={image.name}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleSelectFromLibrary(image)}
                          >
                            <CardContent className="p-3">
                              <div className="aspect-square bg-gray-100 rounded-md overflow-hidden mb-2">
                                <img
                                  src={image.path}
                                  alt={image.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/placeholder.png';
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-600 truncate" title={image.name}>
                                {image.name}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                        {filteredImages.length === 0 && (
                          <div className="col-span-full text-center py-8 text-gray-500">
                            {searchQuery ? '沒有找到匹配的圖片' : '圖片庫為空'}
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    關閉
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* 圖片預覽列表 */}
      <div className="space-y-3">
        {images.map((image, index) => (
          <Card
            key={index}
            className="group relative"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {/* 圖片預覽 */}
                <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={image.url}
                    alt={`產品圖片 ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.png';
                    }}
                  />
                  
                  {/* 主圖標記 */}
                  {index === 0 && (
                    <Badge className="absolute top-1 left-1 bg-yellow-500 hover:bg-yellow-600 text-xs">
                      <Star className="h-2 w-2 mr-1" />
                      主圖
                    </Badge>
                  )}
                </div>

                {/* 圖片信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{getImageLabel(index)}</div>
                  <div className="text-xs text-gray-500 truncate">{image.url}</div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 排序按鈕 */}
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={index === 0}
                    >
                      <MoveVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* 刪除按鈕 */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 提示信息 */}
      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Link className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p className="text-sm">尚未添加任何圖片</p>
          <p className="text-xs text-gray-400 mt-1">請輸入圖片URL或從圖片庫中選擇圖片</p>
        </div>
      )}

      {/* 圖片說明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>圖片說明：</strong></p>
        <p>• 卡片主圖-原始：產品卡片顯示的主圖</p>
        <p>• 產品詳細頁1：產品詳情頁面的第一張圖片</p>
        <p>• 產品詳細頁2：產品詳情頁面的第二張圖片</p>
      </div>
    </div>
  );
};

export default ProductImageManager; 