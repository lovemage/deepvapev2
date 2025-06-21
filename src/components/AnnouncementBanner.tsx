import React, { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, Gift } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAnnouncementStore } from '@/lib/store';
import { announcementsAPI } from '@/lib/api';
import { getAnnouncementStyle } from '@/lib/utils';

const AnnouncementBanner: React.FC = () => {
  const { announcements, setAnnouncements } = useAnnouncementStore();
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    loadAnnouncements();
    // 從本地存儲加載已關閉的公告
    const dismissed = localStorage.getItem('dismissed-announcements');
    if (dismissed) {
      setDismissedIds(JSON.parse(dismissed));
    }
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAnnouncements();
      setAnnouncements(response.data);
    } catch (error) {
      console.error('載入公告失敗:', error);
    }
  };

  const dismissAnnouncement = (id: number) => {
    const newDismissedIds = [...dismissedIds, id];
    setDismissedIds(newDismissedIds);
    localStorage.setItem('dismissed-announcements', JSON.stringify(newDismissedIds));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'promotion':
        return <Gift className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = (type: string): "default" | "destructive" => {
    return type === 'warning' ? 'destructive' : 'default';
  };

  const visibleAnnouncements = announcements.filter(
    (announcement) => !dismissedIds.includes(announcement.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {visibleAnnouncements.map((announcement) => (
        <Alert
          key={announcement.id}
          variant={getVariant(announcement.type)}
          className="relative pr-12"
        >
          {getIcon(announcement.type)}
          <AlertDescription className="pr-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium mb-1">{announcement.title}</div>
                <div className="text-sm opacity-90">{announcement.content}</div>
              </div>
            </div>
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => dismissAnnouncement(announcement.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  );
};

export default AnnouncementBanner;
