import { useState } from 'react';
import Conversation from './Conversation.jsx';
import useGetConversations from "../../hooks/useGetConversations.js";
import useGetCommunities from "../../hooks/useGetCommunities.js";
import { getRandomEmoji } from '../../utils/emoji.js';
import useConversation from '../../zustand/useConversation.js';
import axios from 'axios';

const Conversations = () => {
  const [view, setView] = useState('conversations');
  const { loading: loadingConversations, conversations } = useGetConversations();
  const { loading: loadingCommunities, communities, refetch: refetchCommunities } = useGetCommunities();
  const { setSelectedConversation } = useConversation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [creating, setCreating] = useState(false);

  const handleInputChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateCommunity = async () => {
    if (!form.name || !form.description) return;

    setCreating(true);
    try {
      const response = await axios.post('https://chatapp-7lh7.onrender.com/api/communities', {
        name: form.name,
        description: form.description,
        image: form.image || '/default-community.png',
      });
      setShowForm(false);
      setForm({ name: '', description: '', image: '' });
      await refetchCommunities(); // Actualiza las comunidades
    } catch (error) {
      console.error('Error creating community', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className='py-2 flex flex-col overflow-auto'>

      <div className="flex justify-around mb-4">
        <button className={`btn ${view === 'conversations' ? 'btn-active' : ''}`} onClick={() => setView('conversations')}>
          Conversations
        </button>
        <button className={`btn ${view === 'communities' ? 'btn-active' : ''}`} onClick={() => setView('communities')}>
          Communities
        </button>
      </div>

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
          {loadingConversations && <span className='loading loading-spinner mx-auto'></span>}
        </>
      )}

      {view === 'communities' && (
        <>
          {Array.isArray(communities) && communities.map((community, idx) => (
            <div key={community._id} className="flex gap-2 items-center p-2 py-1 hover:bg-sky-500 rounded cursor-pointer"
              onClick={() => setSelectedConversation({
                _id: community._id,
                name: community.name,
                type: "community",
                image: community.image,
              })}
            >
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
          {loadingCommunities && <span className='loading loading-spinner mx-auto'></span>}

          <div className="flex justify-center mt-4">
            <button onClick={() => setShowForm(!showForm)} className="btn btn-circle bg-blue-600 hover:bg-blue-700 text-white text-lg">
              +
            </button>
          </div>

          {showForm && (
            <div className="p-4 mt-2 bg-gray-800 rounded-lg">
              <input
                type="text"
                name="name"
                placeholder="Community Name"
                className="input input-bordered w-full mb-2"
                value={form.name}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                className="input input-bordered w-full mb-2"
                value={form.description}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL (optional)"
                className="input input-bordered w-full mb-2"
                value={form.image}
                onChange={handleInputChange}
              />
              <button
                onClick={handleCreateCommunity}
                className={`btn btn-primary w-full ${creating ? 'loading' : ''}`}
              >
                Create
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Conversations;
