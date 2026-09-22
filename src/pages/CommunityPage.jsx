import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import shareService from '../services/shareService';
import reportService from '../services/reportService';
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
  UserCheck,
  Flag,
  Inbox,
  ArrowRight
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'feed';
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab); // 'feed' | 'incoming' | 'requests' | 'mine' | 'saved'
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  // Data states
  const [feedShares, setFeedShares] = useState([]);
  const [myShares, setMyShares] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [savedShares, setSavedShares] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Request Modal State
  const [requestModalShare, setRequestModalShare] = useState(null);
  const [requestQty, setRequestQty] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestModalError, setRequestModalError] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Report Modal State
  const [reportModalShare, setReportModalShare] = useState(null);
  const [reportReason, setReportReason] = useState('INAPPROPRIATE_CONTENT');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const showNotification = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (activeTab === 'feed') {
        const data = await shareService.getCommunityShares({ search, category });
        setFeedShares(data.results || data || []);
      } else if (activeTab === 'mine') {
        const data = await shareService.getMyShares();
        setMyShares(data.results || data || []);
      } else if (activeTab === 'incoming') {
        const data = await shareService.getIncomingRequests();
        setIncomingRequests(data.results || data || []);
      } else if (activeTab === 'requests') {
        const data = await shareService.getMyRequests();
        setMyRequests(data.results || data || []);
      } else if (activeTab === 'saved') {
        const data = await shareService.getCommunityShares({ scope: 'saved' });
        setSavedShares(data.results || data || []);
      }
    } catch (err) {
      console.error('Failed to load marketplace data:', err);
      showNotification('Failed to load marketplace items.', true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, search, category]);

  useEffect(() => {
    loadData();
    // Fetch incoming and outgoing request counts indicator
    Promise.all([
      shareService.getIncomingRequests().catch(() => ({ results: [] })),
      shareService.getMyRequests().catch(() => ({ results: [] }))
    ]).then(([incData, myReqData]) => {
      if (incData) setIncomingRequests(incData.results || incData || []);
      if (myReqData) setMyRequests(myReqData.results || myReqData || []);
    });
  }, [loadData]);

  // Compute incoming requests for owner across all owned shares
  const allIncomingRequests = incomingRequests.length > 0 ? incomingRequests : myShares.flatMap(share => 
    (share.requests || []).map(req => ({
      ...req,
      share_id: req.share_id || share.id,
      share_title: req.share_title || share.title,
      share_unit: req.share_unit || share.unit,
      share_pickup_note: share.pickup_note
    }))
  );
  const pendingIncomingCount = allIncomingRequests.filter(r => r.status === 'PENDING').length;
  const activeOutgoingCount = myRequests.filter(r => r.status === 'PENDING' || r.status === 'APPROVED').length;

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleFavorite = async (shareId) => {
    try {
      const res = await shareService.toggleFavoriteShare(shareId);
      showNotification(res.message);
      
      setFeedShares(prev => prev.map(item => 
        item.id === shareId ? { ...item, is_saved: res.is_saved } : item
      ));
      
      if (activeTab === 'saved' && !res.is_saved) {
        setSavedShares(prev => prev.filter(item => item.id !== shareId));
      }
    } catch (err) {
      showNotification('Failed to update saved favorites.', true);
    }
  };

  const handleOpenRequestModal = (share) => {
    setRequestModalShare(share);
    setRequestQty(share.quantity.toString());
    setRequestMessage('');
    setRequestModalError('');
  };

  const handleCreateRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestModalShare) return;

    setSubmittingRequest(true);
    setRequestModalError('');
    try {
      const payload = {
        quantity: parseFloat(requestQty),
        message: requestMessage
      };

      const res = await shareService.createShareRequest(requestModalShare.id, payload);
      showNotification(res.message || 'Request submitted successfully!');
      setRequestModalShare(null);
      // Automatically switch to 'My Outgoing Requests' tab so requester immediately sees their request status!
      handleTabChange('requests');
      loadData();
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = errData?.message || errData?.quantity?.[0] || 'Failed to submit request.';
      setRequestModalError(errMsg);
      showNotification(errMsg, true);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleCancelShare = async (shareId) => {
    if (!window.confirm('Are you sure you want to cancel this food share?')) return;
    try {
      const res = await shareService.cancelFoodShare(shareId);
      showNotification(res.message);
      loadData();
    } catch (err) {
      showNotification('Failed to cancel share.', true);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const res = await shareService.approveShareRequest(requestId);
      showNotification(res.message);
      loadData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to approve request.', true);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const res = await shareService.rejectShareRequest(requestId);
      showNotification(res.message);
      loadData();
    } catch (err) {
      showNotification('Failed to reject request.', true);
    }
  };

  const handleCompleteHandover = async (requestId) => {
    if (!window.confirm('Confirm that food handover is complete?')) return;
    try {
      const res = await shareService.completeShareRequest(requestId);
      showNotification(res.message);
      loadData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to complete handover.', true);
    }
  };

  // Report submission handler
  const handleOpenReportModal = (share) => {
    setReportModalShare(share);
    setReportReason('INAPPROPRIATE_CONTENT');
    setReportDescription('');
  };

  const handleCreateReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportModalShare) return;

    setSubmittingReport(true);
    try {
      const payload = {
        target_type: 'FOOD_SHARE',
        target_id: reportModalShare.id.toString(),
        reason: reportReason,
        description: reportDescription
      };

      const res = await reportService.createReport(payload);
      showNotification(res.message);
      setReportModalShare(null);
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.errors?.non_field_errors?.[0] || errData?.message || 'Failed to submit report.';
      showNotification(msg, true);
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#17251E] text-white rounded-[16px] p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Community Food Sharing</h1>
            <span className="bg-[#DCEFE3] text-[#1F6F4A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#7FAF8A]/40">
              {user?.display_apartment_name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#98A39D] max-w-xl">
            Share unneeded surplus food with neighbors in your apartment building. Reduce waste, save money, and build community!
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/share-food')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white font-semibold text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Share Food</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-[10px] bg-[#24352B] hover:bg-[#2F4438] text-white transition-colors border border-[#34483B]"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#7FAF8A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Notification Banners */}
      {actionSuccess && (
        <div className="p-4 rounded-[12px] bg-[#DCEFE3] border border-[#7FAF8A]/40 text-[#1F6F4A] text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {/* Main Tab Controls & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-[16px] border border-[#E3E9E4] shadow-xs">
        
        {/* Navigation Tabs */}
        <div className="flex items-center bg-[#F8FAF6] p-1 rounded-[12px] border border-[#E3E9E4] overflow-x-auto">
          <button
            onClick={() => handleTabChange('feed')}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'feed'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            Marketplace Feed
          </button>

          <button
            onClick={() => handleTabChange('incoming')}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'incoming'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-[#1F6F4A]" />
            <span>Incoming Requests</span>
            {pendingIncomingCount > 0 && (
              <span className="bg-[#D9534F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {pendingIncomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('requests')}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-[#1F6F4A]" />
            <span>My Outgoing Requests</span>
            {myRequests.length > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeOutgoingCount > 0
                  ? 'bg-[#1F6F4A] text-white'
                  : 'bg-[#DCEFE3] text-[#1F6F4A]'
              }`}>
                {myRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('mine')}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'mine'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            My Shares
          </button>

          <button
            onClick={() => handleTabChange('saved')}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-[#1F6F4A] shadow-xs border border-[#E3E9E4]'
                : 'text-[#66736B] hover:text-[#17251E]'
            }`}
          >
            Saved Items
          </button>
        </div>

        {/* Search & Category Filter (Feed Tab only) */}
        {activeTab === 'feed' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-[#98A39D] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search food shares..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#1F6F4A]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-medium">Loading community items...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: MARKETPLACE FEED */}
          {activeTab === 'feed' && (
            feedShares.length === 0 ? (
              <div className="bg-white rounded-[16px] p-12 text-center border border-[#E3E9E4] space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#17251E]">No Shared Food Available</h3>
                <p className="text-xs text-[#66736B] max-w-sm mx-auto">
                  There are currently no surplus food items available for request in your building feed. Be the first to share!
                </p>
                <button
                  onClick={() => navigate('/share-food')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share Food Item</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {feedShares.map((share) => {
                  const isOwner = share.is_owner || (user && (share.owner?.id === user.id || share.owner === user.id));
                  const isSaved = share.is_saved;
                  const ownerName = share.owner?.full_name || share.owner_name || 'Neighbor';
                  const ownerFlat = share.owner?.flat_number || share.owner_flat || 'N/A';
                  const hasRequested = share.has_active_request || Boolean(share.user_request);

                  return (
                    <div 
                      key={share.id}
                      className="bg-white rounded-[16px] border border-[#E3E9E4] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-5 space-y-3">
                        
                        {/* Header Badge Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DCEFE3] text-[#1F6F4A] border border-[#7FAF8A]/30">
                            {share.food_category || share.food_item?.category || 'FOOD'}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Favorite Toggle Button */}
                            <button
                              onClick={() => handleToggleFavorite(share.id)}
                              className="p-1.5 rounded-full hover:bg-[#F8FAF6] text-[#66736B] transition-colors"
                              title={isSaved ? "Remove from saved" : "Save share"}
                            >
                              {isSaved ? (
                                <BookmarkCheck className="w-4 h-4 text-[#1F6F4A] fill-[#1F6F4A]" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </button>

                            {/* Report Flag Button */}
                            {!isOwner && (
                              <button
                                onClick={() => handleOpenReportModal(share)}
                                className="p-1.5 rounded-full hover:bg-[#FDF2F2] text-[#98A39D] hover:text-[#D9534F] transition-colors"
                                title="Report listing"
                              >
                                <Flag className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-bold text-[#17251E] line-clamp-1">{share.title}</h3>
                          <p className="text-xs text-[#66736B] mt-1 line-clamp-2">
                            {share.description || share.food_name || share.food_item?.name || 'Surplus food item offered for sharing.'}
                          </p>
                        </div>

                        {/* Quantity & Expiry Badges */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <div className="px-2.5 py-1 rounded-[8px] bg-[#F8FAF6] border border-[#E3E9E4] text-xs font-semibold text-[#17251E]">
                            Available: <span className="text-[#1F6F4A]">{share.quantity} {share.unit}</span>
                          </div>

                          {(share.expiry_date || share.food_item?.expiry_date) && (
                            <div className="flex items-center gap-1 text-[11px] text-[#D97706] font-medium px-2.5 py-1 rounded-[8px] bg-[#FEF3C7]/60 border border-[#FCD34D]/40">
                              <Clock className="w-3 h-3" />
                              <span>Expires: {share.expiry_date || share.food_item.expiry_date}</span>
                            </div>
                          )}
                        </div>

                        {/* Owner & Building Info */}
                        <div className="pt-2 border-t border-[#E3E9E4] flex items-center justify-between text-[11px] text-[#66736B]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#1F6F4A] text-white flex items-center justify-center font-bold text-[9px]">
                              {ownerName.charAt(0).toUpperCase()}
                            </div>
                            <span>{ownerName} (Flat {ownerFlat})</span>
                          </div>
                        </div>

                      </div>

                      {/* Card Footer Action */}
                      <div className="p-4 bg-[#F8FAF6] border-t border-[#E3E9E4]">
                        {isOwner ? (
                          <div className="w-full py-2.5 text-center text-xs font-semibold text-[#66736B] bg-[#E3E9E4]/40 rounded-[10px] border border-[#E3E9E4]">
                            Your Shared Item
                          </div>
                        ) : hasRequested ? (
                          <div className="w-full py-2.5 text-center text-xs font-bold text-[#1F6F4A] bg-[#DCEFE3] rounded-[10px] border border-[#7FAF8A]/40 flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-[#1F6F4A]" />
                            <span>Already Requested ({share.user_request?.status || 'PENDING'})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenRequestModal(share)}
                            className="w-full py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Request Food Share</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB: INCOMING REQUESTS (OWNER MANAGER) */}
          {activeTab === 'incoming' && (
            allIncomingRequests.length === 0 ? (
              <div className="bg-white rounded-[16px] p-12 text-center border border-[#E3E9E4] space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#17251E]">No Incoming Food Requests</h3>
                <p className="text-xs text-[#66736B] max-w-sm mx-auto leading-relaxed">
                  When neighbors in your building request surplus food items you shared, their requests will appear here for your approval.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => navigate('/share-food')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Share Food Item</span>
                  </button>

                  {myRequests.length > 0 && (
                    <button
                      onClick={() => handleTabChange('requests')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#DCEFE3] text-[#1F6F4A] text-xs font-bold hover:bg-[#cbe6d4] transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>View My Outgoing Requests ({myRequests.length}) →</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {allIncomingRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E9E4]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#17251E]">{req.share_title}</h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            req.status === 'PENDING' ? 'bg-[#FEF3C7] text-[#D97706]' :
                            req.status === 'APPROVED' ? 'bg-[#DCEFE3] text-[#1F6F4A]' :
                            req.status === 'COMPLETED' ? 'bg-[#EBF3FE] text-[#2563EB]' : 'bg-[#FDF2F2] text-[#D9534F]'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#66736B] mt-1">
                          Requested by: <strong className="text-[#17251E]">{req.requester?.full_name || req.requester_name || 'Neighbor'} (Flat {req.requester?.flat_number || req.requester_flat || 'N/A'})</strong>
                        </p>
                      </div>

                      <div className="text-xs font-semibold text-[#1F6F4A] bg-[#F8FAF6] px-3 py-1.5 rounded-[8px] border border-[#E3E9E4]">
                        Requested Quantity: {req.quantity} {req.share_unit}
                      </div>
                    </div>

                    {req.message && (
                      <p className="text-xs text-[#66736B] bg-[#F8FAF6] p-3 rounded-[10px] border border-[#E3E9E4] italic">
                        "{req.message}"
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <span className="text-[11px] text-[#98A39D]">
                        Requested on: {new Date(req.created_at).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-bold shadow-xs transition-colors"
                            >
                              Approve Request
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-4 py-2 rounded-[10px] bg-[#F8FAF6] hover:bg-[#E3E9E4] text-[#66736B] text-xs font-semibold border border-[#E3E9E4]"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {req.status === 'APPROVED' && (
                          <button
                            onClick={() => handleCompleteHandover(req.id)}
                            className="px-4 py-2 rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Complete Handover & Add to Neighbor's Pantry 🎁</span>
                          </button>
                        )}

                        {req.status === 'COMPLETED' && (
                          <span className="text-xs font-bold text-[#2563EB] bg-[#EBF3FE] px-3 py-1.5 rounded-full border border-[#2563EB]/20 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Handover Completed & Added to Pantry</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: MY SHARES */}
          {activeTab === 'mine' && (
            myShares.length === 0 ? (
              <div className="bg-white rounded-[16px] p-12 text-center border border-[#E3E9E4] space-y-3">
                <h3 className="text-base font-bold text-[#17251E]">No Shares Posted Yet</h3>
                <p className="text-xs text-[#66736B]">You haven't posted any surplus food shares yet.</p>
                <button
                  onClick={() => navigate('/share-food')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share Food Now</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myShares.map((share) => (
                  <div key={share.id} className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#17251E]">{share.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            share.status === 'AVAILABLE' ? 'bg-[#DCEFE3] text-[#1F6F4A]' :
                            share.status === 'COMPLETED' ? 'bg-[#EBF3FE] text-[#2563EB]' : 'bg-[#FDF2F2] text-[#D9534F]'
                          }`}>
                            {share.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#66736B] mt-0.5">
                          {share.quantity} {share.unit} remaining (Initial: {share.initial_quantity} {share.unit})
                        </p>
                      </div>

                      {share.status !== 'CANCELLED' && share.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelShare(share.id)}
                          className="px-3 py-1.5 rounded-[8px] bg-[#FDF2F2] hover:bg-[#FEE2E2] text-[#D9534F] text-xs font-semibold border border-[#F8B4B4]/40"
                        >
                          Cancel Share
                        </button>
                      )}
                    </div>

                    {/* Incoming Requests Section */}
                    {share.requests && share.requests.length > 0 && (
                      <div className="pt-3 border-t border-[#E3E9E4] space-y-3">
                        <h4 className="text-xs font-bold text-[#17251E] flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#1F6F4A]" />
                          <span>Incoming Requests ({share.requests.length})</span>
                        </h4>

                        <div className="space-y-2">
                          {share.requests.map((req) => (
                            <div key={req.id} className="p-3 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-[#17251E]">
                                  {req.requester?.full_name || req.requester_name || 'Neighbor'} (Flat {req.requester?.flat_number || req.requester_flat || 'N/A'})
                                </div>
                                <div className="text-[11px] text-[#66736B]">
                                  Requested: <span className="font-semibold text-[#1F6F4A]">{req.quantity} {share.unit}</span>
                                  {req.message && ` • "${req.message}"`}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {req.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveRequest(req.id)}
                                      className="px-3 py-1.5 rounded-[8px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectRequest(req.id)}
                                      className="px-3 py-1.5 rounded-[8px] bg-[#F8FAF6] hover:bg-[#E3E9E4] text-[#66736B] text-xs font-semibold border border-[#E3E9E4]"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}

                                {req.status === 'APPROVED' && (
                                  <button
                                    onClick={() => handleCompleteHandover(req.id)}
                                    className="px-3.5 py-1.5 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Complete Handover</span>
                                  </button>
                                )}

                                {req.status === 'COMPLETED' && (
                                  <span className="text-xs font-bold text-[#2563EB] bg-[#EBF3FE] px-2.5 py-1 rounded-full">
                                    Handover Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: MY OUTGOING REQUESTS */}
          {activeTab === 'requests' && (
            myRequests.length === 0 ? (
              <div className="bg-white rounded-[16px] p-12 text-center border border-[#E3E9E4] space-y-3">
                <h3 className="text-base font-bold text-[#17251E]">No Active Requests</h3>
                <p className="text-xs text-[#66736B]">You haven't requested any food shares from your community yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E9E4]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#17251E]">{req.share_title || req.share?.title}</h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            req.status === 'APPROVED' ? 'bg-[#DCEFE3] text-[#1F6F4A]' :
                            req.status === 'COMPLETED' ? 'bg-[#EBF3FE] text-[#2563EB]' :
                            req.status === 'PENDING' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#FDF2F2] text-[#D9534F]'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#66736B] mt-1">
                          Owner: <strong className="text-[#17251E]">{req.share_owner_name || req.share?.owner?.full_name || 'Neighbor'} (Flat {req.share_owner_flat || req.share?.owner?.flat_number || 'N/A'})</strong>
                        </p>
                      </div>

                      <div className="text-xs font-semibold text-[#1F6F4A] bg-[#F8FAF6] px-3 py-1.5 rounded-[8px] border border-[#E3E9E4]">
                        Requested Quantity: {req.quantity} {req.share_unit || req.share?.unit}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      {req.status === 'PENDING' && (
                        <p className="text-xs text-[#D97706] font-medium flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Waiting for owner to review and approve your request...</span>
                        </p>
                      )}

                      {req.status === 'APPROVED' && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                          <p className="text-xs text-[#1F6F4A] font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approved by owner! Contact owner for pickup.</span>
                          </p>
                          <button
                            onClick={() => handleCompleteHandover(req.id)}
                            className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-bold shadow-xs shrink-0"
                          >
                            Confirm Received & Add to Pantry
                          </button>
                        </div>
                      )}

                      {req.status === 'REJECTED' && (
                        <p className="text-xs text-[#D9534F] font-medium flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>Your request was declined by the owner.</span>
                        </p>
                      )}

                      {req.status === 'COMPLETED' && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                          <p className="text-xs text-[#2563EB] font-semibold flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-[#2563EB]" />
                            <span>Handover Complete! Claimed item is in your Smart Pantry 🎁</span>
                          </p>
                          <button
                            onClick={() => navigate('/add-food')}
                            className="px-4 py-2 rounded-[10px] bg-[#EBF3FE] hover:bg-[#DBEAFE] text-[#2563EB] text-xs font-bold border border-[#2563EB]/20 shrink-0 flex items-center gap-1"
                          >
                            <span>View in Smart Pantry</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 4: SAVED ITEMS */}
          {activeTab === 'saved' && (
            savedShares.length === 0 ? (
              <div className="bg-white rounded-[16px] p-12 text-center border border-[#E3E9E4] space-y-3">
                <Bookmark className="w-8 h-8 text-[#98A39D] mx-auto" />
                <h3 className="text-base font-bold text-[#17251E]">No Saved Food Shares</h3>
                <p className="text-xs text-[#66736B]">Items you bookmark in the marketplace feed will appear here for quick access.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedShares.map((share) => (
                  <div key={share.id} className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DCEFE3] text-[#1F6F4A]">
                        {share.food_item?.category}
                      </span>
                      <button
                        onClick={() => handleToggleFavorite(share.id)}
                        className="p-1 rounded-full text-[#1F6F4A]"
                      >
                        <BookmarkCheck className="w-5 h-5 fill-[#1F6F4A]" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-[#17251E]">{share.title}</h3>
                    <p className="text-xs text-[#1F6F4A] font-semibold">{share.quantity} {share.unit} available</p>

                    <button
                      onClick={() => handleOpenRequestModal(share)}
                      className="w-full py-2 rounded-[8px] bg-[#1F6F4A] text-white text-xs font-semibold"
                    >
                      Request This Share
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* REQUEST MODAL */}
      {requestModalShare && (
        <div className="fixed inset-0 z-50 bg-[#17251E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateRequestSubmit} className="bg-white rounded-[20px] p-6 max-w-md w-full border border-[#E3E9E4] shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
              <h3 className="text-base font-bold text-[#17251E]">Request Food Share</h3>
              <button type="button" onClick={() => setRequestModalShare(null)} className="text-[#66736B] hover:text-[#17251E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestModalError && (
              <div className="p-3 rounded-[10px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{requestModalError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="p-3 rounded-[10px] bg-[#F8FAF6] border border-[#E3E9E4] text-xs space-y-1">
                <div className="font-bold text-[#17251E]">{requestModalShare.title}</div>
                <div className="text-[#66736B]">Available: {requestModalShare.quantity} {requestModalShare.unit}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Requested Quantity ({requestModalShare.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={requestModalShare.quantity}
                  value={requestQty}
                  onChange={(e) => setRequestQty(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Message to Owner (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="e.g. Hi! I can pick this up today around 6 PM."
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRequestModalShare(null)}
                className="px-4 py-2 rounded-[10px] bg-[#F8FAF6] border border-[#E3E9E4] text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-5 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold disabled:opacity-50"
              >
                {submittingRequest ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportModalShare && (
        <div className="fixed inset-0 z-50 bg-[#17251E]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateReportSubmit} className="bg-white rounded-[20px] p-6 max-w-md w-full border border-[#E3E9E4] shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
              <h3 className="text-base font-bold text-[#17251E] flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#D9534F]" />
                <span>Report Share Listing</span>
              </h3>
              <button type="button" onClick={() => setReportModalShare(null)} className="text-[#66736B] hover:text-[#17251E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-[10px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-xs space-y-1">
                <div className="font-bold text-[#17251E]">{reportModalShare.title}</div>
                <div className="text-[#66736B]">Reported to community moderation team.</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E]"
                >
                  <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
                  <option value="MISLEADING_LISTING">Misleading Listing</option>
                  <option value="SPAM">Spam / Commercial Advertising</option>
                  <option value="HARASSMENT">Harassment or Abuse</option>
                  <option value="DUPLICATE">Duplicate Listing</option>
                  <option value="OTHER">Other Safety Concern</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">Explanation / Details</label>
                <textarea
                  required
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please describe why this listing violates community standards..."
                  className="w-full px-3 py-2 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] h-24"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportModalShare(null)}
                className="px-4 py-2 rounded-[10px] bg-[#F8FAF6] border border-[#E3E9E4] text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReport}
                className="px-5 py-2 rounded-[10px] bg-[#D9534F] hover:bg-[#C9302C] text-white text-xs font-semibold disabled:opacity-50"
              >
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default CommunityPage;
