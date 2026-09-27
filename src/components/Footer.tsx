import React from 'react';
import { Lock, GraduationCap, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface FooterProps {
  onOpenTeacherLogin: () => void;
  isTeacherLoggedIn: boolean;
  onOpenAdmin: () => void;
  onTeacherLogout: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenTeacherLogin,
  isTeacherLoggedIn,
  onOpenAdmin,
  onTeacherLogout,
}) => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Column 1: School Identity */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <SchoolLogo size="sm" showBackground={true} />
              <div>
                <span className="font-bold text-slate-900 font-serif text-sm block">
                  Middle East International School (MEIS)
                </span>
                <span className="text-[11px] text-indigo-700 font-medium">
                  Official Virtual Classroom Portal
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md">
              Official Virtual Classroom Management Portal. Supporting student-teacher engagement across Kindergarten through Grade 12 (Sections A–Z) with automated session management and real-time meeting access.
            </p>
            <div className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} MEIS Virtual Academy. All rights reserved.
            </div>
          </div>

          {/* Column 2: Guidelines */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Virtual Attendance Rules
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Classes automatically close after scheduled end time.</li>
              <li>• Keep camera enabled with school uniform attire.</li>
              <li>• Display full student name upon entering Zoom room.</li>
              <li>• Passcodes are unique to each class period.</li>
            </ul>
          </div>

          {/* Column 3: Teacher Portal & Technical Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Faculty & Staff
            </h4>

            {isTeacherLoggedIn ? (
              <div className="space-y-2 bg-indigo-50/70 p-3 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  <span>Teacher Mode Active</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onOpenAdmin}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded transition-colors"
                  >
                    Open Admin Panel
                  </button>
                  <button
                    onClick={onTeacherLogout}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-500 text-xs">
                  Authorized teachers can log in to upload and manage section Zoom links:
                </p>
                {/* Small admin access down in the footer */}
                <button
                  onClick={onOpenTeacherLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-800 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all shadow-2xs group"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span>Teacher & Admin Login</span>
                </button>
              </div>
            )}

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Need help? Contact IT at <span className="font-medium text-slate-600">admin@meis-school.edu</span></span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
