import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import alertService from '../services/alertService';
import consumptionService from '../services/consumptionService';
import wasteService from '../services/wasteService';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Loader2, 
  Utensils, 
  Flame, 
  Share2,
  X, 
  Package, 
  Calendar, 
  Building2,
  RefreshCw
} from 'lucide-react';

const TABS = [
  { id: 'ALL', label: 'All Items' },
  { id: 'URGENT', label: 'Urgent (≤2d)', color: '#D9534F' },
  { id: 'WARNING', label: 'Warning (3-5d)', color: '#E6A23C' },
  { id: 'GOOD', label: 'Good (>5d)', color: '#1F6F4A' },
  { id: 'EXPIRED', label: 'Expired', color: '#66736B' },
];

const WASTE_REASONS = [
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'SPOILED', label: 'Spoiled / Moldy' },
  { value: 'BOUGHT_TOO_MUCH', label: 'Bought Too Much' },
  { value: 'NOT_CONSUMED', label: 'Leftover / Not Consumed' },
  { value: 'OTHER', label: 'Other' },
];

export const AlertsPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL');

  // Consume Modal State
  const [consumingItem, setConsumingItem] = useState(null);
  const [consumeQuantity, setConsumeQuantity] = useState('');
  const [consumeNotes, setConsumeNotes] = useState('');
  const [consumeSubmitting, setConsumeSubmitting] = useState(false);
  const [consumeError, setConsumeError] = useState('');

  // Waste Modal State
  const [wastingItem, setWastingItem] = useState(null);
  const [wasteQuantity, setWasteQuantity] = useState('');
  const [wasteReason, setWasteReason] = useState('EXPIRED');
  const [wasteDescription, setWasteDescription] = useState('');
  const [wasteSubmitting, setWasteSubmitting] = useState(false);
  const [wasteError, setWasteError] = useState('');

  const fetchSummaryData = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await alertService.getAlertSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load alert summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchAlertsData = useCallback(async () => {
    setAlertsLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeTab !== 'ALL') {
        params.priority = activeTab;
      }
      const data = await alertService.getAlerts(params);
      setAlerts(data.results || data || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Unable to load alert data. Please try again.');
    } finally {
      setAlertsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  useEffect(() => {
    fetchAlertsData();
  }, [fetchAlertsData]);

  const refreshAll = () => {
    fetchSummaryData();
    fetchAlertsData();
  };

  const handleOpenConsume = (item) => {
    setConsumingItem(item);
    setConsumeQuantity(item.quantity ? String(item.quantity) : '1');
    setConsumeNotes('');
    setConsumeError('');
  };

  const handleSaveConsume = async (e) => {
    e.preventDefault();
    if (!consumingItem) return;
    setConsumeSubmitting(true);
    setConsumeError('');

    try {
      await consumptionService.consumeFood(consumingItem.id, {
        quantity: parseFloat(consumeQuantity),
        notes: consumeNotes
      });
      setConsumingItem(null);
      refreshAll();
    } catch (err) {
      const errData = err.response?.data;
      setConsumeError(errData?.error || errData?.message || errData?.quantity?.[0] || 'Failed to record consumption.');
    } finally {
      setConsumeSubmitting(false);
    }
  };

  const handleOpenWaste = (item) => {
    setWastingItem(item);
    setWasteQuantity(item.quantity ? String(item.quantity) : '1');
    setWasteReason(item.days_until_expiry < 0 ? 'EXPIRED' : 'SPOILED');
    setWasteDescription('');
    setWasteError('');
  };

  const handleSaveWaste = async (e) => {
    e.preventDefault();
    if (!wastingItem) return;
    setWasteSubmitting(true);
    setWasteError('');

    try {
      await wasteService.wasteFood(wastingItem.id, {
        quantity: parseFloat(wasteQuantity),
        waste_reason: wasteReason,
        description: wasteDescription
      });
      setWastingItem(null);
      refreshAll();
    } catch (err) {
      const errData = err.response?.data;
      setWasteError(errData?.error || errData?.message || errData?.quantity?.[0] || 'Failed to record waste.');
    } finally {
      setWasteSubmitting(false);
    }
  };

  // Helper for rendering Expiry Progress Bar
  const renderProgressBar = (item) => {
    const daysLeft = item.days_until_expiry;
    let barColor = '#1F6F4A'; // Good
    let pct = 100;

    if (daysLeft < 0) {
      barColor = '#66736B'; // Expired
      pct = 100;
    } else if (daysLeft <= 2) {
      barColor = '#D9534F'; // Urgent
      pct = Math.max(10, Math.min(100, (daysLeft / 5) * 100));
    } else if (daysLeft <= 5) {
      barColor = '#E6A23C'; // Warning
      pct = Math.max(30, Math.min(100, (daysLeft / 7) * 100));
    } else {
      pct = Math.min(100, (daysLeft / 14) * 100);
    }

    return (
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-[#66736B]">Freshness Window</span>
          <span style={{ color: barColor }}>
            {daysLeft < 0 ? 'Expired' : `${daysLeft} days remaining`}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E3E9E4] overflow-hidden">
          <div 
            className="h-full transition-all duration-500 rounded-full"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
    );
  };

  const renderPriorityBadge = (priority, daysLeft) => {
    if (priority === 'EXPIRED' || daysLeft < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#F8FAF6] text-[#66736B] border border-[#E3E9E4] px-2.5 py-0.5 rounded-full">
          <AlertOctagon className="w-3 h-3 text-[#66736B]" />
          <span>Expired</span>
        </span>
      );
    }
    if (priority === 'URGENT' || daysLeft <= 2) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FDF2F2] text-[#D9534F] border border-[#F8B4B4]/40 px-2.5 py-0.5 rounded-full animate-pulse">
          <AlertTriangle className="w-3 h-3 text-[#D9534F]" />
          <span>Urgent</span>
        </span>
      );
    }
    if (priority === 'WARNING' || daysLeft <= 5) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FFF4E5] text-[#E6A23C] border border-[#FFE0B2] px-2.5 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-[#E6A23C]" />
          <span>Warning</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCEFE3] text-[#1F6F4A] border border-[#7FAF8A]/40 px-2.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3 text-[#1F6F4A]" />
        <span>Fresh</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#174F37] via-[#1F6F4A] to-[#2E8B57] text-white p-6 sm:p-8 rounded-[16px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#DCEFE3] border border-white/20">
            <Bell className="w-3.5 h-3.5 text-[#E8B44F]" />
            <span>FoodLoop Expiry Engine v3.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Food Expiry Alerts & Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-[#DCEFE3]/90 leading-relaxed">
            Prioritized automated alerts to prevent food waste. Take immediate action on items nearing expiration.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={refreshAll}
            className="px-4 py-2.5 rounded-[12px] bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-all backdrop-blur-md border border-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${(summaryLoading || alertsLoading) ? 'animate-spin' : ''}`} />
            <span>Refresh Engine</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Urgent */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Urgent (≤2 Days)</span>
            <span className="text-2xl font-bold text-[#D9534F]">
              {summaryLoading ? '...' : summary?.urgent_count || 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F2] text-[#D9534F] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Warning */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Warning (3-5 Days)</span>
            <span className="text-2xl font-bold text-[#E6A23C]">
              {summaryLoading ? '...' : summary?.warning_count || 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4E5] text-[#E6A23C] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Good */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Good (&gt;5 Days)</span>
            <span className="text-2xl font-bold text-[#1F6F4A]">
              {summaryLoading ? '...' : summary?.good_count || 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Expired */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Expired Items</span>
            <span className="text-2xl font-bold text-[#66736B]">
              {summaryLoading ? '...' : summary?.expired_count || 0}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F8FAF6] text-[#66736B] border border-[#E3E9E4] flex items-center justify-center shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Priority Filter Tabs & List Section */}
      <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-6">

        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E9E4]">
          <div>
            <h2 className="text-lg font-bold text-[#17251E]">Food Expiry Queue</h2>
            <p className="text-xs text-[#66736B]">Items grouped by urgency to take quick action</p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#1F6F4A] text-white shadow-xs'
                      : 'bg-[#F8FAF6] text-[#66736B] hover:bg-[#E3E9E4]/60 border border-[#E3E9E4]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerts List Grid */}
        {alertsLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-medium">Checking expiry engine...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium text-center">
            {error}
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-12 border border-dashed border-[#E3E9E4] rounded-[16px] text-center space-y-3 bg-[#F8FAF6]/50">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#17251E]">You're All Caught Up!</h3>
            <p className="text-xs text-[#66736B] max-w-sm mx-auto">
              No food items matched the selected priority filter tab. All your pantry items are well managed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-[16px] border border-[#E3E9E4] p-4 shadow-xs hover:border-[#7FAF8A] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  
                  {/* Card Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {item.photo_url ? (
                      <img 
                        src={item.photo_url} 
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E3E9E4] shrink-0" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center font-bold text-lg shrink-0">
                        {item.name ? item.name.charAt(0).toUpperCase() : 'F'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#17251E] truncate group-hover:text-[#1F6F4A] transition-colors">
                          {item.name}
                        </h3>
                        {renderPriorityBadge(item.alert_priority, item.days_until_expiry)}
                      </div>

                      <p className="text-xs text-[#66736B] mt-0.5 flex items-center gap-2">
                        <span className="font-bold text-[#17251E]">{item.quantity} {item.unit}</span>
                        <span>•</span>
                        <span className="text-[11px] bg-[#F8FAF6] px-2 py-0.5 rounded-full border border-[#E3E9E4]">
                          {item.category}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Expiry Visual Progress Bar */}
                  <div className="pt-2 pb-1">
                    {renderProgressBar(item)}
                  </div>

                  {/* Storage & Expiry details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#66736B] pt-3 border-t border-[#E3E9E4]">
                    <div>
                      <span className="text-[#98A39D] block text-[10px] uppercase font-bold">Storage</span>
                      <span className="font-semibold text-[#17251E]">{item.storage_location}</span>
                    </div>
                    <div>
                      <span className="text-[#98A39D] block text-[10px] uppercase font-bold">Expiry Date</span>
                      <span className="font-semibold text-[#17251E]">{item.expiry_date}</span>
                    </div>
                  </div>

                </div>

                {/* Card Action Buttons: Consume / Share / Waste */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E3E9E4] gap-2">
                  <button
                    onClick={() => handleOpenConsume(item)}
                    className="flex-1 py-1.5 rounded-[8px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Consume</span>
                  </button>

                  <button
                    onClick={() => navigate(`/share-food?food_id=${item.id}`)}
                    className="flex-1 py-1.5 rounded-[8px] bg-[#EBF3FE] hover:bg-[#d8e6fd] text-[#2563EB] text-xs font-semibold flex items-center justify-center gap-1 border border-[#2563EB]/20 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={() => handleOpenWaste(item)}
                    className="flex-1 py-1.5 rounded-[8px] bg-[#FDF2F2] hover:bg-[#fbdada] text-[#D9534F] text-xs font-semibold flex items-center justify-center gap-1 border border-[#F8B4B4]/40 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Waste</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* CONSUME MODAL */}
      {consumingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 border border-[#E3E9E4] shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17251E]">Consume Food Item</h3>
                  <p className="text-[11px] text-[#66736B]">Log consumed quantity for {consumingItem.name}</p>
                </div>
              </div>
              <button onClick={() => setConsumingItem(null)} className="p-1 rounded-lg text-[#66736B] hover:bg-[#F8FAF6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {consumeError && (
              <div className="p-3 rounded-[10px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium">
                {consumeError}
              </div>
            )}

            <form onSubmit={handleSaveConsume} className="space-y-4">
              <div className="p-3 rounded-[10px] bg-[#F8FAF6] border border-[#E3E9E4] flex items-center justify-between text-xs">
                <span className="text-[#66736B]">Available in Pantry:</span>
                <span className="font-bold text-[#17251E]">{consumingItem.quantity} {consumingItem.unit}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Quantity Consumed ({consumingItem.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={consumingItem.quantity}
                  value={consumeQuantity}
                  onChange={(e) => setConsumeQuantity(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">Notes (Optional)</label>
                <input
                  type="text"
                  value={consumeNotes}
                  onChange={(e) => setConsumeNotes(e.target.value)}
                  placeholder="e.g., Used for dinner salad"
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              <div className="pt-3 border-t border-[#E3E9E4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConsumingItem(null)}
                  className="px-4 py-2 rounded-[10px] border border-[#E3E9E4] text-xs font-semibold text-[#66736B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={consumeSubmitting}
                  className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold flex items-center gap-2"
                >
                  {consumeSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Consumption'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WASTE MODAL */}
      {wastingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] max-w-md w-full p-6 border border-[#E3E9E4] shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FDF2F2] text-[#D9534F] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17251E]">Log Food Waste</h3>
                  <p className="text-[11px] text-[#66736B]">Record wasted quantity for {wastingItem.name}</p>
                </div>
              </div>
              <button onClick={() => setWastingItem(null)} className="p-1 rounded-lg text-[#66736B] hover:bg-[#F8FAF6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {wasteError && (
              <div className="p-3 rounded-[10px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium">
                {wasteError}
              </div>
            )}

            <form onSubmit={handleSaveWaste} className="space-y-4">
              <div className="p-3 rounded-[10px] bg-[#F8FAF6] border border-[#E3E9E4] flex items-center justify-between text-xs">
                <span className="text-[#66736B]">Available in Pantry:</span>
                <span className="font-bold text-[#17251E]">{wastingItem.quantity} {wastingItem.unit}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17251E] block">
                    Quantity Wasted
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={wastingItem.quantity}
                    value={wasteQuantity}
                    onChange={(e) => setWasteQuantity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#D9534F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17251E] block">Waste Reason</label>
                  <select
                    value={wasteReason}
                    onChange={(e) => setWasteReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#D9534F]"
                  >
                    {WASTE_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">Description / Reason Details</label>
                <input
                  type="text"
                  value={wasteDescription}
                  onChange={(e) => setWasteDescription(e.target.value)}
                  placeholder="e.g., Forgotten in back of fridge"
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#D9534F]"
                />
              </div>

              <div className="pt-3 border-t border-[#E3E9E4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWastingItem(null)}
                  className="px-4 py-2 rounded-[10px] border border-[#E3E9E4] text-xs font-semibold text-[#66736B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={wasteSubmitting}
                  className="px-4 py-2 rounded-[10px] bg-[#D9534F] hover:bg-[#c9302c] text-white text-xs font-semibold flex items-center gap-2"
                >
                  {wasteSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Waste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AlertsPage;
