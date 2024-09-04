// pages/dashboard.js
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { verifyToken, verifyTokenLogin } from '@/lib/jwt';
import Dashboard from '@/components/Dashboard';
import DefaultLayout from '@/components/DefaultLayout';

const DashboardDemasks = () => {

    return (
        <DefaultLayout></DefaultLayout>
    );
};

export default DashboardDemasks;