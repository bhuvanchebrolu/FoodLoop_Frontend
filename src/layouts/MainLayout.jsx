import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import notificationService from '../services/notificationService';
import { 
  Home, 
  Package, 
  Bell, 
  Users, 
  User, 
  LogOut, 
  Leaf,
  Building2,
  Share2,
  Menu,
  X,
  ChevronRight,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  Shield
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification State
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications({ page_size: 5 });
      setNotifications(data.results || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/home', icon: Home, badge: null },
    { label: 'Inventory', path: '/add-food', icon: Package, badge: null },
    { label: 'Alerts', path: '/alerts', icon: Bell, badge: unreadCount > 0 ? `${unreadCount}` : null },
    { label: 'Share Food', path: '/share-food', icon: Share2, badge: null },
    { label: 'Community', path: '/community', icon: Users, badge: null },
    { label: 'Profile', path: '/profile', icon: User, badge: null },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin', path: '/admin', icon: Shield, badge: 'Master' });
  }

  return (
    <div className="min-h-screen bg-[#F8FAF6] flex flex-col md:flex-row font-sans text-[#17251E]">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-[#E3E9E4] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#174F37] to-[#1F6F4A] flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-4 h-4 text-[#DCEFE3]" />
          </div>
          <div>
            <span className="font-bold text-lg text-[#17251E] tracking-tight">FoodLoop</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Bell Icon */}
          <button
            onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
            className="p-2 rounded-xl text-[#17251E] bg-[#F8FAF6] border border-[#E3E9E4] relative"
            aria-label="View Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D9534F] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#17251E] bg-[#F8FAF6] border border-[#E3E9E4] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* SIDEBAR NAVIGATION (Desktop 260px fixed width, Mobile overlay drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 md:z-20 w-64 bg-white border-r border-[#E3E9E4] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(23,37,30,0.03)] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } h-screen`}
      >
        {/* Top Brand Header & Bell Trigger */}
        <div className="p-6 border-b border-[#E3E9E4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#174F37] to-[#1F6F4A] flex items-center justify-center text-white shadow-md">
              <Leaf className="w-6 h-6 text-[#DCEFE3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-[#17251E]">FoodLoop</span>
              </div>
              <p className="text-xs text-[#66736B] font-medium mt-0.5">Community Food Saver</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="text-[11px] uppercase font-bold text-[#98A39D] tracking-wider px-3 mb-2">
            Main Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-3 rounded-[12px] text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#DCEFE3] text-[#1F6F4A] font-semibold shadow-xs'
                      : 'text-[#66736B] hover:text-[#17251E] hover:bg-[#F8FAF6]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#1F6F4A]' : 'text-[#7FAF8A]'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.path === '/alerts' && unreadCount > 0
                          ? 'bg-[#D9534F] text-white'
                          : 'bg-[#F8FAF6] text-[#66736B] border border-[#E3E9E4]'
                      }`}>
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight className="w-4 h-4 text-[#1F6F4A]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Profile & Sign Out Panel */}
        <div className="p-4 border-t border-[#E3E9E4] bg-[#F8FAF6]/50">
          
          {/* User Info Card */}
          <div className="bg-white p-3 rounded-[12px] border border-[#E3E9E4] mb-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#174F37] to-[#1F6F4A] text-white font-bold flex items-center justify-center shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#17251E] truncate">
                  {user?.full_name || 'Resident'}
                </p>
                <p className="text-[11px] text-[#66736B] truncate flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-[#7FAF8A] shrink-0" />
                  <span className="truncate">{user?.display_apartment_name}</span>
                </p>
              </div>
            </div>

            {/* Desktop Notification Bell Button */}
            <button
              onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
              className="p-2 rounded-xl text-[#17251E] hover:bg-[#F8FAF6] border border-[#E3E9E4] relative shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D9534F] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-[#D9534F] bg-[#FDF2F2] hover:bg-[#FBE8E8] border border-[#F8B4B4]/40 transition-colors rounded-[10px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

        </div>
      </aside>

      {/* NOTIFICATION DROPDOWN DRAWER */}
      {notifDrawerOpen && (
        <div className="fixed top-16 right-4 md:left-68 md:top-auto md:bottom-20 z-50 w-80 sm:w-96 bg-white rounded-[16px] border border-[#E3E9E4] shadow-xl p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E4]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1F6F4A]" />
              <h3 className="text-sm font-bold text-[#17251E]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9534F] text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#1F6F4A] hover:underline font-semibold flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-xs text-[#66736B] text-center py-6">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-[10px] border text-xs transition-colors flex items-start justify-between gap-2 ${
                    !n.is_read
                      ? 'bg-[#DCEFE3]/30 border-[#7FAF8A]/40'
                      : 'bg-[#F8FAF6] border-[#E3E9E4]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-bold text-[#17251E] block">{n.title}</span>
                    <p className="text-[11px] text-[#66736B] leading-snug">{n.message}</p>
                    <span className="text-[9px] text-[#98A39D] block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1 rounded bg-white text-[#1F6F4A] border border-[#7FAF8A]/40 hover:bg-[#DCEFE3] shrink-0"
                      title="Mark read"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-[#E3E9E4] text-center">
            <button
              onClick={() => { setNotifDrawerOpen(false); navigate('/alerts'); }}
              className="text-xs font-semibold text-[#1F6F4A] hover:underline"
            >
              View All Alerts & Expiry Radar →
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-60px)] md:min-h-screen flex flex-col justify-between">
        <div>
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-[#E3E9E4] text-center text-xs text-[#98A39D]">
          FoodLoop © 2026 — Community Food Waste Reduction Platform
        </footer>
      </main>

    </div>
  );
};

export default MainLayout;
