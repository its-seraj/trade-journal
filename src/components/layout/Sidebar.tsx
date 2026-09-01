'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpenCheck,
  History,
  AlertTriangle,
  Calendar,
  Layers,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();

  const mainNavItems: SidebarItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: "Today's Journal", href: '/dashboard/daily-review', icon: BookOpenCheck, highlight: true },
    { name: 'Journal History', href: '/dashboard/history', icon: History },
    { name: 'Mistakes', href: '/dashboard/mistakes', icon: AlertTriangle },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Trades', href: '/dashboard/trades', icon: Layers },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 min-h-screen flex flex-col justify-between p-4 select-none shrink-0">
      <div className="space-y-6">
        {/* Brand Logo & Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white font-mono">
              TRADING<span className="text-indigo-400">LOG</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">ACCOUNTABILITY</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
            Daily Workflow
          </div>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : item.highlight
                    ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/40 hover:text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Info */}
      <div className="pt-4 border-t border-slate-800/60 font-mono text-[11px] text-slate-400">
        <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300">Self-Use Journal</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
            Active
          </span>
        </div>
      </div>
    </aside>
  );
}
