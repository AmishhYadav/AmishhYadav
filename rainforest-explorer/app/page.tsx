"use client"

import LoginForm from "@/components/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 ease-in-out"
        style={{
          backgroundImage: `url('/rainforest-login-bg.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0"></div>
      <div className="relative z-10 w-full max-w-md px-4">
        <LoginForm />
      </div>

      {/* Add global styles for the zoom effect */}
      <style jsx global>{`
        body.dropdown-open .min-h-screen > div:first-child {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  )
}
