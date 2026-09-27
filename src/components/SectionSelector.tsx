import React, { useState } from 'react';
import { ALL_SECTIONS, ALL_GRADES, VirtualClass, getClassStatus } from '../types';
import { 
  ArrowLeft, 
  Layers, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  Video,
  Clock
} from 'lucide-react';

interface SectionSelectorProps {
  gradeId: string;
  onBackToGrades: () => void;
  onSelectSection: (section: string) => void;
  classes: VirtualClass[];
  currentTime: Date;
  allowedSection?: string;
  allowBackToGrades?: boolean;
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({
  gradeId,
  onBackToGrades,
  onSelectSection,
  classes,
  currentTime,
  allowedSection,
  allowBackToGrades = true,
}) => {
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  const isRestrictedToSingleSection =
    allowedSection &&
    allowedSection.trim().toLowerCase() !== 'no section' &&
    allowedSection.trim() !== '';

  const gradeDef = ALL_GRADES.find(
    (g) =>
      g.id.toLowerCase() === gradeId.toLowerCase() ||
      g.id.replace(/\s+/g, '').toLowerCase() === gradeId.replace(/\s+/g, '').toLowerCase()
  ) || {
    id: gradeId,
    label: gradeId,
    description: gradeId,
    stage: 'general',
  };

  // Get all classes belonging to this grade
  const gradeClasses = classes.filter(
    (c) =>
      c.grade.toLowerCase() === gradeId.toLowerCase() ||
      c.grade.replace(/\s+/g, '').toLowerCase() === gradeId.replace(/\s+/g, '').toLowerCase()
  );

  // Helper to get stats for a particular section
  const getSectionStats = (sectionLetter: string) => {
    const sectionClasses = gradeClasses.filter(
      (c) => c.section.toUpperCase() === sectionLetter.toUpperCase()
    );

    let liveCount = 0;
    let upcomingCount = 0;
    let endedCount = 0;

    sectionClasses.forEach((c) => {
      const status = getClassStatus(c, currentTime);
      if (status.status === 'live') liveCount++;
      else if (status.status === 'upcoming') upcomingCount++;
      else if (status.status === 'ended') endedCount++;
    });

    return {
      classes: sectionClasses,
      total: sectionClasses.length,
      liveCount,
      upcomingCount,
      endedCount,
    };
  };

  // Filter sections if requested or restricted to single section
  const availableSections = isRestrictedToSingleSection
    ? [allowedSection!.trim().toUpperCase()]
    : ALL_SECTIONS;

  const sectionsToDisplay = filterActiveOnly
    ? availableSections.filter((letter) => getSectionStats(letter).total > 0)
    : availableSections;

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {allowBackToGrades ? (
          <button
            onClick={onBackToGrades}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Grades</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
            <span>Assigned Enrollment: {gradeDef.label}</span>
          </div>
        )}

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          {allowBackToGrades && (
            <>
              <span className="cursor-pointer hover:underline" onClick={onBackToGrades}>
                All Grades
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </>
          )}
          <span className="font-semibold text-slate-900">{gradeDef.label}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-indigo-700 font-medium">Select Section</span>
        </div>
      </div>

      {/* Grade Info Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              Grade Selection
            </span>
            <span className="text-xs text-slate-500">
              {gradeClasses.length} total scheduled class{gradeClasses.length === 1 ? '' : 'es'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 mt-1">
            {gradeDef.label} — Choose Your Section
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sections are organized from A to Z. Click on your assigned section to view active Zoom links and daily class schedules.
          </p>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg select-none">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={(e) => setFilterActiveOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span>Show only sections with classes</span>
          </label>
        </div>
      </div>

      {/* Section Grid (A to Z) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {sectionsToDisplay.map((letter) => {
          const stats = getSectionStats(letter);
          const hasClasses = stats.total > 0;
          const hasLive = stats.liveCount > 0;
          const hasUpcoming = stats.upcomingCount > 0;

          return (
            <button
              key={letter}
              onClick={() => onSelectSection(letter)}
              className={`group relative text-left p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between min-h-[110px] ${
                hasLive
                  ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-500 hover:shadow-md'
                  : hasClasses
                  ? 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                  : 'bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Header Letter */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Section
                  </span>
                  <span className={`text-2xl font-black font-serif tracking-tight ${
                    hasLive
                      ? 'text-emerald-950'
                      : hasClasses
                      ? 'text-indigo-950 group-hover:text-indigo-700'
                      : 'text-slate-800'
                  }`}>
                    {letter}
                  </span>
                </div>

                {hasLive && (
                  <span className="relative flex h-2.5 w-2.5 mt-1" title="Live class in progress">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                )}
              </div>

              {/* Status Info */}
              <div className="mt-2 text-[11px]">
                {hasLive ? (
                  <span className="font-semibold text-emerald-800 flex items-center gap-1">
                    <Video className="w-3 h-3 text-emerald-700" />
                    <span>{stats.liveCount} Live Now</span>
                  </span>
                ) : hasUpcoming ? (
                  <span className="font-medium text-indigo-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{stats.upcomingCount} Upcoming</span>
                  </span>
                ) : hasClasses ? (
                  <span className="text-slate-500">
                    {stats.total} scheduled
                  </span>
                ) : (
                  <span className="text-slate-400">
                    No classes
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {sectionsToDisplay.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-800">
            No sections have scheduled classes yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Uncheck the filter above to view all sections A to Z and check their timetable or add a new class.
          </p>
          <button
            onClick={() => setFilterActiveOnly(false)}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            Show All Sections (A to Z)
          </button>
        </div>
      )}
    </div>
  );
};
