import React from 'react';
import { StudentRecord } from '../services/studentService';
import { UserCheck, Sparkles, LogOut, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';

interface StudentBannerProps {
  student: StudentRecord;
  currentActiveTab?: 'regular' | 'pure_ap';
  onSwitchTab?: (tab: 'regular' | 'pure_ap') => void;
  onLogoutStudent: () => void;
}

export const StudentBanner: React.FC<StudentBannerProps> = ({
  student,
  currentActiveTab = 'regular',
  onSwitchTab,
  onLogoutStudent,
}) => {
  const isGrade10 = student.grade.toLowerCase() === 'grade 10';
  const hasNoSection = student.section.toLowerCase() === 'no section' || !student.section;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Student info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-700 font-bold shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Verified Student
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {student.iqama}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {student.name}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Assigned to <span className="font-bold text-indigo-900">{student.grade}</span>
              {' · '}
              {hasNoSection ? (
                <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px]">
                  All Sections Available (No Section Assigned)
                </span>
              ) : (
                <span className="text-indigo-900 font-bold">Section {student.section}</span>
              )}
              {isGrade10 && (
                <span className="ml-2 text-purple-700 font-bold text-[11px] bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                  + Pure AP Eligible
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* For Grade 10: Toggle between Regular Section and Pure AP */}
          {isGrade10 && onSwitchTab && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onSwitchTab('regular')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentActiveTab === 'regular'
                    ? 'bg-white text-indigo-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grade 10 {hasNoSection ? '(All Sections)' : `(Sec ${student.section})`}
              </button>
              <button
                type="button"
                onClick={() => onSwitchTab('pure_ap')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentActiveTab === 'pure_ap'
                    ? 'bg-purple-700 text-white shadow-xs font-bold'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pure AP</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onLogoutStudent}
            title="Log out of student session"
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Student</span>
          </button>
        </div>
      </div>
    </div>
  );
};
