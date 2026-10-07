'use client';

import { useEffect, useState } from 'react';
import { IoChevronBackOutline, IoCloseOutline, IoLeaf, IoMenuOutline } from 'react-icons/io5';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import SidebarNav from '@/components/sidebar-nav/sidebar-nav';
import LogoutButton from '@/components/logout-button/logout-button';

export function Sidebar({
  username,
  role,
  isAdmin,
}: {
  username: string;
  role: string;
  isAdmin: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setCollapsed(window.localStorage.getItem('agro-sidebar') === 'collapsed');
  }, []);

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  function toggle() {
    setCollapsed((current) => {
      window.localStorage.setItem('agro-sidebar', current ? 'expanded' : 'collapsed');
      return !current;
    });
  }

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border bg-surface p-3 md:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-label="Abrir menú"
          className="flex size-10 cursor-pointer items-center justify-center rounded-[2px] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IoMenuOutline aria-hidden size={22} />
        </button>
        <span className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
          <IoLeaf aria-hidden size={18} />
        </span>
        <p className="text-sm font-semibold tracking-tight">Agro</p>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            aria-hidden
            onClick={() => setDrawer(false)}
            className="absolute inset-0 cursor-pointer bg-foreground/20"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
                <IoLeaf aria-hidden size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-tight">Agro</p>
                <p className="truncate text-xs text-muted-foreground">Gestión agrícola</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Cerrar menú"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[2px] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IoCloseOutline aria-hidden size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarNav isAdmin={isAdmin} />
            </div>
            <div className="border-t border-border p-4">
              <p className="truncate text-sm font-medium">{username}</p>
              <p className="truncate text-xs text-muted-foreground">{role}</p>
              <div className="mt-2">
                <LogoutButton />
              </div>
            </div>
          </aside>
        </div>
      )}

      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 md:flex',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="flex items-center gap-2 border-b border-border p-4">
          {collapsed ? (
            <button
              type="button"
              onClick={toggle}
              aria-label="Expandir menú"
              title="Expandir"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[2px] bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <IoLeaf aria-hidden size={18} />
            </button>
          ) : (
            <>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-primary text-primary-foreground">
                <IoLeaf aria-hidden size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-tight">Agro</p>
                <p className="truncate text-xs text-muted-foreground">Gestión agrícola</p>
              </div>
              <button
                type="button"
                onClick={toggle}
                aria-label="Colapsar menú"
                aria-expanded="true"
                title="Colapsar"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[2px] hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IoChevronBackOutline aria-hidden size={18} />
              </button>
            </>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarNav isAdmin={isAdmin} collapsed={collapsed} />
        </div>
        <div className="border-t border-border p-4">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2 rounded-[2px] border border-border bg-background p-2">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-primary text-xs font-semibold text-primary-foreground"
                >
                  {username.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{username}</p>
                  <p className="truncate text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
              <div className="mt-2">
                <LogoutButton />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span
                aria-hidden
                title={`${username} · ${role}`}
                className="flex size-8 items-center justify-center rounded-[2px] bg-primary text-xs font-semibold text-primary-foreground"
              >
                {username.slice(0, 2).toUpperCase()}
              </span>
              <LogoutButton iconOnly />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
