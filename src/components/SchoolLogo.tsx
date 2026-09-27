import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBackground?: boolean;
}

export const SCHOOL_LOGO_URL = 'https://i.ibb.co/bgFrgXkW/meis.png';

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showBackground = true,
}) => {
  const [hasError, setHasError] = useState(false);

  // Dimension mapping
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
  };

  const imgSizeClasses = {
    sm: 'max-h-7 max-w-7',
    md: 'max-h-10 max-w-10',
    lg: 'max-h-12 max-w-12',
    xl: 'max-h-14 max-w-14',
  };

  if (hasError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 flex items-center justify-center text-white shadow-xs ${className}`}
      >
        <GraduationCap className="w-1/2 h-1/2 text-indigo-100" />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 transition-transform ${
        showBackground
          ? 'bg-white rounded-xl p-1 shadow-xs border border-slate-200/90'
          : ''
      } ${sizeClasses[size]} ${className}`}
    >
      <img
        src={SCHOOL_LOGO_URL}
        alt="MEIS - Middle East International School Logo"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${imgSizeClasses[size]} w-auto h-auto object-contain select-none`}
      />
    </div>
  );
};
