import React from 'react'

const ForgetPassword = () => {
  return (
    <div className='items-center'>
       <form action="submit">
        <label htmlFor="email" className='block text-sm font-medium text-gray-700'>
            Email
        </label>
         <input 
         className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' 
         type="email" 
         />
        </form> 
    </div>
  )
}

export default ForgetPassword;