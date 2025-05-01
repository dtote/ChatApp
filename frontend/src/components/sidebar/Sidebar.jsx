import React from 'react';
import SearchInput from './SearchInput.jsx';
import Conversations from './Conversations.jsx';
import LogoutButton from './LogoutButton.jsx';

const Sidebar = () => {
  return (
    <div className="border-r sm:w-[500px] md:w-[350px] lg:w-[400px] border-slate-500 p-4 
      h-screen flex flex-col overflow-hidden">
      
      <div className="flex flex-col overflow-y-auto min-h-0">
        <SearchInput />
        <div className="divider px-3" />
        <Conversations />
      </div>

      <div className="pt-4 shrink-0 pb-[env(safe-area-inset-bottom,16px)]">
        <LogoutButton />
      </div>
    </div>
  );
};

export default Sidebar;
