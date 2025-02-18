
import useConversation  from '../../zustand/useConversation';
import { useSocketContext } from '../../context/SocketContext';

const Conversation = ({conversation, lastIdx, emoji}) => {
  const {selectedConversation, setSelectedConversation} = useConversation();
  //console.log(selectedConversation);
  const {onlineUsers} = useSocketContext();
  // console.log(onlineUsers);
  const isOnline = onlineUsers.includes(conversation._id)
  // console.log(isOnline);
  const isSelected = selectedConversation?._id === conversation._id;
  return <>
    <div className={`flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer ${isSelected ? "bg-sky-500": ""}`} onClick={() => setSelectedConversation(conversation) }>
      <div className={`avatar ${isOnline ? "online" : ""}`}>
        <div className='w-12 rounded-full'>
          <img src={conversation.profilePic} alt="user avatar"/>
        </div>
      </div>
      <div className='flex flex-col flex-1'>
        <div className='flex gap-3 justify-between'>
          <p className='font-bold text-gray-200'>{conversation.username}</p>
          <span className='text-xl'>{emoji}</span>
        </div>
      </div>
    </div>
    <div>
    </div>
    {!lastIdx && <div className='divider my-0 py-0 h-1'></div>}
  </>
}

export default Conversation

// Starter Code Snippet for this component
// const Conversation = () => {
//   return <>
//     <div className='flex gap-2 items-center hover:bg-sky-500 rounded p-2 py-1 cursor-pointer'>
//       <div className='avatar online'>
//         <div className='w-12 rounded-full'>
//           <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" alt="user avatar"/>
//         </div>
//       </div>
//       <div className='flex flex-col flex-1'>
//         <div className='flex gap-3 justify-between'>
//           <p className='font-bold text-gray-200'>Usuario 1</p>
//           <span className='text-xl'>🤗</span>
//         </div>
//       </div>
//     </div>
//     <div>
//     </div>
//     <div className='divider my-0 py-0 h-1'></div>
//   </>