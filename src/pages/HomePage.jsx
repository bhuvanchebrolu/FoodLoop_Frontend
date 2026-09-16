import React from 'react';
import useAuth from '../hooks/useAuth';
import { 
  Building2, 
  Home, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Package, 
  Bell, 
  Share2, 
  Sparkles,
  ArrowRight,
  Leaf,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#174F37] via-[#1F6F4A] to-[#2E8B57] text-white p-6 sm:p-8 rounded-[16px] shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#DCEFE3] mb-3 border border-white/20">
            <Leaf className="w-3.5 h-3.5" />
            <span>Welcome Resident</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Hello, {user?.full_name || 'Resident'}! 👋
          </h1>
          
          <p className="text-sm sm:text-base text-[#DCEFE3]/90 leading-relaxed mb-4">
            Your FoodLoop account is active and connected to <strong className="text-white font-semibold">{user?.display_apartment_name}</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/15 pt-4">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#E8B44F]" />
              <span>{user?.display_apartment_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-[#7FAF8A]" />
              <span>Flat {user?.flat_number || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#DCEFE3]" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 1 Verification Summary Card */}
      <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-[0_4px_20px_rgba(23,37,30,0.06)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E3E9E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#DCEFE3] flex items-center justify-center text-[#1F6F4A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17251E]">Phase 1: Foundation & Authentication Status</h2>
              <p className="text-xs text-[#66736B]">PostgreSQL database & JWT authentication active</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#DCEFE3] text-[#1F6F4A]">
            Authenticated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F8FAF6] p-4 rounded-[12px] border border-[#E3E9E4]">
            <span className="text-xs font-semibold text-[#66736B] block mb-1">User ID</span>
            <span className="text-sm font-bold text-[#17251E]">#{user?.id}</span>
          </div>

          <div className="bg-[#F8FAF6] p-4 rounded-[12px] border border-[#E3E9E4]">
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Registered Email</span>
            <span className="text-sm font-bold text-[#17251E] truncate block">{user?.email}</span>
          </div>

          <div className="bg-[#F8FAF6] p-4 rounded-[12px] border border-[#E3E9E4]">
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Apartment Community</span>
            <span className="text-sm font-bold text-[#17251E] truncate block">{user?.display_apartment_name}</span>
          </div>

          <div className="bg-[#F8FAF6] p-4 rounded-[12px] border border-[#E3E9E4]">
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Flat Number</span>
            <span className="text-sm font-bold text-[#17251E] block">{user?.flat_number || 'Unspecified'}</span>
          </div>
        </div>
      </div>

      {/* Roadmap & Future Phase Readiness Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#17251E] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E8B44F]" />
            FoodLoop Platform Roadmap
          </h2>
          <span className="text-xs text-[#66736B]">Ready for Phases 2–5</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Phase 2 Preview */}
          <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-sm hover:border-[#7FAF8A] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCEFE3] flex items-center justify-center text-[#1F6F4A]">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#1F6F4A] bg-[#DCEFE3] px-2.5 py-0.5 rounded-full">
                Phase 2
              </span>
            </div>
            <h3 className="text-base font-bold text-[#17251E] mb-1 group-hover:text-[#1F6F4A] transition-colors">
              Food Inventory Tracker
            </h3>
            <p className="text-xs text-[#66736B] leading-relaxed mb-4">
              Add food items, categories, quantity, purchase date, and expiry monitoring.
            </p>
            <Link 
              to="/add-food" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6F4A] hover:underline"
            >
              <span>View Inventory Placeholder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Phase 3 Preview */}
          <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-sm hover:border-[#7FAF8A] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF4E5] flex items-center justify-center text-[#E6A23C]">
                <Bell className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#E6A23C] bg-[#FFF4E5] px-2.5 py-0.5 rounded-full">
                Phase 3
              </span>
            </div>
            <h3 className="text-base font-bold text-[#17251E] mb-1 group-hover:text-[#1F6F4A] transition-colors">
              Smart Expiry Alerts
            </h3>
            <p className="text-xs text-[#66736B] leading-relaxed mb-4">
              Timely notifications for items expiring today, tomorrow, or within 3 days.
            </p>
            <Link 
              to="/alerts" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6F4A] hover:underline"
            >
              <span>View Alerts Placeholder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Phase 4 Preview */}
          <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-sm hover:border-[#7FAF8A] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] flex items-center justify-center text-[#2563EB]">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#2563EB] bg-[#EBF3FE] px-2.5 py-0.5 rounded-full">
                Phase 4
              </span>
            </div>
            <h3 className="text-base font-bold text-[#17251E] mb-1 group-hover:text-[#1F6F4A] transition-colors">
              Surplus Food Sharing
            </h3>
            <p className="text-xs text-[#66736B] leading-relaxed mb-4">
              Share excess food with neighbours in {user?.display_apartment_name} and claim available items.
            </p>
            <Link 
              to="/share-food" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6F4A] hover:underline"
            >
              <span>View Sharing Feed Placeholder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Phase 5 Preview */}
          <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-sm hover:border-[#7FAF8A] transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full">
                Phase 5
              </span>
            </div>
            <h3 className="text-base font-bold text-[#17251E] mb-1 group-hover:text-[#1F6F4A] transition-colors">
              Community Impact Analytics
            </h3>
            <p className="text-xs text-[#66736B] leading-relaxed mb-4">
              Track household savings, total meals saved, and apartment-wide waste reduction metrics.
            </p>
            <Link 
              to="/community" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6F4A] hover:underline"
            >
              <span>View Impact Placeholder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
