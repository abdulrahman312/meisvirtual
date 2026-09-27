import React, { useState } from 'react';
import { 
  ALL_GRADES, 
  ALL_SECTIONS, 
  POPULAR_SUBJECTS, 
  VirtualClass, 
  getClassStatus, 
  format12HourTime 
} from '../types';
import { 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Copy, 
  ExternalLink, 
  Lock, 
  Check, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  Video, 
  Sparkles, 
  RefreshCw, 
  AlertCircle,
  X,
  Layers,
  GraduationCap
} from 'lucide-react';
import { createClass, updateClass, deleteClass } from '../services/api';
import { SchoolLogo } from './SchoolLogo';

interface TeacherAdminPanelProps {
  classes: VirtualClass[];
  currentTime: Date;
  onRefresh: () => void;
  preselectedGrade?: string;
  preselectedSection?: string;
  onCloseAdmin?: () => void;
  loggedInTeacher?: { name: string; username: string } | null;
}

export const TeacherAdminPanel: React.FC<TeacherAdminPanelProps> = ({
  classes,
  currentTime,
  onRefresh,
  preselectedGrade,
  preselectedSection,
  onCloseAdmin,
  loggedInTeacher,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters for management view
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, live, upcoming, ended

  // Form state
  const todayStr = currentTime.toISOString().split('T')[0];
  const [formGrade, setFormGrade] = useState<string>(preselectedGrade || 'Grade 1');
  const [formSection, setFormSection] = useState<string>(preselectedSection || 'A');
  const [formSubject, setFormSubject] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [formTeacher, setFormTeacher] = useState<string>(loggedInTeacher?.name || '');
  const [formDate, setFormDate] = useState<string>(todayStr);
  const [formStartTime, setFormStartTime] = useState<string>('');
  const [formEndTime, setFormEndTime] = useState<string>('');
  const [formZoomUrl, setFormZoomUrl] = useState<string>('');
  const [formMeetingId, setFormMeetingId] = useState<string>('');
  const [formPasscode, setFormPasscode] = useState<string>('');
  const [formTopic, setFormTopic] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // Handle Zoom URL change - Meeting ID and Passcode remain strictly optional manual fields
  const handleZoomUrlChange = (url: string) => {
    setFormZoomUrl(url);
  };

  const handleOpenCreateModal = (presetGrade?: string, presetSec?: string) => {
    setEditingClassId(null);
    setFormGrade(presetGrade || preselectedGrade || 'Grade 1');
    setFormSection(presetSec || preselectedSection || 'A');
    setFormSubject('');
    setCustomSubject('');
    // Automatically enter teacher name from the online sheet
    setFormTeacher(loggedInTeacher?.name || '');
    setFormDate(todayStr);
    setFormStartTime('');
    setFormEndTime('');
    setFormZoomUrl('');
    setFormMeetingId('');
    setFormPasscode('');
    setFormTopic('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: VirtualClass) => {
    setEditingClassId(c.id);
    setFormGrade(c.grade);
    setFormSection(c.section);
    if (POPULAR_SUBJECTS.includes(c.subject)) {
      setFormSubject(c.subject);
      setCustomSubject('');
    } else {
      setFormSubject('Other');
      setCustomSubject(c.subject);
    }
    setFormTeacher(c.teacherName);
    setFormDate(c.date);
    setFormStartTime(c.startTime);
    setFormEndTime(c.endTime);
    setFormZoomUrl(c.zoomUrl);
    setFormMeetingId(c.meetingId || '');
    setFormPasscode(c.passcode || '');
    setFormTopic(c.topic || '');
    setFormNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleDuplicateClass = (c: VirtualClass) => {
    setEditingClassId(null);
    setFormGrade(c.grade);
    setFormSection(c.section);
    if (POPULAR_SUBJECTS.includes(c.subject)) {
      setFormSubject(c.subject);
      setCustomSubject('');
    } else {
      setFormSubject('Other');
      setCustomSubject(c.subject);
    }
    setFormTeacher(c.teacherName);
    setFormDate(c.date);
    setFormStartTime(c.startTime);
    setFormEndTime(c.endTime);
    setFormZoomUrl(c.zoomUrl);
    setFormMeetingId(c.meetingId || '');
    setFormPasscode(c.passcode || '');
    setFormTopic(c.topic ? `${c.topic} (Copy)` : '');
    setFormNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the scheduled class "${name}"?`)) {
      return;
    }

    try {
      await deleteClass(id);
      setFeedbackMsg({ type: 'success', text: `Class "${name}" deleted successfully.` });
      onRefresh();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to delete class.' });
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();

    const subjectToSave = formSubject === 'Other' ? customSubject.trim() : formSubject.trim();
    if (!subjectToSave) {
      alert('Please enter or select a subject.');
      return;
    }

    if (!formTeacher.trim()) {
      alert('Please enter the teacher name.');
      return;
    }

    if (!formZoomUrl.trim()) {
      alert('Please enter a valid Zoom or external video meeting link.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const payload = {
      grade: formGrade,
      section: formSection.toUpperCase(),
      subject: subjectToSave,
      teacherName: formTeacher.trim(),
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      zoomUrl: formZoomUrl.trim(),
      meetingId: formMeetingId.trim() || '',
      passcode: formPasscode.trim() || '',
      topic: formTopic.trim() || '',
      notes: formNotes.trim() || '',
    };

    try {
      if (editingClassId) {
        await updateClass(editingClassId, payload);
        setFeedbackMsg({ type: 'success', text: `Updated class for ${formGrade} - Sec ${formSection}` });
      } else {
        await createClass(payload);
        setFeedbackMsg({ type: 'success', text: `Published new class for ${formGrade} - Sec ${formSection}` });
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered classes for the table
  const filteredClasses = classes.filter((c) => {
    // Grade filter
    if (filterGrade !== 'all' && c.grade.toLowerCase() !== filterGrade.toLowerCase()) {
      return false;
    }
    // Section filter
    if (filterSection !== 'all' && c.section.toUpperCase() !== filterSection.toUpperCase()) {
      return false;
    }
    // Status filter
    const status = getClassStatus(c, currentTime);
    if (filterStatus !== 'all' && status.status !== filterStatus) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.subject.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q) ||
        c.grade.toLowerCase().includes(q) ||
        `section ${c.section}`.toLowerCase().includes(q) ||
        (c.topic && c.topic.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <SchoolLogo size="lg" showBackground={true} className="mt-1 hidden sm:flex" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                {loggedInTeacher ? `Teacher: ${loggedInTeacher.name}` : 'Faculty & Teacher Administration'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {loggedInTeacher ? `(${loggedInTeacher.username})` : 'Authenticated Session'}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 mt-2">
              Virtual Classroom Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create and schedule virtual Zoom classes for any Grade (KG 1–G12, Pure AP) and Section (A–Z). Completed classes lock automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Class</span>
          </button>
        </div>
      </div>



      {/* Feedback Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block">Total Database Classes</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {classes.length}
          </span>
        </div>

        <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-xs text-emerald-800 font-medium block">Live Right Now</span>
          <span className="text-2xl font-bold text-emerald-900 tabular-nums flex items-center gap-2">
            {classes.filter((c) => getClassStatus(c, currentTime).status === 'live').length}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </span>
        </div>

        <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 shadow-2xs">
          <span className="text-xs text-indigo-800 font-medium block">Upcoming Today</span>
          <span className="text-2xl font-bold text-indigo-900 tabular-nums">
            {classes.filter((c) => getClassStatus(c, currentTime).status === 'upcoming').length}
          </span>
        </div>

        <div className="bg-slate-100/70 p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-600 block">Concluded (Disabled)</span>
          <span className="text-2xl font-bold text-slate-700 tabular-nums">
            {classes.filter((c) => getClassStatus(c, currentTime).status === 'ended').length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, teacher, topic..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Grade filter */}
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-hidden"
            >
              <option value="all">All Grades</option>
              {ALL_GRADES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>

            {/* Section filter */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-hidden"
            >
              <option value="all">All Sections (A-Z)</option>
              {ALL_SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="live">● Live Now</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Concluded (Disabled)</option>
            </select>

            {(filterGrade !== 'all' || filterSection !== 'all' || filterStatus !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterGrade('all');
                  setFilterSection('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
                className="text-xs text-indigo-700 hover:underline px-1"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Classes Table / Cards */}
        <div className="overflow-x-auto pt-2">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No classes matching your filter criteria. Click "Upload New Class" to add one.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Grade & Sec</th>
                  <th className="py-2.5 px-3">Subject & Topic</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map((c) => {
                  const status = getClassStatus(c, currentTime);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{c.grade}</div>
                        <div className="text-indigo-700 font-medium">Sec {c.section}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{c.subject}</div>
                        {c.topic && (
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">
                            {c.topic}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700">
                        {c.teacherName}
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">
                          {c.date === todayStr ? 'Today' : c.date}
                        </div>
                        <div className="text-slate-500 text-[11px] tabular-nums">
                          {format12HourTime(c.startTime)} – {format12HourTime(c.endTime)}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            status.status === 'live'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status.status === 'upcoming'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {status.status === 'live' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          )}
                          {status.status === 'ended' && (
                            <Lock className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{status.statusLabel}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDuplicateClass(c)}
                            title="Duplicate Class"
                            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            title="Edit Class Details"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, `${c.grade} Sec ${c.section} ${c.subject}`)}
                            title="Delete Class"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE / EDIT CLASS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  <span>Faculty Class Uploader</span>
                </div>
                <h2 className="text-xl font-bold font-serif text-white mt-1">
                  {editingClassId ? 'Edit Virtual Class' : 'Upload New Virtual Class'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveClass} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Step 1 & 2: Grade and Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Grade *
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-100 outline-hidden"
                  >
                    {ALL_GRADES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Section (A to Z) *
                  </label>
                  <select
                    value={formSection}
                    onChange={(e) => setFormSection(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-100 outline-hidden"
                  >
                    {ALL_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject & Teacher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Subject Name *
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-hidden mb-2"
                  >
                    <option value="" disabled>Select Subject</option>
                    {POPULAR_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                    <option value="Other">Other (Custom Subject)</option>
                  </select>
                  {formSubject === 'Other' && (
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Type custom subject name..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white outline-hidden"
                      required
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider">
                      Teacher Name *
                    </label>
                    {loggedInTeacher?.name && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                        Auto-filled from Classera
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                    placeholder="Enter teacher name"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              {/* Date & Timings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Class Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs outline-hidden tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs outline-hidden tabular-nums"
                  />
                </div>

                <div className="sm:col-span-3 text-[11px] text-slate-400">
                  Note: Link locks automatically when End Time passes.
                </div>
              </div>

              {/* Zoom Link & Credentials */}
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Zoom Meeting Link or External URL *
                  </label>
                  <input
                    type="url"
                    value={formZoomUrl}
                    onChange={(e) => handleZoomUrlChange(e.target.value)}
                    placeholder="Paste Zoom meeting link or URL (https://zoom.us/...)"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white outline-hidden font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tip: Paste your Zoom or external video meeting link. Meeting ID and Passcode below are optional.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Meeting ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formMeetingId}
                      onChange={(e) => setFormMeetingId(e.target.value)}
                      placeholder="Enter meeting ID"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Passcode (Optional)
                    </label>
                    <input
                      type="text"
                      value={formPasscode}
                      onChange={(e) => setFormPasscode(e.target.value)}
                      placeholder="Enter passcode"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Topic & Notes */}
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Lesson Topic / Objective (Optional)
                </label>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Enter lesson topic or objective (optional)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Teacher Instructions for Students (Optional)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Enter instructions for students (optional)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs focus:bg-white outline-hidden"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingClassId ? 'Save Class Changes' : 'Publish Virtual Class'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
