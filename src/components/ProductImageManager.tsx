import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  MoveVertical, 
  Image as ImageIcon,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/api';

interface ProductImageManagerProps {
  images: Array<{ url: string; file?: File }>;
  onImagesChange: (images: Array<{ url: string; file?: File }>) => void;
  maxImages?: number;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  images,
  onImagesChange,
  maxImages = 3
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: '圖片數量限制',
        description: `每個產品最多只能上傳 ${maxImages} 張圖片`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const newImages = [...images];
      
      for (const file of Array.from(files)) {
        // 上傳圖片
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await uploadImage(formData);
        
        if (response.data.success) {
          newImages.push({
            url: response.data.filePath,
            file
          });
        }
      }

      onImagesChange(newImages);
      toast({ title: '圖片上傳成功！' });
    } catch (error: any) {
      console.error('圖片上傳失敗:', error);
      toast({
        title: '上傳失敗',
        description: error.response?.data?.message || '圖片上傳時發生錯誤',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          產品圖片 ({images.length}/{maxImages})
        </Label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                上傳中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                添加圖片
              </>
            )}
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {images.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 text-center mb-4">
              還沒有上傳圖片<br />
              點擊「添加圖片」按鈕開始上傳
            </p>
            <p className="text-xs text-gray-400 text-center">
              最多可上傳 {maxImages} 張圖片<br />
              第一張圖片將作為主圖顯示
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card
              key={index}
              className="relative group cursor-move"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <CardContent className="p-2">
                <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={image.url}
                    alt={`產品圖片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 主圖標記 */}
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                      <Star className="h-3 w-3 mr-1" />
                      主圖
                    </Badge>
                  )}

                  {/* 刪除按鈕 */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* 排序按鈕 */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveImage(index, index - 1)}
                        >
                          ←
                        </Button>
                      )}
                      {index < images.length - 1 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveImage(index, index + 1)}
                        >
                          →
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500">圖片 {index + 1}</p>
                  {index === 0 && (
                    <p className="text-xs text-yellow-600">主要展示圖片</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>提示：</strong> 
            第一張圖片為主圖，將在產品列表和詳情頁優先顯示。
            可以拖拽圖片或使用箭頭按鈕調整順序。
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager; 