import { useState } from 'react';
import { FaComments, FaUsers } from 'react-icons/fa'; // ← Importamos iconos
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
      const response = await axios.post('/api/communities', {
        name: form.name,
        description: form.description,
        image: form.image || '/default-community.png',
      });
      setShowForm(false);
      setForm({ name: '', description: '', image: '' });
      await refetchCommunities();
    } catch (error) {
      console.error('Error creating community', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="py-2 flex flex-col overflow-auto">
      {/* Navigation buttons */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            view === 'conversations'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setView('conversations')}
        >
          <div className="flex items-center justify-center gap-2">
            <FaComments className="w-4 h-4" />
            <span className="hidden sm:inline">Conversations</span>
          </div>
        </button>

        <button
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            view === 'communities'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setView('communities')}
        >
          <div className="flex items-center justify-center gap-2">
            <FaUsers className="w-4 h-4" />
            <span className="hidden sm:inline">Communities</span>
          </div>
        </button>
      </div>

      {view === 'conversations' && (
        <>
          {Array.isArray(conversations.filteredUser) && conversations.filteredUser.map((conversation, idx) => (
            <Conversation
              key={conversation._id}
              conversation={conversation}
              lastIdx={idx === conversations.filteredUser.length - 1}
            />
          ))}
          {loadingConversations && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
        </>
      )}

      {view === 'communities' && (
        <>
          {Array.isArray(communities) && communities.map((community, idx) => (
            <div key={community._id} className="flex gap-3 items-center p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200"
              onClick={() => setSelectedConversation({
                _id: community._id,
                name: community.name,
                type: "community",
                image: community.image,
              })}
            >
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring-2 ring-gray-200">
                  <img src={community.image} alt="community avatar" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{community.name}</p>
                <span className="text-sm text-gray-500 truncate">{community.description}</span>
              </div>
            </div>
          ))}
          {loadingCommunities && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-circle bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              +
            </button>
          </div>

          {showForm && (
            <div className="p-4 mt-4 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="text"
                name="name"
                placeholder="Community Name"
                className="input input-bordered w-full mb-3 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={form.name}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                className="input input-bordered w-full mb-3 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={form.description}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL (optional)"
                className="input input-bordered w-full mb-3 bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={form.image}
                onChange={handleInputChange}
              />
              <button
                onClick={handleCreateCommunity}
                className={`btn btn-primary w-full ${creating ? 'loading' : ''}`}
              >
                Create Community
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Conversations;
