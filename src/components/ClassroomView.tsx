import React, { useState } from 'react';
import { 
  VirtualClass, 
  getClassStatus, 
  format12HourTime 
} from '../types';
import { 
  ArrowLeft, 
  Video, 
  Clock, 
  User, 
  Copy, 
  Check, 
  ExternalLink, 
  Lock, 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  FileText, 
  PlusCircle, 
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';

interface ClassroomViewProps {
  gradeId: string;
  sectionLetter: string;
  onBackToSections: () => void;
  onBackToGrades: () => void;
  classes: VirtualClass[];
  currentTime: Date;
  isTeacherLoggedIn: boolean;
  onOpenCreateClass: (grade?: string, section?: string) => void;
  allowBackToGrades?: boolean;
  allowBackToSections?: boolean;
  isGrade10Student?: boolean;
}

export const ClassroomView: React.FC<ClassroomViewProps> = ({
  gradeId,
  sectionLetter,
  onBackToSections,
  onBackToGrades,
  classes,
  currentTime,
  isTeacherLoggedIn,
  onOpenCreateClass,
  allowBackToGrades = true,
  allowBackToSections = true,
  isGrade10Student = false,
}) => {
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all'); // 'today' | 'tomorrow' | 'all'
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<'all' | 'regular' | 'pure_ap'>('all');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isGrade10 = isGrade10Student || gradeId.toLowerCase() === 'grade 10';

  const todayStr = currentTime.toISOString().split('T')[0];
  const tomorrow = new Date(currentTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Filter classes for this grade and section (AND all Pure AP classes if Grade 10)
  const sectionClasses = classes.filter((c) => {
    const isPureAP = c.grade.toLowerCase() === 'pure ap' || c.grade.toLowerCase() === 'ap';

    // If Grade 10, include ALL Pure AP classes
    if (isGrade10 && isPureAP) {
      if (selectedProgramFilter === 'regular') return false;
      return true;
    }

    if (selectedProgramFilter === 'pure_ap') return false;

    return (
      (c.grade.toLowerCase() === gradeId.toLowerCase() ||
        c.grade.replace(/\s+/g, '').toLowerCase() === gradeId.replace(/\s+/g, '').toLowerCase()) &&
      c.section.toUpperCase() === sectionLetter.toUpperCase()
    );
  });

  const pureAPClassesCount = classes.filter(
    (c) => c.grade.toLowerCase() === 'pure ap' || c.grade.toLowerCase() === 'ap'
  ).length;

  // Apply date filter
  let displayedClasses = sectionClasses.filter((c) => {
    if (selectedDateFilter === 'today') return c.date === todayStr;
    if (selectedDateFilter === 'tomorrow') return c.date === tomorrowStr;
    return true;
  });

  // If student is viewing, hide finished/concluded classes (only show upcoming and live)
  if (!isTeacherLoggedIn) {
    displayedClasses = displayedClasses.filter((c) => {
      const status = getClassStatus(c, currentTime);
      return status.status !== 'ended';
    });
  }

  // Sort by date, then by startTime
  displayedClasses.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Stats for this section
  let liveNowCount = 0;
  let upcomingCount = 0;
  let endedCount = 0;

  sectionClasses.forEach((c) => {
    const status = getClassStatus(c, currentTime);
    if (status.status === 'live') liveNowCount++;
    else if (status.status === 'upcoming') upcomingCount++;
    else if (status.status === 'ended') endedCount++;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {allowBackToSections ? (
            <button
              onClick={onBackToSections}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sections</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
              <span>My Virtual Classroom</span>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          {allowBackToGrades && (
            <>
              <span className="cursor-pointer hover:underline" onClick={onBackToGrades}>
                All Grades
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </>
          )}
          {allowBackToSections ? (
            <span className="cursor-pointer hover:underline" onClick={onBackToSections}>
              {gradeId}
            </span>
          ) : (
            <span className="font-semibold text-slate-800">{gradeId}</span>
          )}
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-slate-900">Section {sectionLetter}</span>
        </div>
      </div>

      {/* Classroom Header Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded">
              {gradeId}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
              Section {sectionLetter}
            </span>
            {isGrade10 && (
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                + All Pure AP Classes
              </span>
            )}
            {liveNowCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{liveNowCount} Class Live Now</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 mt-2">
            Virtual Classroom Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access live Zoom meetings for your daily classes. Classes automatically lock and cannot be opened once their scheduled timings conclude.
          </p>
        </div>

        {/* Action / Teacher Add Button */}
        <div className="flex items-center gap-2 shrink-0">
          {isTeacherLoggedIn ? (
            <button
              onClick={() => onOpenCreateClass(gradeId, sectionLetter)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Class for Sec {sectionLetter}</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Scheduled</span>
              <span className="text-lg font-bold text-slate-800 tabular-nums">
                {sectionClasses.length} {sectionClasses.length === 1 ? 'Class' : 'Classes'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setSelectedDateFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedDateFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Classes ({sectionClasses.length})
          </button>
          <button
            onClick={() => setSelectedDateFilter('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedDateFilter === 'today'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setSelectedDateFilter('tomorrow')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              selectedDateFilter === 'tomorrow'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tomorrow
          </button>
        </div>

        {/* Program Filter Bar (for Grade 10: easily switch or see all Pure AP classes) */}
        {isGrade10 && (
          <div className="flex items-center gap-1.5 p-1 bg-purple-50/70 border border-purple-200/80 rounded-lg">
            <button
              onClick={() => setSelectedProgramFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedProgramFilter === 'all'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              All (Grade 10 + Pure AP)
            </button>
            <button
              onClick={() => setSelectedProgramFilter('regular')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedProgramFilter === 'regular'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sec {sectionLetter} Only
            </button>
            <button
              onClick={() => setSelectedProgramFilter('pure_ap')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedProgramFilter === 'pure_ap'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-purple-700 hover:bg-purple-100/70'
              }`}
            >
              Pure AP Only ({pureAPClassesCount})
            </button>
          </div>
        )}

        <div className="text-xs text-slate-500">
          Current time: <span className="font-semibold text-slate-700 tabular-nums">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      {/* Classes List */}
      {displayedClasses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-semibold text-slate-800">
              {!isTeacherLoggedIn
                ? `No live or upcoming classes right now for Section ${sectionLetter}`
                : `No classes currently scheduled for Section ${sectionLetter}`}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {!isTeacherLoggedIn
                ? 'Only upcoming and live classes are displayed to students. Concluded classes are automatically hidden.'
                : 'Your teachers have not uploaded any Zoom links for this section yet. Please check back shortly or select another section.'}
            </p>
          </div>
          {isTeacherLoggedIn && (
            <button
              onClick={() => onOpenCreateClass(gradeId, sectionLetter)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Class for {gradeId} - Sec {sectionLetter}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedClasses.map((c) => {
            const status = getClassStatus(c, currentTime);
            const isLive = status.status === 'live';
            const isEnded = status.status === 'ended';
            const isUpcoming = status.status === 'upcoming';

            return (
              <div
                key={c.id}
                className={`relative rounded-xl border p-5 sm:p-6 transition-all duration-200 ${
                  isLive
                    ? 'bg-white border-emerald-400 shadow-md ring-1 ring-emerald-400/30'
                    : isEnded
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Top Row: Subject & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                        {c.subject}
                      </span>
                      {(c.grade.toLowerCase() === 'pure ap' || c.grade.toLowerCase() === 'ap') && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Pure AP
                        </span>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.teacherName}</span>
                      </span>
                    </div>

                    {c.topic && (
                      <p className="text-xs sm:text-sm text-slate-700 font-medium flex items-baseline gap-1.5">
                        <span className="text-slate-400 text-xs font-normal">Topic:</span>
                        <span>{c.topic}</span>
                      </p>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isLive && (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          LIVE NOW
                        </span>
                        <span className="text-xs text-emerald-700 font-medium">
                          ({status.detail})
                        </span>
                      </div>
                    )}

                    {isUpcoming && (
                      <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-3 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">
                          {status.detail}
                        </span>
                      </div>
                    )}

                    {isEnded && (
                      <div className="flex items-center gap-1.5 bg-slate-200 text-slate-700 px-3 py-1 rounded-lg">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Class Concluded
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timing & Date info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Class Date</span>
                      <span className="font-semibold text-slate-800">
                        {c.date === todayStr ? 'Today' : c.date === tomorrowStr ? 'Tomorrow' : c.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Timing Duration</span>
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {format12HourTime(c.startTime)} – {format12HourTime(c.endTime)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Video className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Platform</span>
                      <span className="font-semibold text-slate-800">
                        {c.zoomUrl.includes('zoom') ? 'Zoom Video Meeting' : 'External Virtual Classroom'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Teacher Instructions & Meeting Credentials */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Credentials (Meeting ID / Passcode) */}
                  <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Room Credentials</span>
                      {isEnded && (
                        <span className="text-rose-600 font-medium flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Credentials Expired</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-500">Meeting ID:</span>
                      <div className="flex items-center gap-1.5 font-mono font-medium text-slate-800">
                        <span>{c.meetingId || 'Embedded in link'}</span>
                        {c.meetingId && (
                          <button
                            onClick={() => handleCopy(c.meetingId!, `id-${c.id}`)}
                            title="Copy Meeting ID"
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            {copiedField === `id-${c.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-500">Passcode:</span>
                      <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-800">
                        <span>{c.passcode || 'None required'}</span>
                        {c.passcode && (
                          <button
                            onClick={() => handleCopy(c.passcode!, `pass-${c.id}`)}
                            title="Copy Passcode"
                            className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            {copiedField === `pass-${c.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Teacher Notes */}
                  <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>Teacher Instructions</span>
                      </div>
                      <p className="text-xs text-slate-600 italic">
                        {c.notes || 'Please ensure your microphone is muted upon entering. Have your notebook and materials ready.'}
                      </p>
                    </div>
                    
                    {copiedField?.startsWith('link-') && (
                      <div className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Meeting URL copied to clipboard!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action Button (CRITICAL REQUIREMENT: Concluded class is disabled!) */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Status explanation */}
                  <div className="text-xs text-slate-500">
                    {isLive ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Classroom is active right now. Click below to enter Zoom.</span>
                      </span>
                    ) : isEnded ? (
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                        <span>This class concluded at {format12HourTime(c.endTime)}. Zoom link is permanently disabled.</span>
                      </span>
                    ) : (
                      <span className="text-indigo-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Scheduled to start at {format12HourTime(c.startTime)}.</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* If Ended: Strictly Disabled Button */}
                    {isEnded ? (
                      <button
                        disabled
                        aria-disabled="true"
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2 select-none border border-slate-300"
                        title="Class timing has finished. This link is disabled."
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Class Concluded · Access Closed</span>
                      </button>
                    ) : isLive ? (
                      /* If Live: Prominent Enter Zoom Button */
                      <>
                        <button
                          onClick={() => handleCopy(c.zoomUrl, `link-${c.id}`)}
                          className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                          title="Copy Zoom Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Copy Link</span>
                        </button>
                        <a
                          href={c.zoomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                        >
                          <Video className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform" />
                          <span>Enter Zoom Class Now</span>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                        </a>
                      </>
                    ) : (
                      /* Upcoming: Class Starts Later */
                      <>
                        <button
                          onClick={() => handleCopy(c.zoomUrl, `link-${c.id}`)}
                          className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                          title="Copy Link in Advance"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </button>
                        <a
                          href={c.zoomUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-indigo-900 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Early Room ({format12HourTime(c.startTime)})</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
