import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAF6] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white rounded-[24px] p-8 sm:p-12 max-w-md w-full border border-[#E3E9E4] shadow-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#174F37] to-[#1F6F4A] text-white flex items-center justify-center mx-auto shadow-md">
          <Leaf className="w-8 h-8 text-[#DCEFE3]" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-[#1F6F4A] tracking-tight">404</span>
          <h1 className="text-xl font-bold text-[#17251E]">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-[#66736B]">
            The page or resource you requested could not be located. It may have been moved or does not exist.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#F8FAF6] hover:bg-[#E3E9E4] text-[#17251E] text-xs font-semibold border border-[#E3E9E4] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
