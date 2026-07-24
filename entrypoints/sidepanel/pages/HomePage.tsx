import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Video as VideoIcon, ScanLine, ImageOff } from 'lucide-react';

interface HomePageProps {
  imageCount: number;
  videoCount: number;
  onScan: () => void;
}

export function HomePage({ imageCount, videoCount, onScan }: HomePageProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const isEmpty = imageCount === 0 && videoCount === 0;

  if (isEmpty) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="flex items-center justify-center size-14 rounded-full bg-muted text-muted-foreground">
          <ImageOff className="size-6" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{t('noEmojisFound')}</p>
          <p className="text-xs text-muted-foreground/70 max-w-[240px]">{t('noEmojisHint')}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onScan}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 overflow-y-auto">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary">
          <ScanLine className="size-8" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">{t('homeTitle')}</h2>
        <p className="text-xs text-muted-foreground/70 max-w-[220px]">{t('homeSubtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
        <button
          type="button"
          onClick={() => navigate('/images')}
          className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-left"
        >
          <ImageIcon className="size-5 text-primary" />
          <span className="text-sm font-medium text-foreground">{t('mediaImages')}</span>
          <span className="text-2xl font-bold text-foreground tabular-nums">{imageCount}</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/videos')}
          className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-left"
        >
          <VideoIcon className="size-5 text-primary" />
          <span className="text-sm font-medium text-foreground">{t('mediaVideos')}</span>
          <span className="text-2xl font-bold text-foreground tabular-nums">{videoCount}</span>
        </button>
      </div>

      <Button size="sm" onClick={onScan} className="mt-2">
        <ScanLine className="size-4" />
        {t('rescan')}
      </Button>
    </div>
  );
}