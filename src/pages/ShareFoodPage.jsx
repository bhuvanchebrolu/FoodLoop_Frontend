import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import foodService from '../services/foodService';
import shareService from '../services/shareService';
import useAuth from '../hooks/useAuth';
import { 
  Share2, 
  Building2, 
  Package, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';

const VISIBILITY_OPTIONS = [
  { value: 'APARTMENT', label: 'Apartment Residents Only', description: 'Visible only to verified neighbors in your apartment building.' },
  { value: 'NEIGHBOURS', label: 'Nearby Community', description: 'Visible to all nearby residents in your area.' },
];

export const ShareFoodPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedFoodId = searchParams.get('food_id');
  const { user } = useAuth();

  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(true);

  // Form State
  const [selectedFoodId, setSelectedFoodId] = useState(preselectedFoodId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('pieces');
  const [visibility, setVisibility] = useState('APARTMENT');
  const [pickupNote, setPickupNote] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserFoods = async () => {
      setLoadingFoods(true);
      try {
        const data = await foodService.getFoods({ page_size: 100 });
        const eligible = (data.results || data || []).filter(item => item.quantity > 0 && item.status !== 'CONSUMED');
        setFoods(eligible);

        if (preselectedFoodId) {
          const match = eligible.find(f => String(f.id) === String(preselectedFoodId));
          if (match) {
            setSelectedFoodId(match.id);
            setTitle(match.name);
            setQuantity(String(match.quantity));
            setUnit(match.unit);
          }
        } else if (eligible.length > 0) {
          const first = eligible[0];
          setSelectedFoodId(first.id);
          setTitle(first.name);
          setQuantity(String(first.quantity));
          setUnit(first.unit);
        }
      } catch (err) {
        console.error('Error loading pantry foods:', err);
        setError('Failed to load your pantry food items.');
      } finally {
        setLoadingFoods(false);
      }
    };

    fetchUserFoods();
  }, [preselectedFoodId]);

  const handleFoodChange = (foodId) => {
    setSelectedFoodId(foodId);
    const selected = foods.find(f => String(f.id) === String(foodId));
    if (selected) {
      setTitle(selected.name);
      setQuantity(String(selected.quantity));
      setUnit(selected.unit);
    }
  };

  const selectedFood = foods.find(f => String(f.id) === String(selectedFoodId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFoodId) {
      setError('Please select a food item to share.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        food_item_id: parseInt(selectedFoodId),
        title: title || selectedFood?.name,
        description,
        quantity: parseFloat(quantity),
        unit: unit || selectedFood?.unit || 'pieces',
        visibility,
        pickup_note: pickupNote,
        expires_at: selectedFood?.expiry_date
      };

      await shareService.createShare(payload);
      navigate('/community?scope=mine');
    } catch (err) {
      const errData = err.response?.data;
      setError(errData?.message || errData?.quantity?.[0] || errData?.food_item_id?.[0] || 'Failed to create food share.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#66736B] hover:text-[#1F6F4A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="inline-flex items-center gap-2 bg-[#DCEFE3] px-3 py-1 rounded-full text-xs font-semibold text-[#1F6F4A]">
          <Building2 className="w-3.5 h-3.5" />
          <span>Sharing within {user?.display_apartment_name}</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#174F37] via-[#1F6F4A] to-[#2E8B57] text-white p-6 sm:p-8 rounded-[16px] shadow-xs space-y-2">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#DCEFE3] border border-white/20">
          <Share2 className="w-3.5 h-3.5 text-[#E8B44F]" />
          <span>Surplus Food Marketplace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Share Food With Your Community
        </h1>
        <p className="text-xs sm:text-sm text-[#DCEFE3]/90 leading-relaxed max-w-xl">
          Prevent food waste by sharing excess pantry items with verified neighbors in your building or community.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-semibold">
          {error}
        </div>
      )}

      {loadingFoods ? (
        <div className="py-16 bg-white rounded-[16px] border border-[#E3E9E4] flex flex-col items-center justify-center gap-2 text-[#1F6F4A]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs font-medium">Loading your pantry inventory...</span>
        </div>
      ) : foods.length === 0 ? (
        <div className="py-12 bg-white rounded-[16px] border border-[#E3E9E4] text-center space-y-4 p-6">
          <div className="w-14 h-14 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#17251E]">No Eligible Food Items Found</h3>
          <p className="text-xs text-[#66736B] max-w-sm mx-auto">
            You don't have any active food items in your pantry to share. Add a food item to your pantry first!
          </p>
          <button
            onClick={() => navigate('/add-food')}
            className="px-4 py-2 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#174F37] transition-colors"
          >
            Add Food Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-5">
            <div className="pb-3 border-b border-[#E3E9E4]">
              <h2 className="text-base font-bold text-[#17251E]">Share Details</h2>
              <p className="text-xs text-[#66736B]">Specify quantity, visibility, and pickup instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Select Food Item */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Select Food Item from Pantry <span className="text-[#D9534F]">*</span>
                </label>
                <select
                  value={selectedFoodId}
                  onChange={(e) => handleFoodChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                >
                  {foods.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} — {item.quantity} {item.unit} available (Expires {item.expiry_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Share Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Share Title <span className="text-[#D9534F]">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Fresh Organic Gala Apples"
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              {/* Quantity to Share */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17251E] block">
                    Quantity Offered <span className="text-[#D9534F]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedFood?.quantity || 100}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17251E] block">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#E3E9E4]/40 text-xs font-semibold text-[#66736B]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Description / Details (Optional)
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Bought a large bag, won't finish before traveling. Unopened."
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              {/* Visibility Choice */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-[#17251E] block">Visibility Setting</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VISIBILITY_OPTIONS.map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setVisibility(opt.value)}
                      className={`p-3 rounded-[12px] border cursor-pointer transition-all ${
                        visibility === opt.value
                          ? 'border-[#1F6F4A] bg-[#DCEFE3]/30 shadow-xs'
                          : 'border-[#E3E9E4] bg-[#F8FAF6] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#17251E]">{opt.label}</span>
                        {visibility === opt.value && <CheckCircle2 className="w-4 h-4 text-[#1F6F4A]" />}
                      </div>
                      <p className="text-[11px] text-[#66736B] mt-1 leading-snug">{opt.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17251E] block">
                  Pickup Instructions / Pickup Note
                </label>
                <input
                  type="text"
                  value={pickupNote}
                  onChange={(e) => setPickupNote(e.target.value)}
                  placeholder="e.g., Available evenings after 6 PM. Flat 101."
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-xs text-[#17251E] focus:outline-none focus:border-[#1F6F4A]"
                />
              </div>

              <div className="pt-3 border-t border-[#E3E9E4] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/home')}
                  className="px-4 py-2.5 rounded-[10px] border border-[#E3E9E4] text-xs font-semibold text-[#66736B] hover:bg-[#F8FAF6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Food Share'}
                </button>
              </div>

            </form>
          </div>

          {/* Real-time Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="bg-[#F8FAF6] rounded-[16px] p-4 border border-[#E3E9E4] space-y-2">
              <span className="text-[11px] font-bold text-[#1F6F4A] uppercase tracking-wider block">Live Preview</span>
              <p className="text-xs text-[#66736B]">Here is how your share card will look in the Community feed:</p>
            </div>

            <div className="bg-white rounded-[16px] border border-[#E3E9E4] p-5 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                {selectedFood?.photo_url ? (
                  <img
                    src={selectedFood.photo_url}
                    alt={title}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E3E9E4] shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center font-bold text-xl shrink-0">
                    {title ? title.charAt(0).toUpperCase() : 'S'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#DCEFE3] text-[#1F6F4A] px-2 py-0.5 rounded-full">
                      {selectedFood?.category || 'FRUITS'}
                    </span>
                    <span className="text-[11px] font-bold bg-[#EBF3FE] text-[#2563EB] px-2 py-0.5 rounded-full border border-[#2563EB]/20">
                      {visibility === 'APARTMENT' ? 'Apartment' : 'Community'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#17251E] truncate mt-1">
                    {title || 'Share Title'}
                  </h3>

                  <p className="text-xs font-bold text-[#1F6F4A] mt-0.5">
                    {quantity || '0'} {unit || 'pieces'} available
                  </p>
                </div>
              </div>

              {description && (
                <p className="text-xs text-[#66736B] bg-[#F8FAF6] p-3 rounded-[10px] border border-[#E3E9E4]">
                  "{description}"
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#66736B] pt-2 border-t border-[#E3E9E4]">
                <div>
                  <span className="text-[#98A39D] block text-[10px] uppercase font-bold">Shared By</span>
                  <span className="font-semibold text-[#17251E]">{user?.full_name} (Flat {user?.flat_number || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-[#98A39D] block text-[10px] uppercase font-bold">Expires On</span>
                  <span className="font-semibold text-[#17251E]">{selectedFood?.expiry_date || 'N/A'}</span>
                </div>
              </div>

              {pickupNote && (
                <div className="text-[11px] bg-[#FFF4E5] text-[#E6A23C] p-2.5 rounded-[10px] border border-[#FFE0B2] font-medium flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#E6A23C]" />
                  <span><strong>Pickup Note:</strong> {pickupNote}</span>
                </div>
              )}

              <button
                disabled
                className="w-full py-2.5 rounded-[10px] bg-[#1F6F4A] text-white text-xs font-bold flex items-center justify-center gap-2 opacity-90 cursor-not-allowed"
              >
                <Share2 className="w-4 h-4" />
                <span>Request Food (Preview)</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ShareFoodPage;
