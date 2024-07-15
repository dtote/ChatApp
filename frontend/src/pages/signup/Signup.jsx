import React from 'react'
import GenderCheckBox from './GenderCheckBox'

const Signup = () => {
  return (
    <div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
      <div className='w-full max-w-xs bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40'>
        <h1 className='text-3xl font-semibold text-center text-gray-300'>
          Signup
          <span className='text-green-500'>ChatApp</span>
        </h1>

        <form>
          <div>
            <label className='label p-2'> 
              <span className='text-base label-text'>Username</span>
            </label>
            <input type='text' placeholder='Type here' className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>
          <div>
            <label className='label p-2'> 
              <span className='text-base label-text'>Password</span>
            </label>
            <input type='password' placeholder='Enter password' className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>
          <div>
            <label className='label p-2'> 
              <span className='text-base label-text'>Confirm Password</span>
            </label>
            <input type='password' placeholder='Confirm password' className='input input-bordered w-full max-w-xs text-center h-10' />
          </div>

          { /* Gender Checkbox goes here*/}
          <GenderCheckBox/>
    
          <a className='text-sm hover:underline hover:text-green-600 mt-4 inline-block' href="#" >
            {"Already have an account?"}
          </a>

          <div>
            <button className='btn btn-block btn-sm mt-2 border border-slate-700'>Sign Up</button>
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
