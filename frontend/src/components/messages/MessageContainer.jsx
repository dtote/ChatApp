import React from 'react'
import Messages from './Messages.jsx'
import MessageInput from './MessageInput.jsx'
import { TiMessages } from 'react-icons/ti'

const MessageContainer = () => {
  const noChatSelected = true;
  return (
    <div className='md:min-w[450px] flex flex-col'>
     { NoChatSelected ? <NoChatSelected/> :  (<>
        {/* Chat Header */}
        <div className='bg-slate-500 px-4 py-2 mb-2'>
          <span className='label-text'>To:</span> 
          <span className='text-gray-900 font-bold'>Usuario1</span>
        </div>
        <Messages/>
        <MessageInput/>
      </>)}
    </div>

  )
}

export default MessageContainer

const NoChatSelected = () => {
  return (
    <div className='flex flex-col items-center justify-center w-full h-full'>
      <div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
        <p>Welcome 👋🏻 Usuario1</p>
        <p className='text-3xl text-gray-200'>Select a chat to start messaging</p>
        <TiMessages className='text-3xl md:text-6xl text-center text-gray-200'/>
      </div>
      
    </div>
  )
}
