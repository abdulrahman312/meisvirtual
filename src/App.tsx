import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { GradeSelector } from './components/GradeSelector';
import { SectionSelector } from './components/SectionSelector';
import { ClassroomView } from './components/ClassroomView';
import { LiveClassesView } from './components/LiveClassesView';
import { TeacherAdminPanel } from './components/TeacherAdminPanel';
import { TeacherAuthModal } from './components/TeacherAuthModal';
import { Footer } from './components/Footer';
import { VirtualClass } from './types';
import { fetchClasses, subscribeToClasses } from './services/api';

export default function App() {
  const [classes, setClasses] = useState<VirtualClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Navigation view state
  const [currentView, setCurrentView] = useState<'grades' | 'live' | 'admin'>('grades');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Teacher authentication state
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('meis_teacher_session') === 'true';
  });
  const [isTeacherAuthModalOpen, setIsTeacherAuthModalOpen] = useState(false);
  const [teacherName, setTeacherName] = useState<string>(() => {
    return sessionStorage.getItem('meis_teacher_name') || 'Faculty Member';
  });

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

  // Handlers for student navigation
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

  // Teacher login
  const handleTeacherLoginSuccess = (name: string) => {
    setIsTeacherLoggedIn(true);
    setTeacherName(name);
    sessionStorage.setItem('meis_teacher_session', 'true');
    sessionStorage.setItem('meis_teacher_name', name);
    setCurrentView('admin');
  };

  const handleTeacherLogout = () => {
    setIsTeacherLoggedIn(false);
    sessionStorage.removeItem('meis_teacher_session');
    sessionStorage.removeItem('meis_teacher_name');
    if (currentView === 'admin') {
      setCurrentView('grades');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'grades') {
            // Keep grade or reset if user clicks header button
            if (!selectedGrade) {
              setSelectedGrade(null);
              setSelectedSection(null);
            }
          }
        }}
        classes={classes}
        currentTime={currentTime}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onOpenTeacherLogin={() => setIsTeacherAuthModalOpen(true)}
        onTeacherLogout={handleTeacherLogout}
        onSearchSelect={(c) => handleJumpToClassRoom(c.grade, c.section)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
          />
        ) : currentView === 'live' ? (
          /* Live Now Broadcast View */
          <LiveClassesView
            classes={classes}
            currentTime={currentTime}
            onSelectClassRoom={handleJumpToClassRoom}
            onBackToGrades={handleBackToGrades}
          />
        ) : selectedGrade && selectedSection ? (
          /* Step 3: Classroom View for Selected Section */
          <ClassroomView
            gradeId={selectedGrade}
            sectionLetter={selectedSection}
            onBackToSections={handleBackToSections}
            onBackToGrades={handleBackToGrades}
            classes={classes}
            currentTime={currentTime}
            isTeacherLoggedIn={isTeacherLoggedIn}
            onOpenCreateClass={() => {
              setCurrentView('admin');
            }}
          />
        ) : selectedGrade ? (
          /* Step 2: Sections List (A to Z) for Selected Grade */
          <SectionSelector
            gradeId={selectedGrade}
            onBackToGrades={handleBackToGrades}
            onSelectSection={handleSelectSection}
            classes={classes}
            currentTime={currentTime}
          />
        ) : (
          /* Step 1: Grades Catalog (KG1 to Grade 12) */
          <GradeSelector
            onSelectGrade={handleSelectGrade}
            classes={classes}
            currentTime={currentTime}
          />
        )}
      </main>

      {/* Teacher Authentication Modal */}
      <TeacherAuthModal
        isOpen={isTeacherAuthModalOpen}
        onClose={() => setIsTeacherAuthModalOpen(false)}
        onSuccess={handleTeacherLoginSuccess}
      />

      {/* Footer with Small Teacher Admin access */}
      <Footer
        onOpenTeacherLogin={() => setIsTeacherAuthModalOpen(true)}
        isTeacherLoggedIn={isTeacherLoggedIn}
        onOpenAdmin={() => setCurrentView('admin')}
        onTeacherLogout={handleTeacherLogout}
      />
    </div>
  );
}
