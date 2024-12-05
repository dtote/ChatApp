import React, { useState } from 'react';
import Conversation from './Conversation.jsx';
import useGetConversations from "../../hooks/useGetConversations.js";
import useGetCommunities from "../../hooks/useGetCommunities.js";
import { getRandomEmoji } from '../../utils/emoji.js';
import  useConversation  from '../../zustand/useConversation.js';

const Conversations = () => {
  const [view, setView] = useState('conversations'); // Estado para alternar entre conversaciones y comunidades
  const { loading: loadingConversations, conversations } = useGetConversations();
  const { loading: loadingCommunities, communities } = useGetCommunities();
  const { setSelectedConversation } = useConversation(); // Acceso al estado global


  return (
    <div className='py-2 flex flex-col overflow-auto'>
      {/* Selector entre conversaciones y comunidades */}
      <div className="flex justify-around mb-4">
        <button 
          className={`btn ${view === 'conversations' ? 'btn-active' : ''}`} 
          onClick={() => setView('conversations')}
        >
          Conversations
        </button>
        <button 
          className={`btn ${view === 'communities' ? 'btn-active' : ''}`} 
          onClick={() => setView('communities')}
        >
          Communities
        </button>
      </div>

      {/* Mostrar lista de conversaciones o comunidades según el estado */}
      {view === 'conversations' && (
        <>
          {Array.isArray(conversations.filteredUser) && conversations.filteredUser.map((conversation, idx) => (
            <Conversation
              key={conversation._id}
              conversation={conversation}
              emoji={getRandomEmoji()}
              lastIdx={idx === conversations.filteredUser.length - 1}
            />
          ))}
          {loadingConversations ? <span className='loading loading-spinner mx-auto'></span> : null }
        </>
      )}

      {view === 'communities' && (
        <>
          {Array.isArray(communities) && communities.map((community, idx) => (
            <div key={community._id} className="flex gap-2 items-center p-2 py-1 hover:bg-sky-500 rounded cursor-pointer" onClick={() => 
              setSelectedConversation({
                _id: community._id,
                name: community.name,
                type: "community", // Identifica que es una comunidad
                image: community.image, // Opcional, para mostrar el avatar si es necesario
              })
            }>
              <div className="avatar">
                <div className='w-12 rounded-full'>
                  <img src={community.image} alt="community avatar" />
                </div>
              </div>
              <div className='flex flex-col flex-1'>
                <p className='font-bold text-gray-200'>{community.name}</p>
                <span className='text-sm text-gray-400'>{community.description}</span>
              </div>
            </div>
          ))}
          {loadingCommunities ? <span className='loading loading-spinner mx-auto'></span> : null }
        </>
      )}
    </div>
  );
};

export default Conversations;
