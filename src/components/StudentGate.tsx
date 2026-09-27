import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { findStudentByIqama, StudentRecord } from '../services/studentService';
import { ShieldCheck, ArrowRight, AlertCircle, UserCheck } from 'lucide-react';

interface StudentGateProps {
  onStudentVerified: (student: StudentRecord) => void;
  onOpenTeacherLogin?: () => void;
}

export const StudentGate: React.FC<StudentGateProps> = ({
  onStudentVerified,
}) => {
  const [iqamaInput, setIqamaInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = iqamaInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your Student ID or Iqama number.');
      return;
    }

    setIsVerifying(true);

    try {
      const student = await findStudentByIqama(trimmed);
      setIsVerifying(false);

      if (student) {
        onStudentVerified(student);
      } else {
        setErrorMessage(
          `No student record found for ID / Iqama "${trimmed}". Please double check your number from school enrollment.`
        );
      }
    } catch {
      setIsVerifying(false);
      setErrorMessage('Verification service is temporarily unavailable. Please try again.');
    }
  };

  const handleQuickFill = async (sampleId: string) => {
    setIqamaInput(sampleId);
    setErrorMessage(null);
    setIsVerifying(true);
    try {
      const student = await findStudentByIqama(sampleId);
      setIsVerifying(false);
      if (student) {
        onStudentVerified(student);
      }
    } catch {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <SchoolLogo size="lg" showBackground={true} className="shadow-lg mb-3" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Student Access</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
              MEIS Virtual Classrooms
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
              Middle East International School Virtual Portal
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Student Identification Verification
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter your official Student ID or Iqama Number to access your assigned grade and section classes.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="studentIqama"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Student ID / Iqama Number *
              </label>
              <div className="relative">
                <input
                  id="studentIqama"
                  type="text"
                  inputMode="numeric"
                  value={iqamaInput}
                  onChange={(e) => {
                    setIqamaInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Enter 10-digit ID or Iqama (e.g. 2447960507)"
                  autoFocus
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-mono tracking-wider focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-hidden transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
                />
                {iqamaInput && (
                  <button
                    type="button"
                    onClick={() => setIqamaInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                The portal will match your assigned Grade and Section from school records.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !iqamaInput.trim()}
              className="w-full py-3 px-4 bg-indigo-700 hover:bg-indigo-800 active:bg-indigo-900 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Enrollment...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Access My Assigned Classrooms</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
