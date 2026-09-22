import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import { 
  TrendingUp, 
  Leaf, 
  IndianRupee, 
  Trash2, 
  Utensils, 
  Share2, 
  PlusCircle, 
  Calendar, 
  Loader2, 
  AlertCircle,
  PieChart,
  BarChart3,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
];

export const AnalyticsPage = () => {
  const [period, setPeriod] = useState('30d');
  
  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [consumptionData, setConsumptionData] = useState(null);
  const [wasteData, setWasteData] = useState(null);
  const [sharingData, setSharingData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ov, cs, ws, sh] = await Promise.all([
        analyticsService.getOverview(period),
        analyticsService.getConsumptionData(period),
        analyticsService.getWasteData(period),
        analyticsService.getSharingData(period)
      ]);

      setOverviewData(ov);
      setConsumptionData(cs);
      setWasteData(ws);
      setSharingData(sh);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to fetch analytics metrics for the selected time range.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const overview = overviewData?.overview || {};
  const impact = overviewData?.impact || {};
  const consumptionCategories = consumptionData?.by_category || [];
  const wasteReasons = wasteData?.by_reason || [];
  const wasteCategories = wasteData?.by_category || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#17251E] text-white rounded-[16px] p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics & Eco Impact</h1>
            <span className="bg-[#DCEFE3] text-[#1F6F4A] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#7FAF8A]/40">
              Database Driven
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#98A39D] max-w-xl">
            Track household food utilization, waste reduction, community sharing efficiency, and financial savings.
          </p>
        </div>

        {/* Time Period Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-[#24352B] p-1.5 rounded-[12px] border border-[#34483B] w-full md:w-auto overflow-x-auto">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all ${
                  period === opt.value
                    ? 'bg-[#1F6F4A] text-white shadow-xs'
                    : 'text-[#98A39D] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadAnalytics}
            className="p-2.5 rounded-[10px] bg-[#24352B] hover:bg-[#2F4438] text-white border border-[#34483B]"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#7FAF8A]' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[12px] bg-[#FDF2F2] border border-[#F8B4B4]/40 text-[#D9534F] text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#1F6F4A]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-medium">Calculating PostgreSQL analytics...</span>
        </div>
      ) : (
        <>
          {/* Key Eco & Financial Impact Metric Cards */}
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
              <p className="text-[11px] text-[#66736B]">Consumed or shared surplus food.</p>
            </div>

            <div className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#66736B] uppercase tracking-wider">Est. Money Saved</span>
                <div className="w-8 h-8 rounded-xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#17251E]">
                ₹{impact.estimated_money_saved_inr || 0}
              </div>
              <p className="text-[11px] text-[#66736B]">Estimated value saved from waste.</p>
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
              <p className="text-[11px] text-[#66736B]">Diverted from municipal landfills.</p>
            </div>

            <div className="bg-white rounded-[16px] p-5 border border-[#E3E9E4] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#66736B] uppercase tracking-wider">Sharing Efficiency</span>
                <div className="w-8 h-8 rounded-xl bg-[#EBF3FE] text-[#2563EB] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#17251E]">
                {impact.sharing_efficiency_percent || 0}%
              </div>
              <p className="text-[11px] text-[#66736B]">Completed handovers per share posted.</p>
            </div>

          </div>

          {/* Detailed Food Utilization Overview */}
          <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
            <div className="pb-4 border-b border-[#E3E9E4]">
              <h2 className="text-lg font-bold text-[#17251E]">Food Utilization Breakdown</h2>
              <p className="text-xs text-[#66736B]">Aggregated database metrics for the selected timeframe.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#66736B]">
                  <PlusCircle className="w-3.5 h-3.5 text-[#1F6F4A]" />
                  <span>Items Added</span>
                </div>
                <div className="text-xl font-bold text-[#17251E]">{overview.items_added || 0}</div>
              </div>

              <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#66736B]">
                  <Utensils className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Consumed</span>
                </div>
                <div className="text-xl font-bold text-[#17251E]">
                  {overview.consumed_total_kg || 0} <span className="text-xs font-normal text-[#66736B]">kg ({overview.consumed_count || 0} times)</span>
                </div>
              </div>

              <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#66736B]">
                  <Trash2 className="w-3.5 h-3.5 text-[#D9534F]" />
                  <span>Wasted</span>
                </div>
                <div className="text-xl font-bold text-[#17251E]">
                  {overview.wasted_total_kg || 0} <span className="text-xs font-normal text-[#66736B]">kg ({overview.wasted_count || 0} times)</span>
                </div>
              </div>

              <div className="p-4 rounded-[12px] bg-[#F8FAF6] border border-[#E3E9E4] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#66736B]">
                  <Share2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Shares Completed</span>
                </div>
                <div className="text-xl font-bold text-[#17251E]">
                  {overview.shares_completed || 0} <span className="text-xs font-normal text-[#66736B]">of {overview.shares_created || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consumption & Waste Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Consumption by Category */}
            <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#17251E] flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#2563EB]" />
                <span>Top Consumed Categories</span>
              </h3>

              {consumptionCategories.length === 0 ? (
                <p className="text-xs text-[#66736B] py-6 text-center">No consumption records in this period.</p>
              ) : (
                <div className="space-y-3">
                  {consumptionCategories.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#17251E]">
                        <span>{item.category}</span>
                        <span>{item.quantity} kg ({item.count} items)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F8FAF6] overflow-hidden">
                        <div 
                          className="h-full bg-[#2563EB] rounded-full"
                          style={{ width: `${Math.min(100, (item.quantity / (overview.consumed_total_kg || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Waste by Reason */}
            <div className="bg-white rounded-[16px] p-6 border border-[#E3E9E4] shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#17251E] flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-[#D9534F]" />
                <span>Waste Breakdown by Reason</span>
              </h3>

              {wasteReasons.length === 0 ? (
                <div className="py-6 text-center text-[#1F6F4A] text-xs font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero food wasted in this timeframe! Great job!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {wasteReasons.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#17251E]">
                        <span>{item.reason}</span>
                        <span className="text-[#D9534F]">{item.quantity} kg</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F8FAF6] overflow-hidden">
                        <div 
                          className="h-full bg-[#D9534F] rounded-full"
                          style={{ width: `${Math.min(100, (item.quantity / (overview.wasted_total_kg || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default AnalyticsPage;
