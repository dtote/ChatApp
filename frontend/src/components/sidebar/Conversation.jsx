
import useConversation from '../../zustand/useConversation';
import { useSocketContext } from '../../context/SocketContext';

const Conversation = ({ conversation, lastIdx }) => {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(conversation._id)
  const isSelected = selectedConversation?._id === conversation._id;

  return <>
    <div className={`flex gap-3 items-center hover:bg-blue-50 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
      isSelected ? "bg-blue-100 border-l-4 border-blue-500" : ""
    }`} onClick={() => setSelectedConversation(conversation)}>
      <div className={`avatar relative ${isOnline ? "online" : ""}`}>
        <div className='w-12 h-12 rounded-full ring-2 ring-gray-200'>
          <img src={conversation.profilePic} alt="user avatar" className="w-full h-full object-cover rounded-full" />
        </div>
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <div className='flex flex-col flex-1 min-w-0'>
        <div className='flex gap-3 justify-between items-center'>
          <p className={`font-semibold truncate ${
            isSelected ? "text-blue-700" : "text-gray-800"
          }`}>
            {conversation.username}
          </p>
        </div>
        <p className="text-sm text-gray-500 truncate">
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </div>
    {!lastIdx && <div className='border-b border-gray-100 my-1'></div>}
  </>
}

export default Conversation;