import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { 
  Shield, 
  Users, 
  Building2, 
  Share2, 
  AlertTriangle, 
  History, 
  Search, 
  Filter, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  UserX, 
  Plus, 
  Edit, 
  Ban, 
  FileText, 
  Eye,
  RefreshCw
} from 'lucide-react';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'users' | 'apartments' | 'shares' | 'reports' | 'activity'

  // Dashboard state
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRole, setUsersRole] = useState('ALL');
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  
  // Selected user detail modal
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Role change modal
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRoleInput, setNewRoleInput] = useState('RESIDENT');

  // Apartments state
  const [apartmentsList, setApartmentsList] = useState([]);
  const [apartmentsLoading, setApartmentsLoading] = useState(false);
  const [aptModalOpen, setAptModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [aptName, setAptName] = useState('');
  const [aptAddress, setAptAddress] = useState('');

  // Food Shares state
  const [sharesList, setSharesList] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [sharesStatus, setSharesStatus] = useState('ALL');
  const [sharesSearch, setSharesSearch] = useState('');
  const [sharesPage, setSharesPage] = useState(1);
  const [sharesTotalPages, setSharesTotalPages] = useState(1);
  const [moderateShareObj, setModerateShareObj] = useState(null);
  const [moderateReason, setModerateReason] = useState('');

  // Reports state
  const [reportsList, setReportsList] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsStatus, setReportsStatus] = useState('PENDING');
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [resolveReportObj, setResolveReportObj] = useState(null);
  const [resolveAction, setResolveAction] = useState('NONE');
  const [resolveNote, setResolveNote] = useState('');

  // Audit Activity state
  const [activityList, setActivityList] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);

  // Global notice / feedback message
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const showNotice = (msg, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  // Load dashboard stats
  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);
      const data = await adminService.getDashboardStats();
      setDashboardStats(data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Load Users list
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await adminService.getUsers({
        page: usersPage,
        search: usersSearch,
        role: usersRole
      });
      setUsersList(data.results || []);
      setUsersTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Apartments list
  const loadApartments = async () => {
    try {
      setApartmentsLoading(true);
      const list = await adminService.getApartments();
      setApartmentsList(list);
    } catch (err) {
      console.error('Failed to load apartments:', err);
    } finally {
      setApartmentsLoading(false);
    }
  };

  // Load Shares list
  const loadShares = async () => {
    try {
      setSharesLoading(true);
      const data = await adminService.getShares({
        page: sharesPage,
        status: sharesStatus,
        search: sharesSearch
      });
      setSharesList(data.results || []);
      setSharesTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load shares:', err);
    } finally {
      setSharesLoading(false);
    }
  };

  // Load Reports list
  const loadReports = async () => {
    try {
      setReportsLoading(true);
      const data = await adminService.getReports({
        page: reportsPage,
        status: reportsStatus
      });
      setReportsList(data.results || []);
      setReportsTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  // Load Audit Activity list
  const loadAuditActivity = async () => {
    try {
      setActivityLoading(true);
      const data = await adminService.getAuditActivity({
        page: activityPage,
        search: activitySearch
      });
      setActivityList(data.results || []);
      setActivityTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load audit activity:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  // Initial tab triggers
  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard();
    else if (activeTab === 'users') loadUsers();
    else if (activeTab === 'apartments') loadApartments();
    else if (activeTab === 'shares') loadShares();
    else if (activeTab === 'reports') loadReports();
    else if (activeTab === 'activity') loadAuditActivity();
  }, [activeTab, usersPage, usersRole, sharesPage, sharesStatus, reportsPage, reportsStatus, activityPage]);

  // User Actions
  const handleToggleUserActivation = async (user) => {
    try {
      if (user.is_active) {
        await adminService.deactivateUser(user.id);
        showNotice(`Account for ${user.email} deactivated.`);
      } else {
        await adminService.activateUser(user.id);
        showNotice(`Account for ${user.email} activated.`);
      }
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user status.';
      showNotice(msg, true);
    }
  };

  const handleRoleChangeSubmit = async () => {
    if (!roleModalUser) return;
    try {
      await adminService.updateUserRole(roleModalUser.id, newRoleInput);
      showNotice(`Role updated to ${newRoleInput} for ${roleModalUser.email}.`);
      setRoleModalUser(null);
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change role.';
      showNotice(msg, true);
    }
  };

  const handleInspectUserDetail = async (id) => {
    try {
      const data = await adminService.getUserDetail(id);
      setSelectedUserDetail(data);
      setDetailModalOpen(true);
    } catch (err) {
      showNotice('Failed to fetch user details.', true);
    }
  };

  // Apartment Actions
  const handleSaveApartment = async (e) => {
    e.preventDefault();
    try {
      if (editingApt) {
        await adminService.updateApartment(editingApt.id, { name: aptName, address: aptAddress });
        showNotice('Apartment updated successfully.');
      } else {
        await adminService.createApartment({ name: aptName, address: aptAddress });
        showNotice('New apartment created successfully.');
      }
      setAptModalOpen(false);
      setEditingApt(null);
      setAptName('');
      setAptAddress('');
      loadApartments();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to save apartment.', true);
    }
  };

  // Share Moderation Action
  const handleModerateShareSubmit = async () => {
    if (!moderateShareObj) return;
    try {
      await adminService.moderateShare(moderateShareObj.id, moderateReason);
      showNotice(`Share '${moderateShareObj.title}' cancelled.`);
      setModerateShareObj(null);
      setModerateReason('');
      loadShares();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to moderate share.', true);
    }
  };

  // Report Actions
  const handleReviewReport = async (id) => {
    try {
      await adminService.reviewReport(id);
      showNotice('Report status updated to Under Review.');
      loadReports();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to review report.', true);
    }
  };

  const handleResolveReportSubmit = async () => {
    if (!resolveReportObj) return;
    try {
      await adminService.resolveReport(resolveReportObj.id, {
        action: resolveAction,
        resolution_note: resolveNote
      });
      showNotice('Report resolved successfully.');
      setResolveReportObj(null);
      setResolveAction('NONE');
      setResolveNote('');
      loadReports();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to resolve report.', true);
    }
  };

  const handleDismissReport = async (id) => {
    try {
      await adminService.dismissReport(id, 'Dismissed by administrator.');
      showNotice('Report dismissed.');
      loadReports();
    } catch (err) {
      showNotice(err.response?.data?.message || 'Failed to dismiss report.', true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Admin Header Banner */}
      <div className="bg-[#17251E] text-white rounded-[16px] p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin & Moderation Console</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
                Master Control
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#98A39D]">Manage users, apartments, food shares, content reports & security audit logs.</p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-[#24352B] p-1.5 rounded-[12px] border border-[#34483B] w-full md:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'bg-[#1F6F4A] text-white' : 'text-[#98A39D] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-[#1F6F4A] text-white' : 'text-[#98A39D] hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apartments')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'apartments' ? 'bg-[#1F6F4A] text-white' : 'text-[#98A39D] hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Apartments</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shares')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'shares' ? 'bg-[#1F6F4A] text-white' : 'text-[#98A39D] hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Shares</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'reports' ? 'bg-[#1F6F4A] text-white' : 'text-[#98A39D] hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Moderation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'activity' ? 'bg-[#1F6F4A] text-white' : 'text-[#98A39D] hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banners */}
      {actionSuccess && (
        <div className="p-3.5 rounded-[12px] bg-[#DCEFE3] border border-[#7FAF8A]/40 text-[#1F6F4A] text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-[12px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {dashboardLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Loading system metrics...</span>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                
                <div className="bg-white rounded-[16px] p-4 border border-[#E3E9E4] shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#66736B] uppercase tracking-wider block">Total Residents</span>
                  <div className="text-2xl font-bold text-[#17251E]">{dashboardStats?.total_residents || 0}</div>
                  <span className="text-[11px] text-[#1F6F4A] font-semibold">{dashboardStats?.active_residents || 0} Active</span>
                </div>

                <div className="bg-white rounded-[16px] p-4 border border-[#E3E9E4] shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#66736B] uppercase tracking-wider block">Apartments</span>
                  <div className="text-2xl font-bold text-[#17251E]">{dashboardStats?.total_apartments || 0}</div>
                  <span className="text-[11px] text-[#66736B]">Communities</span>
                </div>

                <div className="bg-white rounded-[16px] p-4 border border-[#E3E9E4] shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#66736B] uppercase tracking-wider block">Active Shares</span>
                  <div className="text-2xl font-bold text-[#1F6F4A]">{dashboardStats?.active_shares || 0}</div>
                  <span className="text-[11px] text-[#66736B]">Marketplace Feed</span>
                </div>

                <div className="bg-white rounded-[16px] p-4 border border-[#E3E9E4] shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#66736B] uppercase tracking-wider block">Pending Reports</span>
                  <div className="text-2xl font-bold text-[#D9534F]">{dashboardStats?.pending_reports || 0}</div>
                  <span className="text-[11px] text-[#D9534F] font-semibold">Requires Review</span>
                </div>

                <div className="bg-white rounded-[16px] p-4 border border-[#E3E9E4] shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#66736B] uppercase tracking-wider block">Pending Requests</span>
                  <div className="text-2xl font-bold text-[#D97706]">{dashboardStats?.pending_requests || 0}</div>
                  <span className="text-[11px] text-[#66736B]">Inter-resident</span>
                </div>

                <div className="bg-white rounded-[16px] p-4 border border-[#E3E9E4] shadow-xs space-y-1 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-[#66736B] uppercase tracking-wider block">Quick Control</span>
                  <button
                    type="button"
                    onClick={loadDashboard}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#F8FAF6] hover:bg-[#E3E9E4] text-[#1F6F4A] text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

              </div>

              {/* Quick Admin Actions & Alert Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#17251E] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1F6F4A]" />
                    <span>Administrative Shortcut Panel</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reports')}
                      className="p-3.5 rounded-[12px] bg-[#F8FAF6] hover:bg-[#DCEFE3] border border-[#E3E9E4] text-left text-xs font-semibold text-[#17251E] transition-colors"
                    >
                      <div className="text-[#D9534F] font-bold flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Moderation Queue</span>
                      </div>
                      Review user reports ({dashboardStats?.pending_reports || 0} pending)
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      className="p-3.5 rounded-[12px] bg-[#F8FAF6] hover:bg-[#DCEFE3] border border-[#E3E9E4] text-left text-xs font-semibold text-[#17251E] transition-colors"
                    >
                      <div className="text-[#1F6F4A] font-bold flex items-center gap-1.5 mb-1">
                        <Users className="w-4 h-4" />
                        <span>Resident Management</span>
                      </div>
                      View & control resident accounts
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-[#17251E] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1F6F4A]" />
                    <span>Apartment Network Isolation</span>
                  </h3>
                  <p className="text-xs text-[#66736B]">
                    FoodLoop enforces strict apartment boundary isolation. Residents only view pantry surplus, community shares, and member profiles from their registered apartment building.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('apartments')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6F4A] hover:underline"
                  >
                    <span>Manage Apartments & Buildings →</span>
                  </button>
                </div>

              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E9E4]">
            <div>
              <h2 className="text-lg font-bold text-[#17251E]">Resident User Management</h2>
              <p className="text-xs text-[#66736B]">Inspect users, change permissions, and toggle active status.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#98A39D] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name, email, flat..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                  className="w-full pl-9 pr-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              <select
                value={usersRole}
                onChange={(e) => setUsersRole(e.target.value)}
                className="px-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
              >
                <option value="ALL">All Roles</option>
                <option value="RESIDENT">Resident</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {usersLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Loading user accounts...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E3E9E4] text-[11px] font-bold text-[#66736B] uppercase tracking-wider bg-[#F8FAF6]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Apartment & Flat</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E9E4] text-xs">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8FAF6]/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#17251E]">
                        <div>{u.full_name}</div>
                        <div className="text-[11px] text-[#66736B] font-normal">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#66736B]">
                        {u.display_apartment_name} • Flat {u.flat_number || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.role === 'ADMIN' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]' : 'bg-[#DCEFE3] text-[#1F6F4A] border-[#7FAF8A]/40'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.is_active ? 'bg-[#DCEFE3] text-[#1F6F4A]' : 'bg-[#FDF2F2] text-[#D9534F]'
                        }`}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleInspectUserDetail(u.id)}
                          className="px-2.5 py-1 rounded-[6px] bg-[#F8FAF6] hover:bg-[#E3E9E4] text-[#17251E] text-[11px] font-semibold border border-[#E3E9E4]"
                        >
                          Details
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setRoleModalUser(u);
                            setNewRoleInput(u.role);
                          }}
                          className="px-2.5 py-1 rounded-[6px] bg-[#EBF3FE] hover:bg-[#DBEAFE] text-[#2563EB] text-[11px] font-semibold border border-[#2563EB]/30"
                        >
                          Role
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleUserActivation(u)}
                          className={`px-2.5 py-1 rounded-[6px] text-[11px] font-semibold border ${
                            u.is_active
                              ? 'bg-[#FDF2F2] hover:bg-[#FEE2E2] text-[#D9534F] border-[#F8B4B4]/40'
                              : 'bg-[#DCEFE3] hover:bg-[#BBF7D0] text-[#1F6F4A] border-[#7FAF8A]/40'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {usersTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    disabled={usersPage <= 1}
                    onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-[8px] bg-[#F8FAF6] border border-[#E3E9E4] text-xs font-semibold text-[#17251E] disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-[#66736B]">Page {usersPage} of {usersTotalPages}</span>
                  <button
                    type="button"
                    disabled={usersPage >= usersTotalPages}
                    onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
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

      {/* TAB 3: APARTMENT MANAGEMENT */}
      {activeTab === 'apartments' && (
        <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3E9E4]">
            <div>
              <h2 className="text-lg font-bold text-[#17251E]">Apartment Buildings & Communities</h2>
              <p className="text-xs text-[#66736B]">Manage residential complexes and resident allocations.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingApt(null);
                setAptName('');
                setAptAddress('');
                setAptModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Apartment</span>
            </button>
          </div>

          {apartmentsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Loading apartments...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apartmentsList.map((apt) => (
                <div key={apt.id} className="p-5 rounded-[16px] border border-[#E3E9E4] bg-[#F8FAF6] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#17251E]">{apt.name}</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingApt(apt);
                        setAptName(apt.name);
                        setAptAddress(apt.address || '');
                        setAptModalOpen(true);
                      }}
                      className="p-1 rounded-[6px] hover:bg-[#E3E9E4] text-[#66736B]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#66736B] font-medium">{apt.address || 'Standard Residency Complex'}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E3E9E4] text-[11px] text-[#1F6F4A] font-semibold">
                    <span>{apt.resident_count || 0} Active Residents</span>
                    <span>{apt.active_shares_count || 0} Active Shares</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SHARES MANAGEMENT */}
      {activeTab === 'shares' && (
        <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E9E4]">
            <div>
              <h2 className="text-lg font-bold text-[#17251E]">Food Shares Administration</h2>
              <p className="text-xs text-[#66736B]">Monitor surplus listings across all apartment complexes.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sharesStatus}
                onChange={(e) => setSharesStatus(e.target.value)}
                className="px-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="PARTIALLY_CLAIMED">Partially Claimed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {sharesLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Loading food shares...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E3E9E4] text-[11px] font-bold text-[#66736B] uppercase tracking-wider bg-[#F8FAF6]">
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Owner & Building</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E9E4] text-xs">
                  {sharesList.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F8FAF6]/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-[#17251E]">
                        <div>{s.title}</div>
                        <div className="text-[11px] text-[#66736B] font-normal">{s.food_item?.name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#66736B]">
                        {s.owner?.full_name} ({s.owner?.display_apartment_name})
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1F6F4A]">
                        {s.quantity} {s.unit}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'AVAILABLE' ? 'bg-[#DCEFE3] text-[#1F6F4A]' :
                          s.status === 'COMPLETED' ? 'bg-[#EBF3FE] text-[#2563EB]' : 'bg-[#FDF2F2] text-[#D9534F]'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {s.status !== 'CANCELLED' && s.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => setModerateShareObj(s)}
                            className="px-2.5 py-1 rounded-[6px] bg-[#FDF2F2] hover:bg-[#FEE2E2] text-[#D9534F] text-[11px] font-semibold border border-[#F8B4B4]/40"
                          >
                            Cancel Share
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MODERATION REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E9E4]">
            <div>
              <h2 className="text-lg font-bold text-[#17251E]">Content Moderation & Reports Queue</h2>
              <p className="text-xs text-[#66736B]">Review user complaints, inspect target listings, and execute actions.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportsStatus}
                onChange={(e) => setReportsStatus(e.target.value)}
                className="px-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
              >
                <option value="PENDING">Pending Review</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
                <option value="ALL">All Reports</option>
              </select>
            </div>
          </div>

          {reportsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Loading report queue...</span>
            </div>
          ) : reportsList.length === 0 ? (
            <div className="py-12 text-center text-[#66736B] text-xs">
              No reports found in this status category.
            </div>
          ) : (
            <div className="space-y-4">
              {reportsList.map((r) => (
                <div key={r.id} className="p-5 rounded-[16px] border border-[#E3E9E4] bg-[#F8FAF6] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#D9534F] bg-[#FDF2F2] border border-[#F8B4B4]/40 px-2.5 py-0.5 rounded-full">
                        {r.reason}
                      </span>
                      <span className="text-xs font-semibold text-[#17251E]">
                        Target: {r.target_type} #{r.target_id}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      r.status === 'PENDING' ? 'bg-[#FEF3C7] text-[#D97706]' :
                      r.status === 'UNDER_REVIEW' ? 'bg-[#EBF3FE] text-[#2563EB]' :
                      r.status === 'RESOLVED' ? 'bg-[#DCEFE3] text-[#1F6F4A]' : 'bg-[#E3E9E4] text-[#66736B]'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#17251E] bg-white p-3 rounded-[10px] border border-[#E3E9E4]">
                    "{r.description || 'No description provided.'}"
                  </p>

                  {r.target_summary && (
                    <div className="text-[11px] text-[#66736B] space-y-0.5">
                      <div>Target Details: <strong>{r.target_summary.title || r.target_summary.name || 'Object'}</strong></div>
                      <div>Owner/User: {r.target_summary.owner_email || r.target_summary.email || 'N/A'}</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#E3E9E4] text-[11px] text-[#66736B]">
                    <span>Reporter: {r.reporter?.full_name || 'Resident'} ({r.reporter?.email})</span>

                    <div className="space-x-2">
                      {r.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleReviewReport(r.id)}
                          className="px-2.5 py-1 rounded-[6px] bg-[#EBF3FE] text-[#2563EB] font-semibold border border-[#2563EB]/30"
                        >
                          Review
                        </button>
                      )}

                      {r.status !== 'RESOLVED' && r.status !== 'DISMISSED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setResolveReportObj(r)}
                            className="px-2.5 py-1 rounded-[6px] bg-[#1F6F4A] text-white font-semibold shadow-xs"
                          >
                            Resolve Action
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismissReport(r.id)}
                            className="px-2.5 py-1 rounded-[6px] bg-[#F8FAF6] text-[#66736B] font-semibold border border-[#E3E9E4]"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="pb-4 border-b border-[#E3E9E4]">
            <h2 className="text-lg font-bold text-[#17251E]">System Audit Trail Log</h2>
            <p className="text-xs text-[#66736B]">Site-wide security activity records and moderation event history.</p>
          </div>

          {activityLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Fetching audit logs...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {activityList.map((a) => (
                <div key={a.id} className="p-3.5 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-[#17251E]">
                      <span>{a.user_name} ({a.user_email})</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCEFE3] text-[#1F6F4A]">
                        {a.action}
                      </span>
                    </div>
                    {a.metadata && (
                      <div className="text-[11px] text-[#66736B] font-normal pt-0.5">
                        {JSON.stringify(a.metadata)}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] text-[#98A39D] shrink-0">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USER DETAIL INSPECT MODAL */}
      {detailModalOpen && selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-[#17251E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 max-w-lg w-full border border-[#E3E9E4] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
              <h3 className="text-base font-bold text-[#17251E]">User Profile Details</h3>
              <button onClick={() => setDetailModalOpen(false)} className="text-[#66736B]">✕</button>
            </div>

            <div className="space-y-2 text-xs text-[#17251E]">
              <div><strong>Name:</strong> {selectedUserDetail.user?.full_name}</div>
              <div><strong>Email:</strong> {selectedUserDetail.user?.email}</div>
              <div><strong>Apartment:</strong> {selectedUserDetail.user?.display_apartment_name}</div>
              <div><strong>Flat:</strong> {selectedUserDetail.user?.flat_number || 'N/A'}</div>
              <div><strong>Role:</strong> {selectedUserDetail.user?.role}</div>
              <div><strong>Status:</strong> {selectedUserDetail.is_active ? 'Active' : 'Deactivated'}</div>

              <div className="pt-3 border-t border-[#E3E9E4] space-y-1">
                <div className="font-bold text-[#1F6F4A]">Inventory Statistics</div>
                <div>Items Added: {selectedUserDetail.stats?.items_added}</div>
                <div>Consumed Count: {selectedUserDetail.stats?.consumed_count}</div>
                <div>Wasted Count: {selectedUserDetail.stats?.wasted_count}</div>
                <div>Shares Created: {selectedUserDetail.stats?.shares_created}</div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-[10px] bg-[#F8FAF6] border border-[#E3E9E4] text-xs font-semibold text-[#17251E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-[#17251E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full border border-[#E3E9E4] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#17251E]">Change Role for {roleModalUser.email}</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17251E]">Select New Role:</label>
              <select
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] text-xs text-[#17251E]"
              >
                <option value="RESIDENT">RESIDENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-3.5 py-2 rounded-[10px] bg-[#F8FAF6] text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRoleChangeSubmit}
                className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APARTMENT ADD/EDIT MODAL */}
      {aptModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#17251E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveApartment} className="bg-white rounded-[20px] p-6 max-w-sm w-full border border-[#E3E9E4] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#17251E]">{editingApt ? 'Edit Apartment' : 'Add New Apartment'}</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Apartment Name</label>
                <input
                  type="text"
                  required
                  value={aptName}
                  onChange={(e) => setAptName(e.target.value)}
                  placeholder="e.g. Green Valley Towers"
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] text-xs text-[#17251E]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={aptAddress}
                  onChange={(e) => setAptAddress(e.target.value)}
                  placeholder="e.g. 104 Park Avenue"
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] text-xs text-[#17251E]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAptModalOpen(false)}
                className="px-3.5 py-2 rounded-[10px] bg-[#F8FAF6] text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold"
              >
                Save Apartment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODERATE SHARE MODAL */}
      {moderateShareObj && (
        <div className="fixed inset-0 z-50 bg-[#17251E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full border border-[#E3E9E4] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#17251E]">Cancel Share '{moderateShareObj.title}'</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#17251E]">Moderation Reason:</label>
              <textarea
                value={moderateReason}
                onChange={(e) => setModerateReason(e.target.value)}
                placeholder="Reason for administrative cancellation..."
                className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] text-xs text-[#17251E] h-20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModerateShareObj(null)}
                className="px-3.5 py-2 rounded-[10px] bg-[#F8FAF6] text-xs font-semibold text-[#66736B]"
              >
                Keep Share
              </button>
              <button
                type="button"
                onClick={handleModerateShareSubmit}
                className="px-4 py-2 rounded-[10px] bg-[#D9534F] text-white text-xs font-semibold"
              >
                Cancel Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE REPORT MODAL */}
      {resolveReportObj && (
        <div className="fixed inset-0 z-50 bg-[#17251E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] p-6 max-w-md w-full border border-[#E3E9E4] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#17251E]">Resolve Report #{resolveReportObj.id}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Moderation Action:</label>
                <select
                  value={resolveAction}
                  onChange={(e) => setResolveAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] text-xs text-[#17251E]"
                >
                  <option value="NONE">Mark Resolved (No direct entity change)</option>
                  <option value="CANCEL_SHARE">Cancel Target Food Share</option>
                  <option value="DEACTIVATE_USER">Deactivate Target User Account</option>
                  <option value="DISMISS">Dismiss Report</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Resolution Note / Findings:</label>
                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Audit resolution notes..."
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] text-xs text-[#17251E] h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolveReportObj(null)}
                className="px-3.5 py-2 rounded-[10px] bg-[#F8FAF6] text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveReportSubmit}
                className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold"
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
