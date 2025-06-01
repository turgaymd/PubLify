import Link from "next/link";
import { BiEnvelope, BiUser } from "react-icons/bi";
import { BsEyeSlash } from "react-icons/bs";
import { CiLock } from "react-icons/ci";

export default function Home() {
  return (
    <div className="container ">
    <div className="auth flex flex-row">
      <div className="left-side  w-full flex-1">
        <Link href="/" className="logo">
        <h2 className="font-bold text-3xl pl-5">PubLify</h2>
        </Link>
      </div>
      <div className="right-side w-full flex-1 flex flex-col items-center justify-center mt-5">
 <div className="switch flex justify-center mt-2 ">
      <button className="log text-white font-bold">Login</button>
      <button className="sign rounded-2xl font-bold border border-gray-200">Sign Up</button>
    </div>
      <form>
        <div className="card flex flex-col gap-3 rounded-2xl shadow-lg">
          <div className="card-header px-2 py-5 text-white">
            <h2 className="text-xl font-bold text-center">Sign Up</h2>
          </div>
          <div className="card-body flex flex-col px-2 py-2">
               <label htmlFor="" >Full Name</label> 
            <div className="mb-3 flex flex-col relative"> 
               <i className="absolute">
                <BiUser/>
                  </i>    
              <input type="text" className="px-2 py-2  border border-gray-300 rounded-lg" placeholder="Arif Muradov"/>
            </div>
                          <label htmlFor="password">Password</label> 
              <div className="mb-3 flex flex-col relative">
                 <i className="absolute">
                 <BiUser/>
                  </i>    
              <input type="text" className="px-2 py-2  border border-gray-300 rounded-lg" placeholder="B.01.631.18.022"/>
            </div>
                         <label htmlFor="email" >Email</label> 
            <div className="mb-3 flex flex-col relative">
              <i className="absolute">
               <BiEnvelope/>
                  </i>    
              <input type="email" className="px-2 py-2 w-full border border-gray-300 rounded-lg" placeholder="publify@gmail.com"/>
            </div>
                          <label htmlFor="password">Password</label> 
            <div className="mb-3 flex flex-col relative">
                 <i className="absolute">
                <CiLock/>
                  </i>      
              <input type="password" className="px-2 py-2  border border-gray-300 rounded-lg" placeholder="12345678"/>
           <i className="absolute right-0 pr-3">
            <BsEyeSlash/>
           </i>
            </div>
            <div className="terms inline-flex gap-2 items-center">
            <input type="checkbox" placeholder="s" className="bg-blue-500"/>
            <span className="text-sm text-gray-500">  Agree to our Terms of use and Privacy Policy </span>
            </div>
            <div className="submit-btn text-center rounded-lg mb-5">
            <button className="px-7 text-white py-3 font-bold  ">
             Sign up
            </button>
            </div>
  
          <div>
         
          </div>
          </div>
        
        </div>
      </form>
      </div>
    </div>
   
    </div>
  );
}
