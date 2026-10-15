import React, { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import useAuth from '../hooks/useAuth';
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
  RefreshCw,
  Award,
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Building2
} from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
];

export const AnalyticsPage = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('30d');
  
  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [consumptionData, setConsumptionData] = useState(null);
  const [wasteData, setWasteData] = useState(null);
  const [sharingData, setSharingData] = useState(null);
  const [badgeData, setBadgeData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ov, cs, ws, sh, bData, lData] = await Promise.all([
        analyticsService.getOverview(period),
        analyticsService.getConsumptionData(period),
        analyticsService.getWasteData(period),
        analyticsService.getSharingData(period),
        analyticsService.getBadges(),
        analyticsService.getLeaderboard()
      ]);

      setOverviewData(ov);
      setConsumptionData(cs);
      setWasteData(ws);
      setSharingData(sh);
      setBadgeData(bData);
      setLeaderboardData(lData?.leaderboard || []);
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

          {/* Eco-Recognition & Percentile Rank Card */}
          <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#E3E9E4]">
              <div>
                <h2 className="text-lg font-bold text-[#17251E] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#1F6F4A]" />
                  <span>Eco-Recognition & Percentile Rank</span>
                </h2>
                <p className="text-xs text-[#66736B]">
                  Powered by PostgreSQL Materialized View <code className="bg-[#F8FAF6] px-1 py-0.5 rounded text-[11px] font-mono">mview_user_eco_badges</code>
                </p>
              </div>
              {badgeData && (
                <span className="text-xs font-bold text-[#1F6F4A] bg-[#DCEFE3] border border-[#7FAF8A]/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{badgeData.badge || 'Eco Starter 🌱'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Badge Trophy Box */}
              <div className="rounded-[16px] p-6 bg-gradient-to-br from-[#174F37] via-[#1F6F4A] to-[#2E8B57] text-white shadow-md flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3E6B7]">Current Status</span>
                  <Crown className="w-6 h-6 text-[#FCD34D]" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-extrabold tracking-tight">
                    {badgeData?.badge || 'Eco Starter 🌱'}
                  </div>
                  <div className="text-xs text-[#DCEFE3] font-medium">
                    Quartile #{badgeData?.quartile || 1} • {badgeData?.percentile_rank_percent >= 75 ? 'Top Tier Contributor' : 'Active Contributor'}
                  </div>
                </div>
                <p className="text-[11px] text-[#A3E6B7] leading-relaxed pt-2 border-t border-white/15">
                  Awarded based on community food sharing volume and verified waste diversion.
                </p>
              </div>

              {/* Percentile Standing & Ranks */}
              <div className="md:col-span-2 rounded-[16px] p-6 bg-[#F8FAF6] border border-[#E3E9E4] flex flex-col justify-between space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#17251E] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#1F6F4A]" />
                      <span>Community Percentile Standing</span>
                    </span>
                    <span className="font-extrabold text-[#1F6F4A]">
                      Top {Math.max(1, (100 - (badgeData?.percentile_rank_percent || 0))).toFixed(0)}% ({badgeData?.percentile_rank_percent || 0}th percentile)
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-[#E3E9E4] rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-[#1F6F4A] to-[#10B981] rounded-full transition-all duration-700 shadow-xs"
                      style={{ width: `${Math.max(12, badgeData?.percentile_rank_percent || 0)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#66736B]">
                    <span>0% (Eco Starter)</span>
                    <span>50% (Veteran)</span>
                    <span>75% (Champion)</span>
                    <span>90%+ (Master)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E3E9E4]">
                  <div className="p-3.5 rounded-[12px] bg-white border border-[#E3E9E4] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#66736B] font-semibold">
                      <Trophy className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Global Standing</span>
                    </div>
                    <div className="text-xl font-bold text-[#17251E]">
                      #{leaderboardData.find(l => l.user_id === user?.id)?.global_rank || 1} <span className="text-xs font-normal text-[#66736B]">Rank</span>
                    </div>
                    <div className="text-[10px] text-[#1F6F4A] font-medium">Across all communities</div>
                  </div>

                  <div className="p-3.5 rounded-[12px] bg-white border border-[#E3E9E4] space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#66736B] font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Apartment Rank</span>
                    </div>
                    <div className="text-xl font-bold text-[#17251E]">
                      #{leaderboardData.find(l => l.user_id === user?.id)?.apartment_rank || 1} <span className="text-xs font-normal text-[#66736B]">Rank</span>
                    </div>
                    <div className="text-[10px] text-[#2563EB] font-medium">{user?.display_apartment_name || 'My Apartment'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Food Savers Leaderboard Section */}
          <div className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E3E9E4] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#E3E9E4]">
              <div>
                <h2 className="text-lg font-bold text-[#17251E] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#D97706]" />
                  <span>Community Food Savers Leaderboard</span>
                </h2>
                <p className="text-xs text-[#66736B]">
                  Resident standings ordered by total food shared (kg) via database view <code className="bg-[#F8FAF6] px-1 py-0.5 rounded text-[11px] font-mono">v_user_community_leaderboard</code>
                </p>
              </div>
              <div className="text-xs font-semibold text-[#66736B]">
                Top Contributors
              </div>
            </div>

            {leaderboardData.length === 0 ? (
              <div className="py-8 text-center text-[#66736B] text-xs">
                No leaderboard activity recorded yet. Start sharing food to appear on the board!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3E9E4] text-[11px] font-bold text-[#66736B] uppercase tracking-wider bg-[#F8FAF6]">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Resident</th>
                      <th className="py-3 px-4">Total Shared</th>
                      <th className="py-3 px-4">Completed Shares</th>
                      <th className="py-3 px-4 text-right">Recognition Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E9E4] text-xs">
                    {leaderboardData.map((row) => {
                      const isCurrentUser = row.user_id === user?.id;
                      return (
                        <tr
                          key={row.user_id}
                          className={`transition-colors ${
                            isCurrentUser
                              ? 'bg-[#DCEFE3]/50 font-semibold'
                              : 'hover:bg-[#F8FAF6]/60'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold">
                            {row.global_rank === 1 && <span className="text-base mr-1">🥇</span>}
                            {row.global_rank === 2 && <span className="text-base mr-1">🥈</span>}
                            {row.global_rank === 3 && <span className="text-base mr-1">🥉</span>}
                            <span className={row.global_rank <= 3 ? 'text-[#1F6F4A]' : 'text-[#66736B]'}>
                              #{row.global_rank}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#17251E]">
                            <div className="flex items-center gap-2">
                              <span>{row.full_name}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1F6F4A] text-white">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#1F6F4A]">
                            {row.total_shared_kg} kg
                          </td>
                          <td className="py-3.5 px-4 text-[#66736B]">
                            {row.completed_shares_count} shares
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              row.global_rank === 1
                                ? 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]'
                                : row.global_rank <= 3
                                ? 'bg-[#DCEFE3] text-[#1F6F4A] border-[#7FAF8A]/40'
                                : 'bg-[#F8FAF6] text-[#66736B] border-[#E3E9E4]'
                            }`}>
                              {row.global_rank === 1 ? 'Zero-Waste Master 👑' : row.global_rank <= 3 ? 'Community Champion 🏆' : 'Food Saver Veteran ⭐'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default AnalyticsPage;
