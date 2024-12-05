import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";

const Messages = () => {
	const { messages, loading} = useGetMessages();

  useListenMessages();
  return (
    <div className='px-4 flex-1 overflow-auto'>
       
       {!loading &&
				messages.length > 0 &&
				messages.map((message, idx) => (
						<Message key={message._id || idx} message={message} />
				))}
			
      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={`skeleton-${idx}`} />)}
			
      {!loading && messages.length === 0 && (
				<p className='text-center'>Send a message to start the conversation</p>
			)}

      {/* Mostrar PDFs relacionados */}
      {/* {!loading && pdfUrls.length > 0 && (
        <div className="pdf-container">
          <h3 className="text-lg font-bold mt-4">Attached PDFs:</h3>
          <ul>
            {pdfUrls.map((url, index) => (
              <li key={index} className="mb-2">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Ver PDF {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </div>
  )
}

export default Messages;

// const Messages = () => {
//   return (
//     <div className='px-4 flex-1 overflow-auto'>
//       <Message/>
//       <Message/>
//       <Message/>
//       <Message/>
//       <Message/>
//       <Message/>
//     </div>
//   )
// }