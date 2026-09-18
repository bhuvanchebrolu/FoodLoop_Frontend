import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useFoods from '../hooks/useFoods';
import consumptionService from '../services/consumptionService';
import wasteService from '../services/wasteService';
import { 
  Building2, 
  Home, 
  Package, 
  Bell, 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X, 
  DollarSign, 
  Loader2, 
  Layers, 
  Box, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Apple,
  Utensils,
  Flame
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

const STORAGE_OPTIONS = [
  { value: 'ALL', label: 'All Locations' },
  { value: 'PANTRY', label: 'Pantry' },
  { value: 'REFRIGERATOR', label: 'Refrigerator' },
  { value: 'FREEZER', label: 'Freezer' },
  { value: 'KITCHEN', label: 'Kitchen' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Active Pantry Items' },
  { value: 'AVAILABLE', label: 'Available / Good' },
  { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CONSUMED', label: 'Consumed History' },
];

const SORT_OPTIONS = [
  { value: 'expiry_date', label: 'Earliest Expiry' },
  { value: '-expiry_date', label: 'Latest Expiry' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-created_at', label: 'Recently Added' },
  { value: '-quantity', label: 'Highest Quantity' },
];

const WASTE_REASONS = [
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'SPOILED', label: 'Spoiled / Moldy' },
  { value: 'BOUGHT_TOO_MUCH', label: 'Bought Too Much' },
  { value: 'NOT_CONSUMED', label: 'Leftover / Not Consumed' },
  { value: 'OTHER', label: 'Other' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    foods, 
    dashboard, 
    loading, 
    dashboardLoading, 
    error,
    page,
    setPage,
    totalPages,
    totalCount,
    search,
    setSearch,
    category,
    setCategory,
    storage,
    setStorage,
    status,
    setStatus,
    ordering,
    setOrdering,
    refreshAll,
    updateFoodItem,
    deleteFoodItem
  } = useFoods();

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('pieces');
  const [editStorage, setEditStorage] = useState('PANTRY');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editEstimatedValue, setEditEstimatedValue] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Modal State
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    setWasteReason('EXPIRED');
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

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditName(item.name || '');
    setEditCategory(item.category || 'FRUITS');
    setEditQuantity(item.quantity ? String(item.quantity) : '1');
    setEditUnit(item.unit || 'pieces');
    setEditStorage(item.storage_location || 'PANTRY');
    setEditExpiryDate(item.expiry_date || '');
    setEditEstimatedValue(item.estimated_value ? String(item.estimated_value) : '');
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditSaving(true);
    setEditError('');

    try {
      const payload = {
        name: editName,
        category: editCategory,
        quantity: editQuantity,
        unit: editUnit,
        storage_location: editStorage,
        expiry_date: editExpiryDate,
        estimated_value: editEstimatedValue || '0.00',
      };
      await updateFoodItem(editingItem.id, payload);
      setEditingItem(null);
    } catch (err) {
      const errData = err.response?.data;
      setEditError(errData?.message || 'Failed to update food item.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    try {
      await deleteFoodItem(deletingItem.id);
      setDeletingItem(null);
    } catch (err) {
      alert('Unable to remove food item. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Helper for Status Badge Styling
  const renderStatusBadge = (itemStatus, daysLeft) => {
    if (itemStatus === 'CONSUMED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#EBF3FE] text-[#2563EB] border border-[#2563EB]/30 px-2.5 py-0.5 rounded-full">
          <Utensils className="w-3 h-3" />
          <span>Consumed</span>
        </span>
      );
    }
    if (itemStatus === 'EXPIRED' || (daysLeft !== undefined && daysLeft < 0)) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FDF2F2] text-[#D9534F] border border-[#F8B4B4]/40 px-2.5 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" />
          <span>Expired</span>
        </span>
      );
    }
    if (itemStatus === 'EXPIRING_SOON' || (daysLeft !== undefined && daysLeft <= 5)) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#FFF4E5] text-[#E6A23C] border border-[#FFE0B2] px-2.5 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          <span>{daysLeft === 0 ? 'Expires Today' : `${daysLeft}d left`}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#DCEFE3] text-[#1F6F4A] border border-[#7FAF8A]/40 px-2.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        <span>Fresh</span>
      </span>
    );
  };

  // Donut Chart Math & Calculations
  const availableCount = dashboard?.available_items || 0;
  const expiringCount = dashboard?.expiring_soon || 0;
  const expiredCount = dashboard?.expired_items || 0;
  const totalItems = dashboard?.total_food_items || 0;

  const availablePct = totalItems > 0 ? Math.round((availableCount / totalItems) * 100) : 0;
  const expiringPct = totalItems > 0 ? Math.round((expiringCount / totalItems) * 100) : 0;
  const expiredPct = totalItems > 0 ? Math.max(0, 100 - availablePct - expiringPct) : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner & Quick Action */}
      <div className="bg-gradient-to-r from-[#174F37] via-[#1F6F4A] to-[#2E8B57] text-white p-6 sm:p-8 rounded-[16px] shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#DCEFE3] border border-white/20">
            <Building2 className="w-3.5 h-3.5 text-[#E8B44F]" />
            <span>{user?.display_apartment_name} • Flat {user?.flat_number || 'N/A'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Pantry Inventory Overview
          </h1>
          
          <p className="text-xs sm:text-sm text-[#DCEFE3]/90 leading-relaxed">
            Manage your food items, track expiration dates, and eliminate household food waste.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('/add-food')}
            className="w-full sm:w-auto px-5 py-3 rounded-[12px] bg-white text-[#1F6F4A] hover:bg-[#DCEFE3] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Add New Food Item</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Food */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Total Items</span>
            <span className="text-2xl font-bold text-[#17251E]">
              {dashboardLoading ? '...' : totalItems}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Expiring Soon */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Expiring Soon (≤5d)</span>
            <span className="text-2xl font-bold text-[#E6A23C]">
              {dashboardLoading ? '...' : expiringCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4E5] text-[#E6A23C] flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3: Expired */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Expired Items</span>
            <span className="text-2xl font-bold text-[#D9534F]">
              {dashboardLoading ? '...' : expiredCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F2] text-[#D9534F] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4: Estimated Value */}
        <div className="bg-white p-5 rounded-[16px] border border-[#E3E9E4] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#66736B] block mb-1">Pantry Estimated Value</span>
            <span className="text-2xl font-bold text-[#1F6F4A]">
              {dashboardLoading ? '...' : `$${Number(dashboard?.total_estimated_value || 0).toFixed(2)}`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F8FAF6] text-[#1F6F4A] border border-[#E3E9E4] flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Donut Status Chart & Overview */}
      <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E9E4] mb-6">
          <div>
            <h2 className="text-base font-bold text-[#17251E]">Food Status Breakdown</h2>
            <p className="text-xs text-[#66736B]">Real database-driven inventory freshness analytics</p>
          </div>
          <Link
            to="/add-food"
            className="text-xs font-semibold text-[#1F6F4A] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </Link>
        </div>

        {totalItems === 0 && !dashboardLoading ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#17251E]">Your Pantry is Empty</h3>
            <p className="text-xs text-[#66736B] max-w-sm mx-auto">
              Add your first food item to start monitoring expiration dates and reducing household food waste.
            </p>
            <button
              onClick={() => navigate('/add-food')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#174F37] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Item</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Visual Donut Chart */}
            <div className="md:col-span-5 flex justify-center py-2">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-[#F8FAF6]"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Fresh (Green) Arc */}
                  {availablePct > 0 && (
                    <path
                      className="text-[#1F6F4A] transition-all duration-500"
                      strokeDasharray={`${availablePct}, 100`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                  {/* Expiring Soon (Amber) Arc */}
                  {expiringPct > 0 && (
                    <path
                      className="text-[#E6A23C] transition-all duration-500"
                      strokeDasharray={`${expiringPct}, 100`}
                      strokeDashoffset={`-${availablePct}`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                  {/* Expired (Red) Arc */}
                  {expiredPct > 0 && (
                    <path
                      className="text-[#D9534F] transition-all duration-500"
                      strokeDasharray={`${expiredPct}, 100`}
                      strokeDashoffset={`-${availablePct + expiringPct}`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-[#17251E]">{totalItems}</span>
                  <span className="text-[10px] font-semibold text-[#66736B] uppercase tracking-wider">Items</span>
                </div>
              </div>
            </div>

            {/* Legend & Details */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#1F6F4A]" />
                  <span className="text-xs font-semibold text-[#17251E]">Fresh & Available</span>
                </div>
                <div className="text-xs font-bold text-[#17251E]">
                  {availableCount} <span className="text-[#66736B] font-normal">({availablePct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#E6A23C]" />
                  <span className="text-xs font-semibold text-[#17251E]">Expiring Soon (≤5 Days)</span>
                </div>
                <div className="text-xs font-bold text-[#17251E]">
                  {expiringCount} <span className="text-[#66736B] font-normal">({expiringPct}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#D9534F]" />
                  <span className="text-xs font-semibold text-[#17251E]">Expired</span>
                </div>
                <div className="text-xs font-bold text-[#17251E]">
                  {expiredCount} <span className="text-[#66736B] font-normal">({expiredPct}%)</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* PANTRY FOOD LIST SECTION */}
      <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-6">
        
        {/* Header & Filter Controls Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#17251E]">Pantry Inventory Items</h2>
              <p className="text-xs text-[#66736B]">Search, filter by category or storage location, and sort your inventory.</p>
            </div>

            <button
              onClick={() => navigate('/add-food')}
              className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Search, Filter & Sort Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2">
            
            {/* Search Input (4 cols) */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-[#98A39D] absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search food by name..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              />
            </div>

            {/* Category Filter (2 cols) */}
            <div className="lg:col-span-2">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Storage Filter (2 cols) */}
            <div className="lg:col-span-2">
              <select
                value={storage}
                onChange={(e) => { setStorage(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              >
                {STORAGE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter (2 cols) */}
            <div className="lg:col-span-2">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>

            {/* Sorting (2 cols) */}
            <div className="lg:col-span-2">
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Pantry Items Grid */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-medium">Loading your pantry items...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium text-center">
            {error}
          </div>
        ) : foods.length === 0 ? (
          <div className="py-12 border border-dashed border-[#E3E9E4] rounded-[16px] text-center space-y-3 bg-[#F8FAF6]/50">
            <div className="w-12 h-12 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#17251E]">No Food Items Found</h3>
            <p className="text-xs text-[#66736B] max-w-sm mx-auto">
              {search || category !== 'ALL' || storage !== 'ALL' || status !== 'ALL'
                ? 'No items matched your current filter criteria. Try resetting filters.'
                : 'Your pantry is empty. Click below to add your first food item!'}
            </p>
            {search || category !== 'ALL' || storage !== 'ALL' || status !== 'ALL' ? (
              <button
                onClick={() => { setSearch(''); setCategory('ALL'); setStorage('ALL'); setStatus('ALL'); setPage(1); }}
                className="px-3.5 py-1.5 rounded-[8px] bg-white border border-[#E3E9E4] text-xs font-semibold text-[#1F6F4A] hover:bg-[#F8FAF6]"
              >
                Reset All Filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/add-food')}
                className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#174F37]"
              >
                Add Food Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-[16px] border border-[#E3E9E4] p-4 shadow-xs hover:border-[#7FAF8A] transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  
                  {/* Top Item Card Header */}
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
                        {renderStatusBadge(item.status, item.days_until_expiry)}
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

                  {/* Metadata Row */}
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

                {/* Bottom Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E3E9E4]">
                  
                  {/* Action Group: Consume & Waste OR Restock */}
                  {item.status === 'CONSUMED' ? (
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] bg-[#EBF3FE] hover:bg-[#d8e6fd] px-2.5 py-1 rounded-[8px] transition-colors"
                      title="Restock or Edit Quantity"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Restock / Edit Quantity</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenConsume(item)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#1F6F4A] bg-[#DCEFE3] hover:bg-[#c8e6d3] px-2.5 py-1 rounded-[8px] transition-colors"
                        title="Log Consumption"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Consume</span>
                      </button>
                      <button
                        onClick={() => handleOpenWaste(item)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#D9534F] bg-[#FDF2F2] hover:bg-[#fbdada] px-2.5 py-1 rounded-[8px] transition-colors"
                        title="Log Food Waste"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Waste</span>
                      </button>
                    </div>
                  )}

                  {/* Secondary Actions: Share, Edit, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate('/share-food')}
                      className="p-1 rounded-[8px] text-[#2563EB] hover:bg-[#EBF3FE] transition-colors"
                      title="Share surplus food with neighbors (Phase 4)"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 rounded-[8px] text-[#66736B] hover:text-[#1F6F4A] hover:bg-[#DCEFE3] transition-colors"
                      title="Edit Item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-1 rounded-[8px] text-[#66736B] hover:text-[#D9534F] hover:bg-[#FDF2F2] transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[#E3E9E4]">
            <span className="text-xs text-[#66736B]">
              Showing Page <strong className="text-[#17251E]">{page}</strong> of <strong className="text-[#17251E]">{totalPages}</strong> ({totalCount} total items)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-[8px] border border-[#E3E9E4] bg-white text-[#17251E] hover:bg-[#F8FAF6] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-[8px] border border-[#E3E9E4] bg-white text-[#17251E] hover:bg-[#F8FAF6] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* EDIT FOOD MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] max-w-lg w-full p-6 border border-[#E3E9E4] shadow-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
              <h3 className="text-base font-bold text-[#17251E]">Edit Food Item</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-lg text-[#66736B] hover:bg-[#F8FAF6]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-[10px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">Food Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17251E] block">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17251E] block">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                  >
                    {CATEGORY_OPTIONS.filter(c => c.value !== 'ALL').map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17251E] block">Storage Location</label>
                  <select
                    value={editStorage}
                    onChange={(e) => setEditStorage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                  >
                    {STORAGE_OPTIONS.filter(s => s.value !== 'ALL').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17251E] block">Expiry Date</label>
                  <input
                    type="date"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E3E9E4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-[10px] border border-[#E3E9E4] text-xs font-semibold text-[#66736B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold flex items-center gap-2"
                >
                  {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] max-w-sm w-full p-6 border border-[#E3E9E4] shadow-xl text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF2F2] text-[#D9534F] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17251E]">Delete Food Item?</h3>
              <p className="text-xs text-[#66736B] mt-1">
                Are you sure you want to delete <strong className="text-[#17251E]">{deletingItem.name}</strong> from your pantry?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-[10px] border border-[#E3E9E4] bg-white text-xs font-semibold text-[#66736B]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-[10px] bg-[#D9534F] hover:bg-[#c9302c] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSUME FOOD MODAL */}
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

      {/* WASTE FOOD MODAL */}
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

export default HomePage;
