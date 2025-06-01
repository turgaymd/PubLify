import { BiEnvelope, BiUser } from "react-icons/bi";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { CiLock } from "react-icons/ci";
import { useState } from "react";
import Link from "next/link";
function Register(){
    const [hide,setHide]=useState(true)
    return(
        <>
            <div className="card flex flex-col gap-3 rounded-xl shadow-lg mt-2">
              <div className="card-header px-2 py-5 text-white">
                <h2 className="text-xl font-bold text-center">Sign Up</h2>
              </div>
              <div className="card-body flex flex-col px-2 py-2">
                <label htmlFor="">Full Name</label>
                <div className="mb-3 flex flex-col relative">
                  <i className="absolute">
                    <BiUser />
                  </i>
                  <input
                    type="text"
                    className="px-2 py-2  border border-gray-300 rounded-lg"
                    placeholder="Arif Muradov"
                  />
                </div>
                <label htmlFor="username">Username</label>
                <div className="mb-3 flex flex-col relative">
                  <i className="absolute">
                    <BiUser />
                  </i>
                  <input
                    type="text"
                    className="px-2 py-2  border border-gray-300 rounded-lg"
                    placeholder="B.01.631.18.022"
                  />
                </div>
                <label htmlFor="email">Email</label>
                <div className="mb-3 flex flex-col relative">
                  <i className="absolute">
                    <BiEnvelope />
                  </i>
                  <input
                    type="email"
                    className="px-2 py-2 w-full border border-gray-300 rounded-lg"
                    placeholder="publify@gmail.com"
                  />
                </div>
                <label htmlFor="password">Password</label>
                <div className="mb-3 flex flex-col relative">
                  <i className="absolute">
                    <CiLock />
                  </i>
                  <input
                    type={ hide ? "password" : "text"}
                    className="px-2 py-2  border border-gray-300 rounded-lg"
                    placeholder="12345678"
                  />
                  <i className="absolute right-0 pr-3" onClick={()=>setHide(!hide)}>
                  { hide ? <BsEyeSlash/> : <BsEye/>}
                  </i>
                </div>
                <div className="terms inline-flex gap-2 items-center">
                  <input
                    type="checkbox"
                    placeholder="s"
                    className="bg-blue-500"
                  />
                  <span className="text-sm text-gray-500">                 
                    Agree to our  {" "}
                    <Link href='/' className="underline">Terms of use</Link> 
                    {" "} and <Link href="/" className="underline">Privacy Policy</Link>
                  </span>
                </div>
                <div className="submit-btn text-center rounded-lg">
                  <button className="px-7 text-white py-3 font-bold  ">
                    Sign up
                  </button>
                </div>
              </div>
            </div>
        </>
    )
}
export default Register;