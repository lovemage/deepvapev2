import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

const Captcha: React.FC<CaptchaProps> = ({ onVerify, className = '' }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成隨機驗證碼
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setIsValid(false);
    onVerify(false);
    return result;
  };

  // 繪製驗證碼到 Canvas
  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 設置背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 添加干擾線
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 70%)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // 繪製驗證碼文字
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = (canvas.width / text.length) * (i + 0.5);
      const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
      const angle = (Math.random() - 0.5) * 0.3;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 30%)`;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // 添加干擾點
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }
  };

  // 驗證用戶輸入
  const validateInput = (input: string) => {
    const valid = input.toUpperCase() === captchaText.toUpperCase();
    setIsValid(valid);
    onVerify(valid);
    return valid;
  };

  // 處理輸入變化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUserInput(value);
    if (value.length === captchaText.length) {
      validateInput(value);
    } else {
      setIsValid(false);
      onVerify(false);
    }
  };

  // 刷新驗證碼
  const refreshCaptcha = () => {
    const newText = generateCaptcha();
    setTimeout(() => drawCaptcha(newText), 0);
  };

  // 初始化
  useEffect(() => {
    const text = generateCaptcha();
    setTimeout(() => drawCaptcha(text), 0);
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      <Label htmlFor="captcha" className="flex items-center">
        <span className="text-red-500 mr-1">*</span>
        驗證碼
      </Label>
      
      <div className="flex items-center space-x-3">
        <canvas
          ref={canvasRef}
          width={120}
          height={40}
          className="border border-gray-300 rounded bg-gray-50"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={refreshCaptcha}
          className="flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <Input
        id="captcha"
        value={userInput}
        onChange={handleInputChange}
        placeholder="請輸入驗證碼"
        maxLength={5}
        className={`uppercase ${
          userInput.length === captchaText.length
            ? isValid
              ? 'border-green-500 focus:border-green-500'
              : 'border-red-500 focus:border-red-500'
            : ''
        }`}
        required
      />
      
      {userInput.length === captchaText.length && (
        <p className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
          {isValid ? '✓ 驗證碼正確' : '✗ 驗證碼錯誤，請重新輸入'}
        </p>
      )}
    </div>
  );
};

export default Captcha;
