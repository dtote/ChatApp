import React from 'react';
import SearchInput from './SearchInput.jsx';
import Conversations from './Conversations.jsx';
import LogoutButton from './LogoutButton.jsx';

const Sidebar = () => {
  return (
    <div className="bg-white border-r border-gray-200 w-full max-w-[400px] min-w-[320px] p-3 sm:p-4 sidebar-min-width sidebar
      h-full flex flex-col overflow-hidden shadow-lg lg:shadow-lg">

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
