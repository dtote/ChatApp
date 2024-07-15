import React from 'react'
import Conversation from './Conversation.jsx'
const Conversations = () => {
  return (
    <div className='py-2 flex flex-col overflow-auto'>
      <Conversation/>
      <Conversation/>
      <Conversation/>
      <Conversation/>
      <Conversation/>
      <Conversation/>
    </div>
  )
}

export default Conversations

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