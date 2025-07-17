import React from 'react';
import { BiLogOut } from 'react-icons/bi';
import useLogout from '../../hooks/useLogout';

const LogoutButton = () => {
  const {loading, logout} = useLogout();

  return (
    <div className="mt-auto">
      {!loading ? (
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-all duration-200 group"
        >
          <BiLogOut className='w-5 h-5 group-hover:scale-110 transition-transform duration-200' />
          <span className="font-medium">Logout</span>
        </button>
      ) : (
        <div className="flex items-center justify-center py-3">
          <span className='loading loading-spinner loading-md'></span>
        </div>
      )}
    </div>
  )
}

export default LogoutButton
