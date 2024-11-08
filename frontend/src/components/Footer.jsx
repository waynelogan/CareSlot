import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10  mt-40 text-sm'>

        <div>
          {/* <img className='mb-5 w-40' src={assets.logo} alt="" /> */}
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>Welcome to a new era of healthcare at your fingertips! At Careslot, we're here to simplify your healthcare journey—bringing trusted doctors and seamless appointment booking directly to you. We believe healthcare should be as easy as a few clicks, allowing you to focus on what matters most: your health and wellness. Join our growing community and experience personalized, quality healthcare anytime, anywhere.</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>CARESLOT</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+254-769-051-200</li>
            <li>amalspammm@gmail.com</li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2024 @ Careslot.com - All Right Reserved.</p>
      </div>

    </div>
  )
}

export default Footer
