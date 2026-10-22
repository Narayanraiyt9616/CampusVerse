import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-6 text-center bg-[#FFFEFA] text-[#111827]">
      <div className="w-16 h-16 rounded-2xl bg-[#FFF8E6] border border-[#F1E7CF] flex items-center justify-center text-[#D99A00] mb-6 shadow-sm">
        <FileQuestion className="w-8 h-8 text-[#D99A00]" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-[#D99A00] bg-[#FFF8E6] px-3 py-1 rounded-full border border-[#F1E7CF] mb-3">
        Error 404 &bull; Page Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mb-2">
        Requested University Resource Unavailable
      </h1>

      <p className="text-sm text-[#4B5563] max-w-md mb-8 leading-relaxed font-medium">
        The route you specified does not exist in the CampusVerse AI architecture. Please return to the public landing page or visit one of the active role portals.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Back to Public Landing
          </Button>
        </Link>
        <Link to="/student">
          <Button variant="secondary" size="md">
            Go to Student Portal
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
