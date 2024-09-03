import Dashboard from '@/components/dashboard'
import React from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const page = () => {
  return (
    <div>

    <Dashboard/>
    <ToastContainer />

    </div>
  )
}

export default page