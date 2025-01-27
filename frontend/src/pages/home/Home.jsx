import Sidebar from '../../components/sidebar/Sidebar';
import MessageContainer from '../../components/messages/messageContainer';
import SecurityOptions from '../../components/security/securityOptions';
import PostQuantumEducation from '../../components/education/postQuantumEducation';
import './home.css';

const Home = () => {
  return (
    <div className='flex w-screen rounded-lg overflow-hidden bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0 home-large'>
      <Sidebar />
      <MessageContainer />
      <SecurityOptions />
      <PostQuantumEducation />
    </div>
  );
};

export default Home;

