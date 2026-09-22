import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FoodLoop ErrorBoundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/home';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAF6] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-white rounded-[20px] p-8 max-w-md w-full border border-[#E3E9E4] shadow-md space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#FDF2F2] text-[#D9534F] flex items-center justify-center mx-auto border border-[#F8B4B4]/40">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-[#17251E]">Something Went Wrong</h1>
              <p className="text-xs text-[#66736B]">
                An unexpected interface error occurred. Don't worry, your food records and database items remain completely safe.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#1F6F4A] hover:bg-[#174F37] text-white text-xs font-semibold transition-all shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#F8FAF6] hover:bg-[#E3E9E4] text-[#17251E] text-xs font-semibold border border-[#E3E9E4] transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
