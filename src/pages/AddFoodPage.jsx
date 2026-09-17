import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFoods from '../hooks/useFoods';
import { 
  UploadCloud, 
  X, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Package, 
  Calendar, 
  DollarSign, 
  Layers, 
  Box, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const CATEGORY_OPTIONS = [
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

const UNIT_OPTIONS = [
  { value: 'pieces', label: 'pieces' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'litres', label: 'litres' },
  { value: 'ml', label: 'ml' },
  { value: 'packet', label: 'packet' },
  { value: 'box', label: 'box' },
  { value: 'can', label: 'can' },
  { value: 'bottle', label: 'bottle' },
  { value: 'dozen', label: 'dozen' },
];

const STORAGE_OPTIONS = [
  { value: 'PANTRY', label: 'Pantry' },
  { value: 'REFRIGERATOR', label: 'Refrigerator' },
  { value: 'FREEZER', label: 'Freezer' },
  { value: 'KITCHEN', label: 'Kitchen' },
  { value: 'OTHER', label: 'Other' },
];

export const AddFoodPage = () => {
  const navigate = useNavigate();
  const { createFoodItem } = useFoods();

  const todayStr = new Date().toISOString().split('T')[0];

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('FRUITS');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  const [purchaseDate, setPurchaseDate] = useState(todayStr);
  const [expiryDate, setExpiryDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('PANTRY');
  const [estimatedValue, setEstimatedValue] = useState('');

  // Image Upload state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Status & Feedback State
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Image Handlers
  const handlePhotoSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 5MB.');
      return;
    }
    setErrorMsg('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Food name is required.';
    
    const qtyVal = parseFloat(quantity);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      errors.quantity = 'Quantity must be a positive number.';
    }

    if (!purchaseDate) errors.purchase_date = 'Purchase date is required.';
    if (!expiryDate) errors.expiry_date = 'Expiry date is required.';

    if (purchaseDate && expiryDate && new Date(expiryDate) < new Date(purchaseDate)) {
      errors.expiry_date = 'Expiry date cannot be earlier than purchase date.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('category', category);
      formData.append('quantity', quantity);
      formData.append('unit', unit);
      formData.append('purchase_date', purchaseDate);
      formData.append('expiry_date', expiryDate);
      formData.append('storage_location', storageLocation);
      if (estimatedValue) {
        formData.append('estimated_value', estimatedValue);
      }
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      await createFoodItem(formData);
      setSuccessMsg('Food item added to your pantry successfully!');
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      console.error('Failed to add food item:', err);
      const errData = err.response?.data;
      if (errData && typeof errData === 'object') {
        setFieldErrors(errData);
        if (errData.detail) setErrorMsg(errData.detail);
        else if (errData.non_field_errors) setErrorMsg(errData.non_field_errors[0]);
        else setErrorMsg('Failed to save food item. Please review the inputs.');
      } else {
        setErrorMsg('Server connection failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Navigation & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="p-2.5 rounded-xl bg-white border border-[#E3E9E4] text-[#66736B] hover:text-[#17251E] hover:bg-[#F8FAF6] transition-colors"
            aria-label="Back to Pantry"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17251E] tracking-tight">Add Food Item</h1>
            <p className="text-xs sm:text-sm text-[#66736B]">Log new groceries into your personal food inventory.</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-[12px] bg-[#DCEFE3] border border-[#7FAF8A]/40 text-[#1F6F4A] text-sm font-semibold flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg} Redirecting to your pantry...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-sm font-semibold flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Two-Column Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Media, Barcode & Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Photo Upload Zone */}
          <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-4">
            <label className="text-xs font-bold text-[#17251E] block uppercase tracking-wider">
              Food Item Photo
            </label>

            {photoPreview ? (
              <div className="relative rounded-[12px] overflow-hidden border border-[#E3E9E4] bg-[#F8FAF6] group">
                <img 
                  src={photoPreview} 
                  alt="Food preview" 
                  className="w-full h-56 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-md"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[12px] p-6 text-center transition-all cursor-pointer ${
                  dragOver 
                    ? 'border-[#1F6F4A] bg-[#DCEFE3]/30' 
                    : 'border-[#E3E9E4] bg-[#F8FAF6] hover:border-[#7FAF8A] hover:bg-white'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handlePhotoSelect(e.target.files[0])}
                  className="hidden"
                  id="food-photo-input"
                />
                <label htmlFor="food-photo-input" className="cursor-pointer space-y-3 block">
                  <div className="w-12 h-12 rounded-2xl bg-[#DCEFE3] text-[#1F6F4A] flex items-center justify-center mx-auto">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#17251E]">Drag and drop food image</p>
                    <p className="text-[11px] text-[#66736B] mt-0.5">or click to browse from device (Max 5MB)</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Barcode Scanner UI Placeholder */}
          <div className="bg-gradient-to-br from-[#174F37] to-[#1F6F4A] text-white rounded-[16px] p-5 shadow-xs relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#DCEFE3]">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#DCEFE3]">Quick Barcode Scanner</h3>
                  <p className="text-[11px] text-white/80">Automate entry via barcode</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full text-[#E8B44F]">
                AI Readiness
              </span>
            </div>

            <button
              type="button"
              onClick={() => alert('Barcode scanning interface is prepared for Phase 6 AI/ML recognition. Manual entry active.')}
              className="w-full py-2.5 px-3 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
            >
              <QrCode className="w-4 h-4 text-[#E8B44F]" />
              <span>Tap to Open Scanner Camera</span>
            </button>
          </div>

          {/* Category & Storage Selection */}
          <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-4">
            
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17251E] block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7FAF8A]" />
                <span>Food Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Storage Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17251E] block flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-[#7FAF8A]" />
                <span>Storage Location</span>
              </label>
              <select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              >
                {STORAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Food Details Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs flex flex-col justify-between space-y-6">
          
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-[#17251E] pb-3 border-b border-[#E3E9E4]">
              Inventory Details
            </h2>

            {/* Food Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17251E] block">
                Food Name <span className="text-[#D9534F]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Whole Milk, Red Apples"
                required
                className={`w-full px-3.5 py-2.5 rounded-[10px] border text-sm text-[#17251E] focus:outline-none transition-colors ${
                  fieldErrors.name 
                    ? 'border-[#D9534F] bg-[#FDF2F2]' 
                    : 'border-[#E3E9E4] bg-[#F8FAF6] focus:border-[#1F6F4A] focus:bg-white'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-xs text-[#D9534F] mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Quantity & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17251E] block">
                  Quantity <span className="text-[#D9534F]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1.0"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-[10px] border text-sm text-[#17251E] focus:outline-none transition-colors ${
                    fieldErrors.quantity 
                      ? 'border-[#D9534F] bg-[#FDF2F2]' 
                      : 'border-[#E3E9E4] bg-[#F8FAF6] focus:border-[#1F6F4A] focus:bg-white'
                  }`}
                />
                {fieldErrors.quantity && (
                  <p className="text-xs text-[#D9534F] mt-1">{fieldErrors.quantity}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17251E] block">
                  Unit <span className="text-[#D9534F]">*</span>
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Purchase & Expiry Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17251E] block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#7FAF8A]" />
                  <span>Purchase Date</span>
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#17251E] block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#E6A23C]" />
                  <span>Expiry Date <span className="text-[#D9534F]">*</span></span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-[10px] border text-sm text-[#17251E] focus:outline-none transition-colors ${
                    fieldErrors.expiry_date 
                      ? 'border-[#D9534F] bg-[#FDF2F2]' 
                      : 'border-[#E3E9E4] bg-[#F8FAF6] focus:border-[#1F6F4A] focus:bg-white'
                  }`}
                />
                {fieldErrors.expiry_date && (
                  <p className="text-xs text-[#D9534F] mt-1">{fieldErrors.expiry_date}</p>
                )}
              </div>

            </div>

            {/* Estimated Value */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[#17251E] block flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#1F6F4A]" />
                <span>Estimated Value ($)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="e.g. 4.50"
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-[#F8FAF6] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
              />
              <p className="text-[11px] text-[#66736B]">Helps calculate household food savings and waste reduction metrics.</p>
            </div>

          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-[#E3E9E4] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="px-5 py-2.5 rounded-[10px] border border-[#E3E9E4] bg-white hover:bg-[#F8FAF6] text-xs font-semibold text-[#66736B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Item...</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>Save to Pantry</span>
                </>
              )}
            </button>
          </div>

        </div>

      </form>

    </div>
  );
};

export default AddFoodPage;
