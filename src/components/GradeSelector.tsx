import React, { useState } from 'react';
import { 
  ALL_GRADES, 
  GradeDefinition, 
  SchoolStage, 
  VirtualClass, 
  getClassStatus 
} from '../types';
import { 
  Layers, 
  ChevronRight, 
  Users, 
  Video, 
  GraduationCap, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface GradeSelectorProps {
  onSelectGrade: (grade: string) => void;
  classes: VirtualClass[];
  currentTime: Date;
}

export const GradeSelector: React.FC<GradeSelectorProps> = ({
  onSelectGrade,
  classes,
  currentTime,
}) => {
  const [selectedStage, setSelectedStage] = useState<SchoolStage>('all');

  // Filter grades by category stage
  const filteredGrades = selectedStage === 'all'
    ? ALL_GRADES
    : ALL_GRADES.filter((g) => g.stage === selectedStage);

  // Group classes by grade to show active counters
  const getGradeStats = (gradeId: string) => {
    const gradeClasses = classes.filter((c) => c.grade.toLowerCase() === gradeId.toLowerCase());
    let liveCount = 0;
    let upcomingCount = 0;

    gradeClasses.forEach((c) => {
      const status = getClassStatus(c, currentTime);
      if (status.status === 'live') liveCount++;
      if (status.status === 'upcoming') upcomingCount++;
    });

    return {
      total: gradeClasses.length,
      liveCount,
      upcomingCount,
    };
  };

  const stageTabs: { id: SchoolStage; label: string; count: number }[] = [
    { id: 'all', label: 'All Grades', count: ALL_GRADES.length },
    { id: 'kindergarten', label: 'Kindergarten', count: 3 },
    { id: 'elementary', label: 'Elementary', count: 5 },
    { id: 'middle', label: 'Middle School', count: 3 },
    { id: 'high', label: 'High School', count: 5 },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Virtual Learning Portal · Academic Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight mb-2">
            Welcome to MEIS Live Classrooms
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Select your grade level below to find your section (A to Z) and join your teacher's live Zoom classroom. All classes adhere to the official school schedule.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live classes joinable immediately</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>Past classes automatically conclude</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>Sections A through Z for every grade</span>
            </div>
          </div>
        </div>

        {/* Official School Crest in Hero */}
        <div className="relative z-10 shrink-0 hidden sm:flex flex-col items-center justify-center p-4 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10 shadow-inner">
          <SchoolLogo size="xl" showBackground={true} className="shadow-lg" />
          <span className="text-[11px] font-semibold text-indigo-200 mt-2 tracking-wide uppercase">
            Official MEIS Portal
          </span>
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">
            Browse by Grade Level
          </h2>
          <p className="text-xs text-slate-500">
            Showing {filteredGrades.length} of {ALL_GRADES.length} grade levels
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-xl">
          {stageTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStage(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                selectedStage === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grades Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGrades.map((grade) => {
          const stats = getGradeStats(grade.id);
          const isKg = grade.stage === 'kindergarten';

          return (
            <div
              key={grade.id}
              onClick={() => onSelectGrade(grade.id)}
              className="group relative bg-white hover:bg-slate-50/80 rounded-xl p-5 border border-slate-200/90 hover:border-indigo-400/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                      isKg
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/80 group-hover:bg-rose-100'
                        : grade.stage === 'elementary'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200/80 group-hover:bg-amber-100'
                        : grade.stage === 'middle'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80 group-hover:bg-teal-100'
                        : grade.id === 'Pure AP'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200/80 group-hover:bg-purple-100'
                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200/80 group-hover:bg-indigo-100'
                    }`}>
                      {grade.id === 'Pure AP' ? 'AP' : grade.id.replace('Grade ', 'G')}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {grade.label}
                      </h3>
                      <p className="text-xs text-slate-500 capitalize">
                        {grade.id === 'Pure AP' ? 'Advanced Placement' : `${grade.stage} School`}
                      </p>
                    </div>
                  </div>

                  {stats.liveCount > 0 && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      {stats.liveCount} Live
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-1 mb-4">
                  {grade.description}
                </p>
              </div>

              {/* Card Footer / Section indicator */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Sections A to Z</span>
                  <span>·</span>
                  <span>
                    {stats.total === 0 ? 'No classes scheduled' : `${stats.total} class${stats.total === 1 ? '' : 'es'}`}
                  </span>
                </div>

                <span className="text-indigo-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                  <span>Enter</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
