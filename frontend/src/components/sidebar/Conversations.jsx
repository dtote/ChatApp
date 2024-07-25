import React from 'react'
import Conversation from './Conversation.jsx'
import useGetConversations from "../../hooks/useGetConversations";
import { getRandomEmoji } from '../../utils/emoji.js';

const Conversations = () => {
	const { loading, conversations } = useGetConversations();
  // console.log("Conversations:",conversations);
	return (
		<div className='py-2 flex flex-col overflow-auto'>
			
			{Array.isArray(conversations.filteredUser) && conversations.filteredUser.map((conversation, idx) => (
				<Conversation
					key={conversation._id}
					conversation={conversation}
					emoji={getRandomEmoji()}
					lastIdx={idx === conversations.length - 1}
				/>
			))}

      {loading ? <span className='loading loading-spinner mx-auto'></span> : null }
		</div>
	);
};
export default Conversations;


//Starter Code Snippet for this component
// const Conversations = () => {
//   return (
//     <div className='py-2 flex flex-col overflow-auto'>
//       <Conversation/>
//       <Conversation/>
//       <Conversation/>
//       <Conversation/>
//       <Conversation/>
//       <Conversation/>
//     </div>
//   )
// }