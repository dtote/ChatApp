import React from 'react'

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-w-96 mx-auto"> 
      <div className="h-full w-full bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40 border border-gray-100 ">
        <h1 className="text-3xl font-semibold text-center text-gray-300">Login
          <span className="text-green-500">ChatApp</span>
        </h1>

        <form>
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Username</span>
            </label>
            <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs text-center" />
          </div>
        </form>
        <div>
          <label className='label p-2'>
            <span className='text-base label-text'>Password</span>
          </label>
          <input type="password" placeholder="Type here" className="input input-bordered w-full max-w-xs text-center" />
        </div>
        <a href="#" className="text-sm hover:underline hove:text-blue-600 mt-2 inline-block">{"Don't"} have an account?</a>

        <div className='btn btn-block btn-sm mt-2'>Login</div>
      </div>
    </div>
  )
}
 
export default Login

// const Login = () => {
//   return (
//     <div className="flex flex-col items-center justify-center min-w-96 mx-auto"> 
//       <div className="h-full w-full bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-40 border border-gray-100 ">
//         <h1 className="text-3xl font-semibold text-center text-gray-300">Login
//           <span className="text-green-500">ChatApp</span>
//         </h1>

//         <form>
//           <div>
//             <label className='label p-2'>
//               <span className='text-base label-text'>Username</span>
//             </label>
//             <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs text-center" />
//           </div>
//         </form>
//         <div>
//           <label className='label p-2'>
//             <span className='text-base label-text'>Password</span>
//           </label>
//           <input type="password" placeholder="Type here" className="input input-bordered w-full max-w-xs text-center" />
//         </div>
//         <a href="#" className="text-sm hover:underline hove:text-blue-600 mt-2 inline-block">{"Don't"} have an account?</a>

//         <div className='btn btn-block btn-sm mt-2'>Login</div>
//       </div>
//     </div>
//   )
// }
