import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Clock, 
  Search, 
  Radio, 
  Lock, 
  LogOut, 
  ChevronRight,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';
import { VirtualClass, getClassStatus } from '../types';
import { SchoolLogo } from './SchoolLogo';

interface HeaderProps {
  currentView: 'grades' | 'live' | 'admin';
  onNavigate: (view: 'grades' | 'live' | 'admin') => void;
  classes: VirtualClass[];
  currentTime: Date;
  isTeacherLoggedIn: boolean;
  onOpenTeacherLogin: () => void;
  onTeacherLogout: () => void;
  onSearchSelect?: (c: VirtualClass) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  classes,
  currentTime,
  isTeacherLoggedIn,
  onOpenTeacherLogin,
  onTeacherLogout,
  onSearchSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Calculate live classes count right now
  const liveClassesCount = classes.filter((c) => {
    const info = getClassStatus(c, currentTime);
    return info.status === 'live';
  }).length;

  // Filter classes matching query
  const filteredSearchResults = searchQuery.trim()
    ? classes
        .filter((c) => {
          const q = searchQuery.toLowerCase();
          return (
            c.subject.toLowerCase().includes(q) ||
            c.teacherName.toLowerCase().includes(q) ||
            c.grade.toLowerCase().includes(q) ||
            `section ${c.section}`.toLowerCase().includes(q) ||
            (c.topic && c.topic.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
    : [];

  // Formatted date and time
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Brand Zone */}
          <div 
            onClick={() => onNavigate('grades')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <SchoolLogo size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight font-serif group-hover:text-indigo-700 transition-colors">
                  MEIS
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                  Virtual Academy
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Middle East International School · Live Classes
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search subject, teacher, grade or section..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-lg border border-transparent focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick search dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div 
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setIsSearchOpen(false)}
              >
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Matching Classes ({filteredSearchResults.length})
                </div>
                {filteredSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No classes found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredSearchResults.map((cls) => {
                    const status = getClassStatus(cls, currentTime);
                    return (
                      <div
                        key={cls.id}
                        onClick={() => {
                          if (onSearchSelect) onSearchSelect(cls);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-sm text-slate-900 truncate">
                            {cls.subject}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="font-medium text-indigo-700">{cls.grade}</span>
                            <span>·</span>
                            <span>Sec {cls.section}</span>
                            <span>·</span>
                            <span>{cls.teacherName}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                              status.status === 'live'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status.status === 'upcoming'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {status.statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Navigation & Live Ticker */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Clock Display */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200/60">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="tabular-nums font-semibold text-slate-800">{formattedTime}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">{formattedDate}</span>
            </div>

            {/* Live Indicator Button */}
            <button
              onClick={() => onNavigate('live')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentView === 'live'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>{liveClassesCount} Live Now</span>
            </button>

            {/* View Grades Button */}
            <button
              onClick={() => onNavigate('grades')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentView === 'grades'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Grades & Sections
            </button>

            {/* Teacher Admin Switch */}
            {isTeacherLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView === 'admin'
                      ? 'bg-indigo-700 text-white shadow-sm'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Teacher Panel</span>
                </button>
                <button
                  onClick={onTeacherLogout}
                  title="Log out of Teacher Mode"
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenTeacherLogin}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Teacher / Admin Access"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Teachers</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
