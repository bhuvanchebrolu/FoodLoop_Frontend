import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import shareService from '../services/shareService';
import useAuth from '../hooks/useAuth';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Loader2, 
  MessageSquare, 
  Check, 
  XCircle, 
  Package, 
  RefreshCw,
  Heart,
  Send,
  UserCheck
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'FRUITS', label: 'Fruits' },
  { value: 'VEGETABLES', label: 'Vegetables' },
  { value: 'DAIRY', label: 'Dairy' },
  { value: 'MEAT', label: 'Meat' },
  { value: 'SEAFOOD', label: 'Seafood' },
  { value: 'GRAINS', label: 'Grains' },
  { value: 'BAKERY', label: 'Bakery' },
  { value: 'SNACKS', label: 'Snacks' },
  { value: 'BEVERAGES', label: 'Beverages' },
  { value: 'FROZEN', label: 'Frozen' },
  { value: 'PACKAGED', label: 'Packaged' },
  { value: 'OTHER', label: 'Other' },
];

export const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'mine' | 'requests' | 'saved'
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const [shares, setShares] = useState([]);
  const [myShares, setMyShares] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Request Modal State
  const [requestingShare, setRequestingShare] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Complete Handover Confirmation Modal State
  const [completingRequest, setCompletingRequest] = useState(null);
  const [completingSubmitting, setCompletingSubmitting] = useState(false);

  const fetchSharesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'feed') {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category !== 'ALL') params.category = category;
        const data = await shareService.getShares(params);
        setShares(data.results || data || []);
      } else if (activeTab === 'mine') {
        const data = await shareService.getMyShares();
        setMyShares(data.results || data || []);
      } else if (activeTab === 'requests') {
        const data = await shareService.getMyRequests();
        setMyRequests(data.results || data || []);
      } else if (activeTab === 'saved') {
        const data = await shareService.getShares({ scope: 'saved' });
        setShares(data.results || data || []);
      }
    } catch (err) {
      console.error('Failed to load community shares:', err);
      setError('Unable to load community marketplace data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, category]);

  useEffect(() => {
    fetchSharesData();
  }, [fetchSharesData]);

  const handleToggleSave = async (shareId) => {
    try {
      await shareService.toggleSaveShare(shareId);
      fetchSharesData();
    } catch (err) {
      console.error('Failed to toggle save share:', err);
    }
  };

  const handleOpenRequestModal = (share) => {
    setRequestingShare(share);
    setRequestQuantity(share.quantity ? String(share.quantity) : '1');
    setRequestMessage('');
    setRequestError('');
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!requestingShare) return;
    setRequestSubmitting(true);
    setRequestError('');

    try {
      await shareService.requestShare(requestingShare.id, {
        quantity: parseFloat(requestQuantity),
        message: requestMessage
      });
      setRequestingShare(null);
      fetchSharesData();
    } catch (err) {
      const errData = err.response?.data;
      setRequestError(errData?.message || errData?.quantity?.[0] || 'Failed to submit share request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await shareService.approveRequest(requestId);
      fetchSharesData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve request.');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await shareService.rejectRequest(requestId);
      fetchSharesData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request.');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await shareService.cancelRequest(requestId);
      fetchSharesData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const handleCancelShare = async (shareId) => {
    if (!window.confirm('Are you sure you want to cancel this food share?')) return;
    try {
      await shareService.cancelShare(shareId);
      fetchSharesData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel food share.');
    }
  };

  const handleConfirmCompleteHandover = async () => {
    if (!completingRequest) return;
    setCompletingSubmitting(true);
    try {
      await shareService.completeRequest(completingRequest.id);
      setCompletingRequest(null);
      fetchSharesData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete handover.');
    } finally {
      setCompletingSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="text-[11px] font-bold bg-[#DCEFE3] text-[#1F6F4A] px-2.5 py-0.5 rounded-full border border-[#7FAF8A]/40">Available</span>;
      case 'PARTIALLY_CLAIMED':
        return <span className="text-[11px] font-bold bg-[#FFF4E5] text-[#E6A23C] px-2.5 py-0.5 rounded-full border border-[#FFE0B2]">Partially Claimed</span>;
      case 'CLAIMED':
      case 'COMPLETED':
        return <span className="text-[11px] font-bold bg-[#F8FAF6] text-[#66736B] px-2.5 py-0.5 rounded-full border border-[#E3E9E4]">Completed</span>;
      case 'CANCELLED':
        return <span className="text-[11px] font-bold bg-[#FDF2F2] text-[#D9534F] px-2.5 py-0.5 rounded-full border border-[#F8B4B4]/40">Cancelled</span>;
      case 'EXPIRED':
        return <span className="text-[11px] font-bold bg-[#F8FAF6] text-[#66736B] px-2.5 py-0.5 rounded-full border border-[#E3E9E4]">Expired</span>;
      default:
        return null;
    }
  };

  const renderRequestStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-[11px] font-bold bg-[#FFF4E5] text-[#E6A23C] px-2.5 py-0.5 rounded-full border border-[#FFE0B2]">Pending Approval</span>;
      case 'APPROVED':
        return <span className="text-[11px] font-bold bg-[#DCEFE3] text-[#1F6F4A] px-2.5 py-0.5 rounded-full border border-[#7FAF8A]/40">Approved</span>;
      case 'REJECTED':
        return <span className="text-[11px] font-bold bg-[#FDF2F2] text-[#D9534F] px-2.5 py-0.5 rounded-full border border-[#F8B4B4]/40">Declined</span>;
      case 'CANCELLED':
        return <span className="text-[11px] font-bold bg-[#F8FAF6] text-[#66736B] px-2.5 py-0.5 rounded-full border border-[#E3E9E4]">Cancelled</span>;
      case 'COMPLETED':
        return <span className="text-[11px] font-bold bg-[#EBF3FE] text-[#2563EB] px-2.5 py-0.5 rounded-full border border-[#2563EB]/30">Handover Complete</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#174F37] via-[#1F6F4A] to-[#2E8B57] text-white p-6 sm:p-8 rounded-[16px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#DCEFE3] border border-white/20">
            <Building2 className="w-3.5 h-3.5 text-[#E8B44F]" />
            <span>{user?.display_apartment_name} • Flat {user?.flat_number || 'N/A'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Community Food Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-[#DCEFE3]/90 leading-relaxed">
            Discover surplus food shared by neighbors in your apartment building or offer your own surplus food.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/share-food')}
            className="w-full sm:w-auto px-5 py-3 rounded-[12px] bg-white text-[#1F6F4A] hover:bg-[#DCEFE3] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Share Surplus Food</span>
          </button>
        </div>
      </div>

      {/* Navigation Scope Tabs */}
      <div className="bg-white rounded-[16px] p-4 border border-[#E3E9E4] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E3E9E4] pb-3 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'feed'
                ? 'bg-[#1F6F4A] text-white shadow-xs'
                : 'bg-[#F8FAF6] text-[#66736B] hover:bg-[#E3E9E4]/60 border border-[#E3E9E4]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>Community Marketplace</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'mine'
                ? 'bg-[#1F6F4A] text-white shadow-xs'
                : 'bg-[#F8FAF6] text-[#66736B] hover:bg-[#E3E9E4]/60 border border-[#E3E9E4]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              <span>My Shares</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'requests'
                ? 'bg-[#1F6F4A] text-white shadow-xs'
                : 'bg-[#F8FAF6] text-[#66736B] hover:bg-[#E3E9E4]/60 border border-[#E3E9E4]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>My Requests</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'saved'
                ? 'bg-[#1F6F4A] text-white shadow-xs'
                : 'bg-[#F8FAF6] text-[#66736B] hover:bg-[#E3E9E4]/60 border border-[#E3E9E4]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" />
              <span>Saved Shares</span>
            </span>
          </button>

        </div>

        {/* Search & Category Filter Controls (Shown in Feed mode) */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-[#98A39D] absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food shares by name, category, or details..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: COMMUNITY MARKETPLACE FEED */}
      {(activeTab === 'feed' || activeTab === 'saved') && (
        <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Scanning community marketplace...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium text-center">
              {error}
            </div>
          ) : shares.length === 0 ? (
            <div className="py-12 border border-dashed border-[#E3E9E4] rounded-[16px] text-center space-y-3 bg-[#F8FAF6]/50">
              <div className="w-12 h-12 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#17251E]">
                {activeTab === 'saved' ? 'No Saved Shares' : 'No Community Shares Available'}
              </h3>
              <p className="text-xs text-[#66736B] max-w-sm mx-auto">
                {activeTab === 'saved'
                  ? 'Bookmark food shares you are interested in to find them here.'
                  : 'No surplus food shares matched your search criteria. Be the first to share food!'}
              </p>
              {activeTab === 'feed' && (
                <button
                  onClick={() => navigate('/share-food')}
                  className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#174F37]"
                >
                  Share Food Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shares.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[16px] border border-[#E3E9E4] p-5 shadow-xs hover:border-[#7FAF8A] transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
                      {item.food_photo_url ? (
                        <img
                          src={item.food_photo_url}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover border border-[#E3E9E4] shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center font-bold text-xl shrink-0">
                          {item.title ? item.title.charAt(0).toUpperCase() : 'S'}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#DCEFE3] text-[#1F6F4A] px-2 py-0.5 rounded-full">
                            {item.food_category}
                          </span>
                          <button
                            onClick={() => handleToggleSave(item.id)}
                            className="p-1 text-[#66736B] hover:text-[#E8B44F] transition-colors"
                            title={item.is_saved ? 'Remove Bookmark' : 'Save Share'}
                          >
                            {item.is_saved ? (
                              <BookmarkCheck className="w-4 h-4 text-[#E8B44F] fill-[#E8B44F]" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <h3 className="text-sm font-bold text-[#17251E] truncate mt-1 group-hover:text-[#1F6F4A] transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-xs font-bold text-[#1F6F4A] mt-0.5">
                          {item.quantity} {item.unit} available
                        </p>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-[#66736B] bg-[#F8FAF6] p-2.5 rounded-[10px] border border-[#E3E9E4] line-clamp-2 mb-3">
                        "{item.description}"
                      </p>
                    )}

                    {/* Shared By details */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#66736B] pt-3 border-t border-[#E3E9E4]">
                      <div>
                        <span className="text-[#98A39D] block text-[10px] uppercase font-bold">Shared By</span>
                        <span className="font-semibold text-[#17251E] truncate block">
                          {item.owner_name} (Flat {item.owner_flat || 'N/A'})
                        </span>
                      </div>
                      <div>
                        <span className="text-[#98A39D] block text-[10px] uppercase font-bold">Expiry Date</span>
                        <span className="font-semibold text-[#17251E]">{item.expiry_date || 'N/A'}</span>
                      </div>
                    </div>

                    {item.pickup_note && (
                      <p className="text-[11px] text-[#E6A23C] bg-[#FFF4E5] p-2 rounded-[8px] border border-[#FFE0B2] font-medium mt-2.5 truncate">
                        📍 {item.pickup_note}
                      </p>
                    )}
                  </div>

                  {/* Action Row */}
                  <div className="pt-3 border-t border-[#E3E9E4]">
                    {item.is_owner ? (
                      <div className="p-2 rounded-[8px] bg-[#F8FAF6] text-center text-xs text-[#66736B] font-semibold border border-[#E3E9E4]">
                        Your Food Share
                      </div>
                    ) : item.user_request ? (
                      <div className="p-2 rounded-[8px] bg-[#DCEFE3] text-center text-xs text-[#1F6F4A] font-semibold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Request {item.user_request.status}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenRequestModal(item)}
                        className="w-full py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Request Food</span>
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY SHARES */}
      {activeTab === 'mine' && (
        <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
            <div>
              <h2 className="text-base font-bold text-[#17251E]">My Food Shares</h2>
              <p className="text-xs text-[#66736B]">Manage your active shares and approve incoming requests from neighbors.</p>
            </div>
            <button
              onClick={() => navigate('/share-food')}
              className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Share Food</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : myShares.length === 0 ? (
            <div className="py-10 text-center text-[#66736B] text-xs">
              You haven't posted any food shares yet.
            </div>
          ) : (
            <div className="space-y-4">
              {myShares.map((share) => (
                <div key={share.id} className="p-4 rounded-[16px] border border-[#E3E9E4] bg-[#F8FAF6] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E9E4]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#17251E]">{share.title}</h3>
                        {renderStatusBadge(share.status)}
                      </div>
                      <p className="text-xs text-[#66736B] mt-0.5">
                        Quantity Remaining: <strong className="text-[#17251E]">{share.quantity} {share.unit}</strong> (Initial: {share.initial_quantity} {share.unit})
                      </p>
                    </div>

                    {share.status !== 'CANCELLED' && share.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCancelShare(share.id)}
                        className="px-3 py-1.5 rounded-[8px] bg-[#FDF2F2] hover:bg-[#fbdada] text-[#D9534F] text-xs font-semibold self-start sm:self-auto border border-[#F8B4B4]/40"
                      >
                        Cancel Share
                      </button>
                    )}
                  </div>

                  {/* Incoming Requests Section */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#17251E] block">
                      Incoming Requests ({share.requests ? share.requests.length : 0})
                    </span>

                    {(!share.requests || share.requests.length === 0) ? (
                      <p className="text-xs text-[#66736B] italic">No requests received yet for this share.</p>
                    ) : (
                      <div className="space-y-2">
                        {share.requests.map((req) => (
                          <div key={req.id} className="p-3 bg-white rounded-[12px] border border-[#E3E9E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#17251E]">{req.requester_name}</span>
                                <span className="text-[#66736B]">(Flat {req.requester_flat || 'N/A'})</span>
                                {renderRequestStatusBadge(req.status)}
                              </div>
                              <p className="text-[#66736B]">
                                Requested <strong className="text-[#17251E]">{req.quantity} {share.unit}</strong>
                                {req.message && <span> • "{req.message}"</span>}
                              </p>
                            </div>

                            {/* Request Actions */}
                            <div className="flex items-center gap-2">
                              {req.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApproveRequest(req.id)}
                                    className="px-3 py-1.5 rounded-[8px] bg-[#1F6F4A] hover:bg-[#174F37] text-white font-semibold text-xs flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectRequest(req.id)}
                                    className="px-3 py-1.5 rounded-[8px] bg-[#FDF2F2] text-[#D9534F] hover:bg-[#fbdada] font-semibold text-xs border border-[#F8B4B4]/40"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}

                              {req.status === 'APPROVED' && (
                                <button
                                  onClick={() => setCompletingRequest(req)}
                                  className="px-3 py-1.5 rounded-[8px] bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-xs flex items-center gap-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Complete Handover</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-6">
          <div className="pb-3 border-b border-[#E3E9E4]">
            <h2 className="text-base font-bold text-[#17251E]">My Outgoing Share Requests</h2>
            <p className="text-xs text-[#66736B]">Track the status of food items you have requested from neighbors.</p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-[#1F6F4A]">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="py-10 text-center text-[#66736B] text-xs">
              You haven't requested any shared food yet. Browse the Marketplace to find food!
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-[14px] border border-[#E3E9E4] bg-[#F8FAF6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#17251E]">{req.share_title}</h3>
                      {renderRequestStatusBadge(req.status)}
                    </div>
                    <p className="text-xs text-[#66736B] mt-1">
                      Owner: <strong className="text-[#17251E]">{req.share_owner_name} (Flat {req.share_owner_flat || 'N/A'})</strong> • Quantity Requested: <strong className="text-[#17251E]">{req.quantity} {req.share_unit}</strong>
                    </p>
                    {req.message && (
                      <p className="text-[11px] text-[#66736B] italic mt-0.5">"{req.message}"</p>
                    )}
                  </div>

                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      className="px-3 py-1.5 rounded-[8px] bg-white border border-[#E3E9E4] text-[#66736B] hover:bg-[#F8FAF6] text-xs font-semibold self-start sm:self-auto"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REQUEST FOOD MODAL */}
      {requestingShare && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 border border-[#E3E9E4] shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17251E]">Request Food Share</h3>
                  <p className="text-[11px] text-[#66736B]">Submit request to {requestingShare.owner_name}</p>
                </div>
              </div>
              <button onClick={() => setRequestingShare(null)} className="p-1 rounded-lg text-[#66736B] hover:bg-[#F8FAF6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestError && (
              <div className="p-3 rounded-[10px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium">
                {requestError}
              </div>
            )}

            <form onSubmit={handleSaveRequest} className="space-y-4">
              <div className="p-3 rounded-[10px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1 text-xs">
                <span className="font-bold text-[#17251E] block">{requestingShare.title}</span>
                <span className="text-[#66736B] block">Available: {requestingShare.quantity} {requestingShare.unit}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Quantity Requested ({requestingShare.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={requestingShare.quantity}
                  value={requestQuantity}
                  onChange={(e) => setRequestQuantity(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">Message to Owner (Optional)</label>
                <input
                  type="text"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="e.g., Hi! I can pick this up around 6 PM today."
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              <div className="pt-3 border-t border-[#E3E9E4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestingShare(null)}
                  className="px-4 py-2 rounded-[10px] border border-[#E3E9E4] text-xs font-semibold text-[#66736B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestSubmitting}
                  className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold flex items-center gap-2"
                >
                  {requestSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE HANDOVER MODAL */}
      {completingRequest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] max-w-sm w-full p-6 border border-[#E3E9E4] shadow-xl text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17251E]">Complete Food Handover?</h3>
              <p className="text-xs text-[#66736B] mt-1">
                Confirm that <strong className="text-[#17251E]">{completingRequest.quantity} {completingRequest.share_unit}</strong> of <strong className="text-[#17251E]">{completingRequest.share_title}</strong> has been handed over to <strong className="text-[#17251E]">{completingRequest.requester_name}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompletingRequest(null)}
                className="px-4 py-2 rounded-[10px] border border-[#E3E9E4] bg-white text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={completingSubmitting}
                onClick={handleConfirmCompleteHandover}
                className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {completingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Completion'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityPage;
