import { useState, useEffect, useCallback } from 'react';
import foodService from '../services/foodService';

export const useFoods = () => {
  const [foods, setFoods] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination Parameters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [storage, setStorage] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [ordering, setOrdering] = useState('expiry_date');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        ordering,
      };
      if (search.trim()) params.search = search.trim();
      if (category !== 'ALL') params.category = category;
      if (storage !== 'ALL') params.storage = storage;
      if (status !== 'ALL') params.status = status;

      const data = await foodService.getFoods(params);
      setFoods(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error('Error fetching food items:', err);
      setError('Unable to load pantry food items. Please check connection.');
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, storage, status, ordering]);

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const data = await foodService.getFoodDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Error fetching food dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const refreshAll = useCallback(() => {
    fetchFoods();
    fetchDashboard();
  }, [fetchFoods, fetchDashboard]);

  const createFoodItem = async (formData) => {
    const result = await foodService.createFood(formData);
    refreshAll();
    return result;
  };

  const updateFoodItem = async (id, formData) => {
    const result = await foodService.updateFood(id, formData);
    refreshAll();
    return result;
  };

  const deleteFoodItem = async (id) => {
    const result = await foodService.deleteFood(id);
    refreshAll();
    return result;
  };

  return {
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
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
  };
};

export default useFoods;
