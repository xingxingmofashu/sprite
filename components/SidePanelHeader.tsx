import { NavLink, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

interface SidePanelHeaderProps {
  imageCount: number;
  videoCount: number;
}

const LINKS = [
  { to: '/', labelKey: 'mediaHome' },
  { to: '/images', labelKey: 'mediaImages', countKey: 'imageCount' as const },
  { to: '/videos', labelKey: 'mediaVideos', countKey: 'videoCount' as const },
];

/** Header bar with title and media-type navigation (synced with router) */
export function SidePanelHeader({ imageCount, videoCount }: SidePanelHeaderProps) {
  const { t } = useI18n();
  const location = useLocation();
  const counts = { imageCount, videoCount };

  return (
    <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
      <h1 className="text-base font-bold text-foreground truncate">{t('extName')}</h1>

      <NavigationMenu>
        <NavigationMenuList className="gap-0.5">
          {LINKS.map(({ to, labelKey, countKey }) => {
            const count = countKey ? counts[countKey] : null;
            const isActive = location.pathname === to;
            return (
              <NavigationMenuItem key={to}>
                <NavigationMenuLink
                  render={<NavLink to={to} end />}
                  className={cn(
                    'gap-1.5 rounded-md px-2 py-1 text-xs font-medium',
                    isActive && 'bg-muted text-foreground',
                  )}
                >
                  {t(labelKey)}
                  {count !== null && (
                    <span className="text-[10px] text-muted-foreground/70">{count}</span>
                  )}
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}