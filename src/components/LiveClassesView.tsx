import React from 'react';
import { VirtualClass, getClassStatus, format12HourTime } from '../types';
import { 
  Radio, 
  Video, 
  ExternalLink, 
  Clock, 
  User, 
  ArrowLeft, 
  Copy, 
  Check, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface LiveClassesViewProps {
  classes: VirtualClass[];
  currentTime: Date;
  onSelectClassRoom: (grade: string, section: string) => void;
  onBackToGrades: () => void;
}

export const LiveClassesView: React.FC<LiveClassesViewProps> = ({
  classes,
  currentTime,
  onSelectClassRoom,
  onBackToGrades,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Filter only classes that are live right now
  const liveClasses = classes.filter((c) => {
    const status = getClassStatus(c, currentTime);
    return status.status === 'live';
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToGrades}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Grades</span>
        </button>

        <div className="text-xs text-slate-500">
          Showing classes in progress as of{' '}
          <span className="font-semibold text-slate-700 tabular-nums">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-xl p-6 border border-emerald-800 shadow-md">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Classrooms Broadcasting Now</span>
        </div>
        <h1 className="text-2xl font-bold font-serif text-white">
          Active Virtual Classrooms
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-xl">
          Students can click directly to enter their ongoing session. If your class is not listed here, navigate through Grades & Sections to check your schedule.
        </p>
      </div>

      {/* Live List */}
      {liveClasses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            No live classes in session right now
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Classes appear here during their active scheduled duration. Browse all grades and sections to view upcoming sessions.
          </p>
          <button
            onClick={onBackToGrades}
            className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
          >
            Browse Grades & Sections (A to Z)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveClasses.map((c) => {
            const status = getClassStatus(c, currentTime);
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-emerald-300 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ring-1 ring-emerald-400/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                        {c.grade}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        Sec {c.section}
                      </span>
                    </div>

                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>LIVE · {status.detail}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    {c.subject}
                  </h3>
                  
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.teacherName}</span>
                  </div>

                  {c.topic && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                      <span className="font-semibold text-slate-700">Topic: </span>
                      {c.topic}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="tabular-nums font-medium text-slate-700">
                        {format12HourTime(c.startTime)} – {format12HourTime(c.endTime)}
                      </span>
                    </div>

                    {c.passcode && (
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-slate-400">Passcode:</span>
                        <span className="font-bold text-slate-800">{c.passcode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectClassRoom(c.grade, c.section)}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                  >
                    <span>View Section {c.section} Schedule</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <a
                    href={c.zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow flex items-center gap-1.5 transition-all"
                  >
                    <Video className="w-3.5 h-3.5 text-emerald-100" />
                    <span>Join Zoom Now</span>
                    <ExternalLink className="w-3 h-3 text-emerald-200" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
