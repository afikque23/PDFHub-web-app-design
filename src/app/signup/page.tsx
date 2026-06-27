"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { Button } from "../components/ui/button";

export default function SignUp() {
  const router = useRouter();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder sign up behavior
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-12">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-primary-hover transition-colors">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-text-primary">PDFHub</span>
          </Link>
          <h1 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight mb-2">Create Account</h1>
          <p className="text-[#666666] text-[16px]">Sign up now and get full access to our PDF tools</p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          <div>
            <label className="block text-[14px] font-medium text-[#1a1a1a] mb-2" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                required
                className="w-full h-12 px-4 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-[#9ca3af]"
                placeholder="Full Name"
              />
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1a1a1a] mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                className="w-full h-12 px-4 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-[#9ca3af]"
                placeholder="Email Address"
              />
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1a1a1a] mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                className="w-full h-12 px-4 bg-[#f8f9fa] border border-[#e5e7eb] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-[#9ca3af]"
                placeholder="Password"
              />
            </div>
          </div>
          
          <div className="flex items-center mt-1 mb-2">
            <input 
              type="checkbox" 
              id="terms" 
              required
              className="w-4 h-4 rounded border-[#d1d5db] text-primary focus:ring-primary"
            />
            <label htmlFor="terms" className="ml-2 text-[14px] text-[#4b5563]">
              I agree to the <a href="#" className="font-medium text-primary hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-primary hover:underline">Privacy Policy</a>
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full h-12 text-[16px] rounded-[8px] shadow-none mt-2">
            Sign Up
          </Button>
        </form>

        <p className="mt-8 text-center text-[15px] text-[#4b5563]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-hover transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
