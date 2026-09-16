import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAF6] text-[#17251E] flex flex-col justify-between selection:bg-[#DCEFE3] selection:text-[#1F6F4A]">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
