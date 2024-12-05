
import Sidebar from '../../components/sidebar/Sidebar.jsx'
import MessageContainer from '../../components/messages/MessageContainer.jsx'
import './Home.css';

const Home = () => {
  return (
    <div className='flex w-screen rounded-lg overflow-hidden bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0 home-large'>
      <Sidebar />
      <MessageContainer />
    </div>
  );
};

export default Home

