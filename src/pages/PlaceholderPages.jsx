import React from 'react';
import useAuth from '../hooks/useAuth';
import { Package, Bell, Share2, Users, User, Shield, Building2, CheckCircle2 } from 'lucide-react';

export { AddFoodPage } from './AddFoodPage';
export { AlertsPage } from './AlertsPage';

export const ShareFoodPage = () => {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-[16px] p-8 border border-[#E3E9E4] shadow-sm text-center max-w-2xl mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-[#EBF3FE] text-[#2563EB] flex items-center justify-center mx-auto">
        <Share2 className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold text-[#17251E]">Surplus Food Sharing (Phase 4)</h1>
      <p className="text-sm text-[#66736B] leading-relaxed">
        Coordinate surplus food sharing directly with your neighbors in <strong>{user?.display_apartment_name}</strong>.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAF6] border border-[#E3E9E4] text-xs text-[#2563EB] font-semibold">
        <Building2 className="w-4 h-4" />
        <span>Community ID #{user?.apartment?.id || user?.apartment?.name || 'Custom'} Bound</span>
      </div>
    </div>
  );
};

export const CommunityPage = () => {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-[16px] p-8 border border-[#E3E9E4] shadow-sm text-center max-w-2xl mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mx-auto">
        <Users className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold text-[#17251E]">Community Impact (Phase 5)</h1>
      <p className="text-sm text-[#66736B] leading-relaxed">
        Analytics on total meals saved, waste diverted, and leaderboards for <strong>{user?.display_apartment_name}</strong>.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8FAF6] border border-[#E3E9E4] text-xs text-[#D97706] font-semibold">
        <Shield className="w-4 h-4" />
        <span>Impact Tracker Scaffolding Ready</span>
      </div>
    </div>
  );
};

export { ProfilePage } from './ProfilePage';

