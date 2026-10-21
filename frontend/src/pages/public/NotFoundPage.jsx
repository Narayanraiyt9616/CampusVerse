import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-6 text-center bg-[#F0FDFA] text-[#102A43]">
      <div className="w-16 h-16 rounded-2xl bg-[#CCFBF1] border border-[#0D9488] flex items-center justify-center text-[#0D9488] mb-6 shadow-sm">
        <FileQuestion className="w-8 h-8 text-[#0D9488]" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] bg-[#CCFBF1] px-3 py-1 rounded-full border border-[#0D9488] mb-3">
        Error 404 &bull; Page Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight mb-2">
        Requested University Resource Unavailable
      </h1>

      <p className="text-sm text-[#102A43]/75 max-w-md mb-8 leading-relaxed font-medium">
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
