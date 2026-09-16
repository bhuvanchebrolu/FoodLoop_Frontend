import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';
import { 
  Leaf, 
  Eye, 
  EyeOff, 
  Loader2, 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Home, 
  AlertCircle,
  CheckCircle2,
  Users,
  Utensils,
  Award
} from 'lucide-react';

// Zod schemas for form validation
const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  apartmentId: z.string().optional(),
  apartmentCustom: z.string().optional(),
  flatNumber: z.string().min(1, 'Flat number is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, register: authRegister, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load available apartments from API for registration dropdown
  useEffect(() => {
    const fetchApartments = async () => {
      setLoadingApartments(true);
      try {
        const data = await authService.getApartments();
        setApartments(data || []);
      } catch (err) {
        console.warn('Could not load apartment list:', err);
      } finally {
        setLoadingApartments(false);
      }
    };
    fetchApartments();
  }, []);

  // Form hooks
  const {
    register: registerSignIn,
    handleSubmit: handleSubmitSignIn,
    formState: { errors: errorsSignIn, isSubmitting: isSubmittingSignIn },
    reset: resetSignIn
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  });

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: errorsSignUp, isSubmitting: isSubmittingSignUp },
    reset: resetSignUp
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      apartmentId: '',
      apartmentCustom: '',
      flatNumber: ''
    }
  });

  // Handle Tab Change
  const switchTab = (tab) => {
    setActiveTab(tab);
    setServerError('');
    setSuccessMessage('');
    resetSignIn();
    resetSignUp();
  };

  // Submit Sign In
  const onSubmitSignIn = async (data) => {
    setServerError('');
    setSuccessMessage('');
    try {
      await login(data.email, data.password);
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.errors?.non_field_errors?.[0] ||
        err.response?.data?.message ||
        "That email or password doesn't look right.";
      setServerError(msg);
    }
  };

  // Submit Sign Up
  const onSubmitSignUp = async (data) => {
    setServerError('');
    setSuccessMessage('');
    try {
      const payload = {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        flat_number: data.flatNumber,
        apartment_id: data.apartmentId ? parseInt(data.apartmentId, 10) : null,
        apartment_name_custom: data.apartmentCustom || ''
      };
      await authRegister(payload);
      setSuccessMessage('Account created successfully! Welcome to FoodLoop.');
      setTimeout(() => navigate('/home'), 1000);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        if (errors.email) {
          setServerError(Array.isArray(errors.email) ? errors.email[0] : errors.email);
        } else if (errors.confirm_password) {
          setServerError(Array.isArray(errors.confirm_password) ? errors.confirm_password[0] : errors.confirm_password);
        } else {
          setServerError('Failed to create account. Please check your inputs.');
        }
      } else {
        setServerError(err.response?.data?.message || 'Server error. Please try again later.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAF6]">
      
      {/* LEFT BRAND PANEL (Approx 45% width on desktop) */}
      <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#174F37] to-[#1F6F4A] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[420px] lg:min-h-screen">
        
        {/* Subtle CSS Organic Background Shapes */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#7FAF8A]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-xl pointer-events-none" />

        {/* Top Brand Logo & Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Leaf className="w-6 h-6 text-[#DCEFE3]" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">FoodLoop</h1>
            </div>
          </div>
          
          <h2 className="text-xl lg:text-2xl font-semibold text-[#DCEFE3] mb-3 leading-snug">
            "Good food deserves another chance."
          </h2>
          <p className="text-sm lg:text-base text-white/80 max-w-md leading-relaxed">
            Track what you have, share what you won't use, and help your community waste less.
          </p>
        </div>

        {/* Marketing / Impact Stats (Placeholders for UI) */}
        <div className="relative z-10 my-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-[#E8B44F] mb-1">
                <Utensils className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Saved</span>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-white">12K+</p>
              <p className="text-[11px] text-[#DCEFE3] mt-0.5">Meals Saved</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-[#7FAF8A] mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Active</span>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-white">2.8K+</p>
              <p className="text-[11px] text-[#DCEFE3] mt-0.5">Residents</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-[#E8B44F] mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Diverted</span>
              </div>
              <p className="text-xl lg:text-2xl font-bold text-white">18K kg</p>
              <p className="text-[11px] text-[#DCEFE3] mt-0.5">Food Waste</p>
            </div>
          </div>
        </div>

        {/* Bottom Inspirational Footer Message */}
        <div className="relative z-10 border-t border-white/15 pt-4">
          <p className="text-xs lg:text-sm text-[#DCEFE3]/90 italic font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8B44F]" />
            "Together, small actions create a bigger impact."
          </p>
        </div>
      </div>

      {/* RIGHT AUTHENTICATION PANEL (Approx 55% width on desktop) */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-[0_4px_20px_rgba(23,37,30,0.06)]">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#17251E]">Welcome to FoodLoop</h2>
            <p className="text-sm text-[#66736B] mt-1">Make every meal count.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#F8FAF6] p-1 rounded-[12px] mb-6 border border-[#E3E9E4]">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-[#DCEFE3] text-[#1F6F4A] shadow-sm'
                  : 'text-[#66736B] hover:text-[#17251E]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all duration-200 ${
                activeTab === 'signup'
                  ? 'bg-[#DCEFE3] text-[#1F6F4A] shadow-sm'
                  : 'text-[#66736B] hover:text-[#17251E]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Alert Banner */}
          {serverError && (
            <div className="mb-5 p-3.5 bg-[#FDF2F2] border border-[#F8B4B4] rounded-[10px] flex items-start gap-2.5 text-[#D9534F] text-xs sm:text-sm animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{serverError}</div>
            </div>
          )}

          {/* Success Alert Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 bg-[#EDF7F1] border border-[#B6E2C6] rounded-[10px] flex items-start gap-2.5 text-[#4F9D69] text-xs sm:text-sm animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleSubmitSignIn(onSubmitSignIn)} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-[#17251E] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A39D]" />
                  <input
                    type="email"
                    placeholder="resident@example.com"
                    {...registerSignIn('email')}
                    className={`w-full pl-9 pr-3 py-2.5 bg-[#F8FAF6] border rounded-[10px] text-sm text-[#17251E] placeholder:text-[#98A39D] focus:outline-none transition-colors ${
                      errorsSignIn.email
                        ? 'border-[#D9534F] focus:border-[#D9534F]'
                        : 'border-[#E3E9E4] focus:border-[#1F6F4A] focus:bg-white'
                    }`}
                  />
                </div>
                {errorsSignIn.email && (
                  <p className="text-[12px] text-[#D9534F] mt-1 font-medium">{errorsSignIn.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#17251E]">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      setServerError('Password reset link will be sent to your registered email.');
                    }}
                    className="text-xs font-medium text-[#1F6F4A] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A39D]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerSignIn('password')}
                    className={`w-full pl-9 pr-10 py-2.5 bg-[#F8FAF6] border rounded-[10px] text-sm text-[#17251E] placeholder:text-[#98A39D] focus:outline-none transition-colors ${
                      errorsSignIn.password
                        ? 'border-[#D9534F] focus:border-[#D9534F]'
                        : 'border-[#E3E9E4] focus:border-[#1F6F4A] focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A39D] hover:text-[#17251E]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errorsSignIn.password && (
                  <p className="text-[12px] text-[#D9534F] mt-1 font-medium">{errorsSignIn.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingSignIn}
                className="w-full mt-2 py-3 px-4 bg-[#1F6F4A] hover:bg-[#174F37] text-white text-sm font-semibold rounded-[10px] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmittingSignIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E3E9E4]" />
                </div>
                <div className="relative flex justify-center text-xs text-[#98A39D] uppercase">
                  <span className="bg-white px-2">OR</span>
                </div>
              </div>

              {/* Switch to Sign Up */}
              <div className="text-center text-xs text-[#66736B]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="font-semibold text-[#1F6F4A] hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSubmitSignUp(onSubmitSignUp)} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#17251E] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A39D]" />
                  <input
                    type="text"
                    placeholder="Sarah Connor"
                    {...registerSignUp('fullName')}
                    className={`w-full pl-9 pr-3 py-2 bg-[#F8FAF6] border rounded-[10px] text-sm text-[#17251E] placeholder:text-[#98A39D] focus:outline-none transition-colors ${
                      errorsSignUp.fullName
                        ? 'border-[#D9534F]'
                        : 'border-[#E3E9E4] focus:border-[#1F6F4A] focus:bg-white'
                    }`}
                  />
                </div>
                {errorsSignUp.fullName && (
                  <p className="text-[12px] text-[#D9534F] mt-0.5 font-medium">{errorsSignUp.fullName.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-[#17251E] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A39D]" />
                  <input
                    type="email"
                    placeholder="sarah@example.com"
                    {...registerSignUp('email')}
                    className={`w-full pl-9 pr-3 py-2 bg-[#F8FAF6] border rounded-[10px] text-sm text-[#17251E] placeholder:text-[#98A39D] focus:outline-none transition-colors ${
                      errorsSignUp.email
                        ? 'border-[#D9534F]'
                        : 'border-[#E3E9E4] focus:border-[#1F6F4A] focus:bg-white'
                    }`}
                  />
                </div>
                {errorsSignUp.email && (
                  <p className="text-[12px] text-[#D9534F] mt-0.5 font-medium">{errorsSignUp.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#17251E] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A39D]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerSignUp('password')}
                    className={`w-full pl-9 pr-10 py-2 bg-[#F8FAF6] border rounded-[10px] text-sm text-[#17251E] placeholder:text-[#98A39D] focus:outline-none transition-colors ${
                      errorsSignUp.password
                        ? 'border-[#D9534F]'
                        : 'border-[#E3E9E4] focus:border-[#1F6F4A] focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A39D] hover:text-[#17251E]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errorsSignUp.password && (
                  <p className="text-[12px] text-[#D9534F] mt-0.5 font-medium">{errorsSignUp.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#17251E] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A39D]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerSignUp('confirmPassword')}
                    className={`w-full pl-9 pr-10 py-2 bg-[#F8FAF6] border rounded-[10px] text-sm text-[#17251E] placeholder:text-[#98A39D] focus:outline-none transition-colors ${
                      errorsSignUp.confirmPassword
                        ? 'border-[#D9534F]'
                        : 'border-[#E3E9E4] focus:border-[#1F6F4A] focus:bg-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A39D] hover:text-[#17251E]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errorsSignUp.confirmPassword && (
                  <p className="text-[12px] text-[#D9534F] mt-0.5 font-medium">{errorsSignUp.confirmPassword.message}</p>
                )}
              </div>

              {/* Apartment / Community */}
              <div>
                <label className="block text-xs font-semibold text-[#17251E] mb-1">
                  Apartment / Community
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A39D]" />
                  <select
                    {...registerSignUp('apartmentId')}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAF6] border border-[#E3E9E4] rounded-[10px] text-sm text-[#17251E] focus:outline-none focus:border-[#1F6F4A] focus:bg-white transition-colors"
                  >
                    <option value="">Select your community...</option>
                    {apartments.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        {apt.name} ({apt.address})
                      </option>
                    ))}
                    <option value="custom">+ Other / Enter Custom Name</option>
                  </select>
                </div>
              </div>

              {/* Custom Apartment Name Input if 'Other' selected */}
              <div>
                <label className="block text-xs font-semibold text-[#17251E] mb-1">
                  Custom Community Name (Optional if not listed)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Green Meadows Residency"
                  {...registerSignUp('apartmentCustom')}
                  className="w-full px-3 py-2 bg-[#F8FAF6] border border-[#E3E9E4] rounded-[10px] text-sm text-[#17251E] placeholder:text-[#98A39D] focus:outline-none focus:border-[#1F6F4A] focus:bg-white"
                />
              </div>

              {/* Flat Number */}
              <div>
                <label className="block text-xs font-semibold text-[#17251E] mb-1">
                  Flat / Unit Number
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98A39D]" />
                  <input
                    type="text"
                    placeholder="e.g. A-402"
                    {...registerSignUp('flatNumber')}
                    className={`w-full pl-9 pr-3 py-2 bg-[#F8FAF6] border rounded-[10px] text-sm text-[#17251E] placeholder:text-[#98A39D] focus:outline-none transition-colors ${
                      errorsSignUp.flatNumber
                        ? 'border-[#D9534F]'
                        : 'border-[#E3E9E4] focus:border-[#1F6F4A] focus:bg-white'
                    }`}
                  />
                </div>
                {errorsSignUp.flatNumber && (
                  <p className="text-[12px] text-[#D9534F] mt-0.5 font-medium">{errorsSignUp.flatNumber.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingSignUp}
                className="w-full mt-2 py-3 px-4 bg-[#1F6F4A] hover:bg-[#174F37] text-white text-sm font-semibold rounded-[10px] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmittingSignUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              {/* Switch to Sign In */}
              <div className="text-center text-xs text-[#66736B] pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="font-semibold text-[#1F6F4A] hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
