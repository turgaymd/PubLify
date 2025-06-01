"use client"
import Link from "next/link";
import {useState} from "react";
import { FaApple, FaFacebookF, FaTwitter } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Register from "../app/components/Register"
export default function Home() {
  const [isLogin, setIsLogin]=useState(false)
  return (
    <div className="container ">
      <div className="auth flex  sm:flex-row flex-col">
        <div className="left-side  w-full flex-1">
          <Link href="/" className="logo">
            <h2 className="font-bold text-3xl pl-5">Publify</h2>
          </Link>
        </div>
        <div className="right-side w-full flex-1 flex flex-col items-center justify-center">
          <div className="switch flex justify-center mb-5 ">
            <button className="log font-bold border border-gray-200" onClick={()=>setIsLogin(true)}>Login</button>
            <button className="switched-btn text-white rounded-2xl font-bold " onClick={()=>setIsLogin(false)}>
              Sign Up
            </button>
          </div>
               {
            isLogin ? <></> : (
              <>
            <Register/>
              </>
            )
          }
          <div className="social flex gap-3 mt-4">
            <ul className="flex gap-7">
              <li className="">
                <Link href="/" className="flex">
                <i><FaFacebookF color="#0E88F0"/></i>
                </Link>
              </li>
                    <li className="">
                <Link href="/" className="flex">
                 <i><FaApple/></i>
                </Link>
              </li>
                    <li className="">
                <Link href="/" className="flex">
                <i> <FcGoogle color="blue"/></i>
                </Link>
              </li>
                    <li className="">
                <Link href="/" className="flex">
                <i><FaTwitter  color="#47ACDF"/></i>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
