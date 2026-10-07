'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IoBarChartOutline,
  IoCalendarOutline,
  IoFlowerOutline,
  IoGridOutline,
  IoLeafOutline,
  IoLinkOutline,
  IoMapOutline,
  IoPeopleOutline,
  IoScaleOutline,
} from 'react-icons/io5';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Panel', icon: IoGridOutline },
  { href: '/farms', label: 'Fincas', icon: IoLeafOutline },
  { href: '/plots', label: 'Parcelas', icon: IoMapOutline },
  { href: '/crop-types', label: 'Cultivos', icon: IoFlowerOutline },
  { href: '/assignments', label: 'Asignaciones', icon: IoLinkOutline },
  { href: '/campaigns', label: 'Campañas', icon: IoCalendarOutline },
  { href: '/production', label: 'Producción', icon: IoScaleOutline },
  { href: '/reports', label: 'Reportes', icon: IoBarChartOutline },
];

export default function SidebarNav({ isAdmin, collapsed = false }: { isAdmin: boolean; collapsed?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...NAV, { href: '/admin', label: 'Usuarios', icon: IoPeopleOutline }]
    : NAV;

  return (
    <nav aria-label="Principal" className="mt-4 flex flex-col gap-1 text-sm">
      {!collapsed && <p className="px-2 text-xs font-medium text-muted-foreground">Menú</p>}
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={cn(
              'flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[2px] px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              collapsed && 'justify-center px-0',
              active
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <Icon aria-hidden size={18} className="shrink-0" />
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}
