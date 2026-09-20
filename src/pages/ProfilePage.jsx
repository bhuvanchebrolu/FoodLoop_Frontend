import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import activityService from '../services/activityService';
import { 
  User, 
  Building2, 
  Shield, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Bell, 
  Eye, 
  Share2,
  PackageCheck,
  TrendingUp,
  Leaf,
  IndianRupee,
  History,
  Trash2,
  Utensils,
  PlusCircle,
  Calendar
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, userSettings, updateProfile, fetchSettings, updateSettings } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'impact' | 'activity' | 'settings'

  // Consolidated Database Stats & Impact
  const [profileSummary, setProfileSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // User Activity History Stream
  const [userActivities, setUserActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [totalActivityPages, setTotalActivityPages] = useState(1);

  // Profile Form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [flatNumber, setFlatNumber] = useState(user?.flat_number || '');
  const [apartmentId, setApartmentId] = useState(user?.apartment?.id || '');
  const [apartmentsList, setApartmentsList] = useState([]);
  
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Settings Form state
  const [profileVisibility, setProfileVisibility] = useState('COMMUNITY');
  const [communityVisibility, setCommunityVisibility] = useState('APARTMENT');
  const [expiryNotifications, setExpiryNotifications] = useState(true);
  const [shareNotifications, setShareNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Load profile summary stats from backend
  useEffect(() => {
    let isMounted = true;
    const loadSummary = async () => {
      try {
        setSummaryLoading(true);
        const data = await activityService.getProfileSummary();
        if (isMounted) setProfileSummary(data);
      } catch (err) {
        console.error('Failed to load profile summary:', err);
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    };
    loadSummary();
    return () => { isMounted = false; };
  }, []);

  // Load user activity stream when switching to activity tab
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'activity') {
      const loadActivity = async () => {
        try {
          setActivitiesLoading(true);
          const data = await activityService.getUserActivity({ page: activityPage });
          if (isMounted) {
            setUserActivities(data.results || []);
            setTotalActivityPages(data.total_pages || 1);
          }
        } catch (err) {
          console.error('Failed to load activity stream:', err);
        } finally {
          if (isMounted) setActivitiesLoading(false);
        }
      };
      loadActivity();
    }
    return () => { isMounted = false; };
  }, [activeTab, activityPage]);

  // Load available apartments for dropdown
  useEffect(() => {
    const loadApartments = async () => {
      try {
        const list = await authService.getApartments();
        setApartmentsList(list);
      } catch (err) {
        console.error('Failed to load apartments:', err);
      }
    };
    loadApartments();
  }, []);

  // Sync profile state when user object changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setFlatNumber(user.flat_number || '');
      setApartmentId(user.apartment?.id || '');
    }
  }, [user]);

  // Sync settings state when userSettings changes
  useEffect(() => {
    if (userSettings) {
      setProfileVisibility(userSettings.profile_visibility || 'COMMUNITY');
      setCommunityVisibility(userSettings.community_visibility || 'APARTMENT');
      setExpiryNotifications(userSettings.expiry_notifications ?? true);
      setShareNotifications(userSettings.share_notifications ?? true);
      setEmailNotifications(userSettings.email_notifications ?? true);
    }
  }, [userSettings]);

  // Fetch settings when switching to settings tab
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'settings' && !userSettings) {
      setSettingsLoading(true);
      fetchSettings().finally(() => {
        if (isMounted) setSettingsLoading(false);
      });
    }
    return () => { isMounted = false; };
  }, [activeTab, fetchSettings, userSettings]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const payload = {
        full_name: fullName,
        flat_number: flatNumber,
        apartment_id: apartmentId ? parseInt(apartmentId, 10) : 0,
      };

      await updateProfile(payload);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) {
        const firstErr = Object.values(errData.errors)[0];
        setProfileError(Array.isArray(firstErr) ? firstErr[0] : 'Validation failed.');
      } else {
        setProfileError(errData?.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess('');
    setSettingsError('');

    try {
      const payload = {
        profile_visibility: profileVisibility,
        community_visibility: communityVisibility,
        expiry_notifications: expiryNotifications,
        share_notifications: shareNotifications,
        email_notifications: emailNotifications,
      };

      await updateSettings(payload);
      setSettingsSuccess('Preferences saved successfully!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      const errData = err.response?.data;
      setSettingsError(errData?.message || 'Failed to update settings. Please try again.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    : 'Member';

  const stats = profileSummary?.stats || {};
  const impact = profileSummary?.impact || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header Profile Banner Card */}
      <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#174F37] to-[#1F6F4A] text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#17251E] tracking-tight">{user?.full_name}</h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                user?.role === 'ADMIN' 
                  ? 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]' 
                  : 'bg-[#DCEFE3] text-[#1F6F4A] border-[#7FAF8A]/40'
              }`}>
                {user?.role || 'RESIDENT'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#66736B] font-medium">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#1F6F4A] font-semibold bg-[#F8FAF6] border border-[#E3E9E4] px-3 py-1 rounded-full">
                <Building2 className="w-3.5 h-3.5 text-[#7FAF8A]" />
                <span>{user?.display_apartment_name} • Flat {user?.flat_number || 'N/A'}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#66736B] bg-[#F8FAF6] border border-[#E3E9E4] px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-[#98A39D]" />
                <span>Joined {memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Controls */}
        <div className="flex items-center bg-[#F8FAF6] p-1.5 rounded-[12px] border border-[#E3E9E4] w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('impact')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'impact'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Stats & Impact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'activity'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROFILE DETAILS FORM */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E4]">
            <div>
              <h2 className="text-lg font-bold text-[#17251E]">Personal Information</h2>
              <p className="text-xs text-[#66736B]">Update your personal identity and community address details.</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3.5 rounded-[10px] bg-[#DCEFE3] border border-[#7FAF8A]/40 text-[#1F6F4A] text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-[10px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
                />
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Email Address <span className="text-[#98A39D] font-normal">(Primary ID)</span>
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6]/60 text-sm text-[#66736B] cursor-not-allowed"
                />
              </div>

              {/* Apartment / Community */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Apartment Community
                </label>
                <select
                  value={apartmentId}
                  onChange={(e) => setApartmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
                >
                  <option value="">Select your Apartment...</option>
                  {apartmentsList.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name} ({apt.address || 'Standard Residency'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Flat Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Flat / Unit Number
                </label>
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="e.g. A-204"
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
                />
              </div>

            </div>

            {/* Read-only Role Notice */}
            <div className="p-3 bg-[#F8FAF6] rounded-[10px] border border-[#E3E9E4] flex items-center gap-3 text-xs text-[#66736B]">
              <Shield className="w-4 h-4 text-[#7FAF8A] shrink-0" />
              <span>
                Assigned Role: <strong className="text-[#17251E]">{user?.role}</strong>. Role changes require administrator authentication.
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: STATS & PERSONAL IMPACT */}
      {activeTab === 'impact' && (
        <div className="space-y-6">
          {summaryLoading ? (
            <div className="bg-white rounded-[16px] p-12 border border-[#E3E9E4] flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Calculating database statistics...</span>
            </div>
          ) : (
            <>
              {/* Eco Impact Hero Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#66736B] uppercase tracking-wider">Food Saved</span>
                    <div className="w-8 h-8 rounded-xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center">
                      <Leaf className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#17251E]">
                    {impact.food_saved_kg || 0} <span className="text-sm font-semibold text-[#66736B]">kg</span>
                  </div>
                  <p className="text-[11px] text-[#66736B]">Directly consumed or shared surplus food.</p>
                </div>

                <div className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#66736B] uppercase tracking-wider">Food Shared</span>
                    <div className="w-8 h-8 rounded-xl bg-[#EBF3FE] text-[#2563EB] flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#17251E]">
                    {impact.food_shared_kg || 0} <span className="text-sm font-semibold text-[#66736B]">kg</span>
                  </div>
                  <p className="text-[11px] text-[#66736B]">Handed over to community neighbors.</p>
                </div>

                <div className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#66736B] uppercase tracking-wider">Waste Diverted</span>
                    <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#17251E]">
                    {impact.diverted_waste_kg || 0} <span className="text-sm font-semibold text-[#66736B]">kg</span>
                  </div>
                  <p className="text-[11px] text-[#66736B]">Diverted away from municipal landfills.</p>
                </div>

                <div className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#66736B] uppercase tracking-wider">Est. Value Saved</span>
                    <div className="w-8 h-8 rounded-xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#17251E]">
                    ₹{impact.estimated_value_saved_inr || 0}
                  </div>
                  <p className="text-[11px] text-[#66736B]">Estimated household value saved.</p>
                </div>

              </div>

              {/* Detailed Database-derived Inventory Statistics */}
              <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
                <div className="pb-4 border-b border-[#E3E9E4]">
                  <h2 className="text-lg font-bold text-[#17251E]">Detailed Inventory Statistics</h2>
                  <p className="text-xs text-[#66736B]">Aggregated historical food record counts in your account.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#66736B] font-semibold">
                      <PlusCircle className="w-3.5 h-3.5 text-[#1F6F4A]" />
                      <span>Added</span>
                    </div>
                    <div className="text-xl font-bold text-[#17251E]">{stats.items_added || 0}</div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#66736B] font-semibold">
                      <Utensils className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Consumed</span>
                    </div>
                    <div className="text-xl font-bold text-[#17251E]">{stats.consumed_count || 0}</div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#66736B] font-semibold">
                      <Trash2 className="w-3.5 h-3.5 text-[#D9534F]" />
                      <span>Wasted</span>
                    </div>
                    <div className="text-xl font-bold text-[#17251E]">{stats.wasted_count || 0}</div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#66736B] font-semibold">
                      <Share2 className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Shares Posted</span>
                    </div>
                    <div className="text-xl font-bold text-[#17251E]">{stats.shares_created || 0}</div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#66736B] font-semibold">
                      <PackageCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>Completed</span>
                    </div>
                    <div className="text-xl font-bold text-[#17251E]">{stats.shares_completed || 0}</div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#66736B] font-semibold">
                      <History className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Requests Made</span>
                    </div>
                    <div className="text-xl font-bold text-[#17251E]">{stats.requests_made || 0}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: USER ACTIVITY STREAM */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="pb-4 border-b border-[#E3E9E4]">
            <h2 className="text-lg font-bold text-[#17251E]">My Activity Audit Trail</h2>
            <p className="text-xs text-[#66736B]">Chronological timeline of your account interactions and food actions.</p>
          </div>

          {activitiesLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Fetching activity log...</span>
            </div>
          ) : userActivities.length === 0 ? (
            <div className="py-12 text-center text-[#66736B] text-xs">
              No activity logs recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {userActivities.map((act) => (
                <div key={act.id} className="p-3.5 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#17251E]">{act.action}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E3E9E4] text-[#66736B]">
                        {act.entity_type || 'System'}
                      </span>
                    </div>
                    {act.metadata && Object.keys(act.metadata).length > 0 && (
                      <p className="text-[11px] text-[#66736B]">
                        {JSON.stringify(act.metadata)}
                      </p>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-[#98A39D] shrink-0">
                    {new Date(act.created_at).toLocaleString()}
                  </div>
                </div>
              ))}

              {/* Pagination controls */}
              {totalActivityPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    disabled={activityPage <= 1}
                    onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-[8px] bg-[#F8FAF6] border border-[#E3E9E4] text-xs font-semibold text-[#17251E] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-[#66736B]">Page {activityPage} of {totalActivityPages}</span>
                  <button
                    type="button"
                    disabled={activityPage >= totalActivityPages}
                    onClick={() => setActivityPage(p => Math.min(totalActivityPages, p + 1))}
                    className="px-3 py-1.5 rounded-[8px] bg-[#F8FAF6] border border-[#E3E9E4] text-xs font-semibold text-[#17251E] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USER SETTINGS FORM */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E4]">
            <div>
              <h2 className="text-lg font-bold text-[#17251E]">Preferences & Privacy Settings</h2>
              <p className="text-xs text-[#66736B]">Manage visibility defaults and notification channels for FoodLoop.</p>
            </div>
          </div>

          {settingsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Loading preferences...</span>
            </div>
          ) : (
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              
              {settingsSuccess && (
                <div className="p-3.5 rounded-[10px] bg-[#DCEFE3] border border-[#7FAF8A]/40 text-[#1F6F4A] text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              {settingsError && (
                <div className="p-3.5 rounded-[10px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{settingsError}</span>
                </div>
              )}

              {/* Privacy Controls */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#98A39D] uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Privacy & Visibility</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17251E] block">
                      Profile Visibility
                    </label>
                    <select
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
                    >
                      <option value="COMMUNITY">Entire Community</option>
                      <option value="APARTMENT">Apartment Residents Only</option>
                      <option value="PRIVATE">Private (Only Me)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#17251E] block">
                      Community Visibility
                    </label>
                    <select
                      value={communityVisibility}
                      onChange={(e) => setCommunityVisibility(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
                    >
                      <option value="APARTMENT">Apartment Wide</option>
                      <option value="ALL">All Network Communities</option>
                      <option value="PRIVATE">Hidden</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-4 pt-4 border-t border-[#E3E9E4]">
                <h3 className="text-xs font-bold text-[#98A39D] uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notification Preferences</span>
                </h3>

                <div className="space-y-3">
                  
                  <label className="flex items-center justify-between p-3 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] hover:bg-white transition-colors cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-[#17251E] block">Food Expiry Notifications</span>
                      <span className="text-[11px] text-[#66736B]">Receive alerts when food items in your pantry near expiry.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={expiryNotifications}
                      onChange={(e) => setExpiryNotifications(e.target.checked)}
                      className="w-4 h-4 accent-[#1F6F4A] rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] hover:bg-white transition-colors cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-[#17251E] block">Food Sharing Alerts</span>
                      <span className="text-[11px] text-[#66736B]">Notify when neighbors post or request shared surplus food.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareNotifications}
                      onChange={(e) => setShareNotifications(e.target.checked)}
                      className="w-4 h-4 accent-[#1F6F4A] rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] hover:bg-white transition-colors cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-[#17251E] block">Email Summary Digests</span>
                      <span className="text-[11px] text-[#66736B]">Send weekly community food waste reduction reports to email.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-4 h-4 accent-[#1F6F4A] rounded cursor-pointer"
                    />
                  </label>

                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  {settingsSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Preferences...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      )}

    </div>
  );
};

export default ProfilePage;
