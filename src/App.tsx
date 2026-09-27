import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { GradeSelector } from './components/GradeSelector';
import { SectionSelector } from './components/SectionSelector';
import { ClassroomView } from './components/ClassroomView';
import { LiveClassesView } from './components/LiveClassesView';
import { TeacherAdminPanel } from './components/TeacherAdminPanel';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { StudentGate } from './components/StudentGate';
import { StudentBanner } from './components/StudentBanner';
import { Footer } from './components/Footer';
import { VirtualClass, getClassStatus } from './types';
import { fetchClasses, subscribeToClasses } from './services/api';
import { 
  getStoredStudent, 
  storeStudent, 
  clearStoredStudent, 
  StudentRecord 
} from './services/studentService';
import {
  getStoredTeacher,
  storeTeacher,
  clearStoredTeacher,
  TeacherRecord,
} from './services/teacherService';

export default function App() {
  const [classes, setClasses] = useState<VirtualClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Student authentication state - always starts at the ID entry form
  const [currentStudent, setCurrentStudent] = useState<StudentRecord | null>(null);
  const [grade10Tab, setGrade10Tab] = useState<'regular' | 'pure_ap'>('regular');

  // Teacher authentication state
  const [loggedInTeacher, setLoggedInTeacher] = useState<TeacherRecord | null>(() => getStoredTeacher());
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => Boolean(getStoredTeacher()));
  const [isTeacherAuthModalOpen, setIsTeacherAuthModalOpen] = useState(false);
  const [teacherName, setTeacherName] = useState<string>(() => getStoredTeacher()?.name || 'Faculty Member');

  // Navigation view state
  const [currentView, setCurrentView] = useState<'grades' | 'live' | 'admin'>(() => {
    return getStoredTeacher() ? 'admin' : 'grades';
  });
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToClasses(
      (updatedClasses) => {
        setClasses(updatedClasses);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Real-time listener notice:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadClasses = useCallback(async () => {
    try {
      const data = await fetchClasses();
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  }, []);

  // Real-time clock update (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute authorized classes for currently authenticated viewer
  const authorizedClasses = useMemo(() => {
    if (isTeacherLoggedIn || !currentStudent) {
      return classes;
    }
    const isGrade10 = currentStudent.grade.toLowerCase() === 'grade 10';
    const hasNoSection = currentStudent.section.toLowerCase() === 'no section' || !currentStudent.section;

    return classes.filter((c) => {
      // Finished classes should not be displayed to students - only upcoming and live classes
      const status = getClassStatus(c, currentTime);
      if (status.status === 'ended') {
        return false;
      }

      // Grade 10 students can see their grade 10 classes + all Pure AP classes
      if (isGrade10 && (c.grade.toLowerCase() === 'pure ap' || c.grade.toLowerCase() === 'grade 10')) {
        if (c.grade.toLowerCase() === 'pure ap') return true;
        if (hasNoSection) return true;
        return c.section.toUpperCase() === currentStudent.section.toUpperCase();
      }

      const matchesGrade = c.grade.toLowerCase() === currentStudent.grade.toLowerCase();
      if (!matchesGrade) return false;

      if (hasNoSection) return true;
      return c.section.toUpperCase() === currentStudent.section.toUpperCase();
    });
  }, [classes, isTeacherLoggedIn, currentStudent, currentTime]);

  // Handlers for student verification
  const handleStudentVerified = (student: StudentRecord) => {
    setCurrentStudent(student);
    storeStudent(student);
    setGrade10Tab('regular');

    const hasNoSection = student.section.toLowerCase() === 'no section' || !student.section;
    setSelectedGrade(student.grade);
    if (hasNoSection) {
      setSelectedSection(null);
    } else {
      setSelectedSection(student.section);
    }
    setCurrentView('grades');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudentLogout = () => {
    clearStoredStudent();
    setCurrentStudent(null);
    setSelectedGrade(null);
    setSelectedSection(null);
    setGrade10Tab('regular');
    setCurrentView('grades');
  };

  // Switch between Grade 10 regular class and Pure AP class
  const handleSwitchGrade10Tab = (tab: 'regular' | 'pure_ap') => {
    setGrade10Tab(tab);
    if (tab === 'pure_ap') {
      setSelectedGrade('Pure AP');
      setSelectedSection('A');
    } else if (currentStudent) {
      setSelectedGrade('Grade 10');
      const hasNoSection = currentStudent.section.toLowerCase() === 'no section' || !currentStudent.section;
      setSelectedSection(hasNoSection ? null : currentStudent.section);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for navigation
  const handleSelectGrade = (gradeId: string) => {
    setSelectedGrade(gradeId);
    setSelectedSection(null);
    setCurrentView('grades');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSection = (section: string) => {
    setSelectedSection(section);
    setCurrentView('grades');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToGrades = () => {
    if (currentStudent) {
      // Students cannot exit back to all grades
      return;
    }
    setSelectedGrade(null);
    setSelectedSection(null);
    setCurrentView('grades');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick jump from search or live view
  const handleJumpToClassRoom = (grade: string, section: string) => {
    setSelectedGrade(grade);
    setSelectedSection(section);
    setCurrentView('grades');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Teacher login handlers
  const handleTeacherLoginSuccess = (name: string, username: string) => {
    const teacherObj: TeacherRecord = { name, username };
    setIsTeacherLoggedIn(true);
    setTeacherName(name);
    setLoggedInTeacher(teacherObj);
    storeTeacher(teacherObj);
    setCurrentView('admin');
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    setLoggedInTeacher(null);
    clearStoredTeacher();
    if (currentView === 'admin') {
      setCurrentView('grades');
    }
  };

  // If NOT teacher logged in AND NOT student logged in: Show Student Security Gate
  if (!isTeacherLoggedIn && !currentStudent) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Header
          currentView="grades"
          onNavigate={() => {}}
          classes={classes}
          currentTime={currentTime}
          isTeacherLoggedIn={false}
          onOpenTeacherLogin={() => setIsTeacherAuthModalOpen(true)}
          onTeacherLogout={handleTeacherLogout}
          loggedInTeacher={null}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <StudentGate
            onStudentVerified={handleStudentVerified}
            onOpenTeacherLogin={() => setIsTeacherAuthModalOpen(true)}
          />
        </main>

        <TeacherAuthModal
          isOpen={isTeacherAuthModalOpen}
          onClose={() => setIsTeacherAuthModalOpen(false)}
          onSuccess={handleTeacherLoginSuccess}
        />

        <Footer
          onOpenTeacherLogin={() => setIsTeacherAuthModalOpen(true)}
          isTeacherLoggedIn={false}
          onOpenAdmin={() => setIsTeacherAuthModalOpen(true)}
          onTeacherLogout={handleTeacherLogout}
        />
      </div>
    );
  }

  // Active student properties
  const isStudentGrade10 = currentStudent?.grade.toLowerCase() === 'grade 10';
  const studentHasNoSection = currentStudent
    ? currentStudent.section.toLowerCase() === 'no section' || !currentStudent.section
    : false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'grades' && currentStudent) {
            // Return to their assigned grade
            if (studentHasNoSection) {
              setSelectedGrade(currentStudent.grade);
              setSelectedSection(null);
            } else {
              setSelectedGrade(currentStudent.grade);
              setSelectedSection(currentStudent.section);
            }
          }
        }}
        classes={authorizedClasses}
        currentTime={currentTime}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onOpenTeacherLogin={() => setIsTeacherAuthModalOpen(true)}
        onTeacherLogout={handleTeacherLogout}
        onSearchSelect={(c) => handleJumpToClassRoom(c.grade, c.section)}
        currentStudent={currentStudent}
        onLogoutStudent={handleStudentLogout}
        loggedInTeacher={loggedInTeacher}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Verified Student Banner */}
        {currentStudent && !isTeacherLoggedIn && (
          <StudentBanner
            student={currentStudent}
            currentActiveTab={grade10Tab}
            onSwitchTab={isStudentGrade10 ? handleSwitchGrade10Tab : undefined}
            onLogoutStudent={handleStudentLogout}
          />
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-700 rounded-full animate-spin"></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Loading Virtual Classrooms...
            </p>
          </div>
        ) : currentView === 'admin' ? (
          /* Teacher Administration Panel */
          <TeacherAdminPanel
            classes={classes}
            currentTime={currentTime}
            onRefresh={loadClasses}
            preselectedGrade={selectedGrade || undefined}
            preselectedSection={selectedSection || undefined}
            onCloseAdmin={() => setCurrentView('grades')}
            loggedInTeacher={loggedInTeacher}
          />
        ) : currentView === 'live' ? (
          /* Live Now Broadcast View (Filtered to student's authorized classes) */
          <LiveClassesView
            classes={authorizedClasses}
            currentTime={currentTime}
            onSelectClassRoom={handleJumpToClassRoom}
            onBackToGrades={handleBackToGrades}
          />
        ) : currentStudent && !isTeacherLoggedIn ? (
          /* Student Tailored View */
          studentHasNoSection ? (
            /* Student has 'No Section' -> Show all sections for their grade, or classroom if clicked */
            selectedSection ? (
              <ClassroomView
                gradeId={selectedGrade || currentStudent.grade}
                sectionLetter={selectedSection}
                onBackToSections={handleBackToSections}
                onBackToGrades={handleBackToGrades}
                classes={authorizedClasses}
                currentTime={currentTime}
                isTeacherLoggedIn={false}
                onOpenCreateClass={() => {}}
                allowBackToGrades={false}
                allowBackToSections={true}
                isGrade10Student={isStudentGrade10}
              />
            ) : (
              <SectionSelector
                gradeId={selectedGrade || currentStudent.grade}
                onBackToGrades={handleBackToGrades}
                onSelectSection={handleSelectSection}
                classes={authorizedClasses}
                currentTime={currentTime}
                allowBackToGrades={false}
              />
            )
          ) : (
            /* Student is assigned to a specific section */
            <ClassroomView
              gradeId={selectedGrade || currentStudent.grade}
              sectionLetter={selectedSection || currentStudent.section}
              onBackToSections={handleBackToSections}
              onBackToGrades={handleBackToGrades}
              classes={authorizedClasses}
              currentTime={currentTime}
              isTeacherLoggedIn={false}
              onOpenCreateClass={() => {}}
              allowBackToGrades={false}
              allowBackToSections={false}
              isGrade10Student={isStudentGrade10}
            />
          )
        ) : isTeacherLoggedIn && selectedGrade && selectedSection ? (
          /* Teacher: Classroom View for Selected Section */
          <ClassroomView
            gradeId={selectedGrade}
            sectionLetter={selectedSection}
            onBackToSections={handleBackToSections}
            onBackToGrades={handleBackToGrades}
            classes={classes}
            currentTime={currentTime}
            isTeacherLoggedIn={true}
            onOpenCreateClass={() => setCurrentView('admin')}
            allowBackToGrades={true}
            allowBackToSections={true}
          />
        ) : isTeacherLoggedIn && selectedGrade ? (
          /* Teacher: Sections List for Selected Grade */
          <SectionSelector
            gradeId={selectedGrade}
            onBackToGrades={handleBackToGrades}
            onSelectSection={handleSelectSection}
            classes={classes}
            currentTime={currentTime}
            allowBackToGrades={true}
          />
        ) : isTeacherLoggedIn ? (
          /* Teacher Only: Grades Catalog (KG 1 to Grade 12, Pure AP) */
          <GradeSelector
            onSelectGrade={handleSelectGrade}
            classes={classes}
            currentTime={currentTime}
          />
        ) : (
          /* Default for all students / visitors: Enter ID/Iqama form */
          <StudentGate
            onStudentVerified={handleStudentVerified}
            onOpenTeacherLogin={() => setIsTeacherAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Teacher Authentication Modal */}
      <TeacherAuthModal
        isOpen={isTeacherAuthModalOpen}
        onClose={() => setIsTeacherAuthModalOpen(false)}
        onSuccess={handleTeacherLoginSuccess}
      />

      {/* Footer */}
      <Footer
        onOpenTeacherLogin={() => setIsTeacherAuthModalOpen(true)}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onOpenAdmin={() => setCurrentView('admin')}
        onTeacherLogout={handleTeacherLogout}
      />
    </div>
  );
}
