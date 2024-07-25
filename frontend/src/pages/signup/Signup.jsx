import {React, useState} from 'react'
import GenderCheckbox from './GenderCheckBox.jsx'
import { Link } from 'react-router-dom'
import useSignup from '../../hooks/useSignup.js'

const Signup = () => {
  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });

  const {loading, signup} = useSignup();

  const handleCheckboxChange = (gender) => {
    setInputs({...inputs, gender: gender});
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(inputs);
  };
  return (
    <div className='p-4 flex flex-col items-center justify-center min-w-96 mx-auto w-full max-w-xs bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40'>
      <div className='p-4'>
        <h1 className='text-3xl font-semibold text-center text-gray-300'>
          Signup
          <span className='text-green-500'>ChatApp</span>
        </h1>

        <form onSubmit={handleSubmit} className='p-4'>
          <div>
            <label className='label p-2'> 
              <span className='text-base label-text'>Username</span>
            </label>
            <input type='text' placeholder='Type here' value={inputs.username}
                   onChange={(e) => setInputs({...inputs, username: e.target.value})}
                   className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>
          <div>
            <label className='label p-2'> 
              <span className='text-base label-text'>Email</span>
            </label>
            <input type='text' placeholder='Type here' value={inputs.email}
                   onChange={(e) => setInputs({...inputs, email: e.target.value})}
                   className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>
          <div>
            <label className='label p-2'> 
              <span className='text-base label-text' >Password</span>
            </label>
            <input type='password' placeholder='Enter password' value={inputs.password} 
                  onChange={(e) => setInputs({...inputs, password: e.target.value})}
                  className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>
          <div>
            <label className='label p-2'> 
              <span className='text-base label-text'>Confirm Password</span>
            </label>
            <input type='password' placeholder='Confirm password' value={inputs.confirmPassword} 
                   onChange={(e) => setInputs({...inputs, confirmPassword: e.target.value})}
                   className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>

          <GenderCheckbox onCheckboxChange={handleCheckboxChange} selectedGender={inputs.gender} />

          <Link className='text-sm hover:underline hover:text-green-600 mt-4 inline-block' to={"/login"} >
            {"Already have an account?"}
          </Link>

          <div>
            <button className='btn btn-block btn-sm mt-2 border border-slate-700' disabled={loading}>
              {loading ? <span className='loading loading-spinner'></span> : 'Sign Up'} 
            </button>
          </div>
        </form>
        </div>
    </div>
  )
}

export default Signup

// STARTED CODE FOR THIS COMPONENT
// const Signup = () => {
//   return (
//     <div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
//       <div className='w-full max-w-xs bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40'>
//         <h1 className='text-3xl font-semibold text-center text-gray-300'>
//           Signup
//           <span className='text-green-500'>ChatApp</span>
//         </h1>

//         <form>
//           <div>
//             <label className='label p-2'> 
//               <span className='text-base label-text'>Username</span>
//             </label>
//             <input type='text' placeholder='Type here' className='input input-bordered w-full max-w-xs text-center h-10' />
//           </div>
//           <div>
//             <label className='label p-2'> 
//               <span className='text-base label-text'>Password</span>
//             </label>
//             <input type='password' placeholder='Enter password' className='input input-bordered w-full max-w-xs text-center h-10' />
//           </div>
//           <div>
//             <label className='label p-2'> 
//               <span className='text-base label-text'>Confirm Password</span>
//             </label>
//             <input type='password' placeholder='Confirm password' className='input input-bordered w-full max-w-xs text-center h-10' />
//           </div>

//           { /* Gender Checkbox goes here*/}
//           <GenderCheckBox/>
    
//           <a className='text-sm hover:underline hover:text-green-600 mt-4 inline-block' href="#" >
//             {"Already have an account?"}
//           </a>

//           <div>
//             <button className='btn btn-block btn-sm mt-2 border border-slate-700'>Sign Up</button>
//           </div>
//         </form>
//         </div>
//     </div>
//   )
// }
