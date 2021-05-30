import React from "react";

export default function Login({ setlogon }) {
  return (
    <div 
      className="text-center"
      style={{
        height: "100vh",
        width: "100vw",
        backgroundImage: "url(img/wallpaper.jpg)",
        backgroundSize: "cover"
      }}
      onClick={() => setlogon(true)}
    >
      <div className="inline-block top-1/2 mx-auto relative -mt-16">
        <img
          className="w-24 h-24 rounded-full mx-auto"
          src="img/avatar.jpg"
          alt="img"
        />
        <div className="mt-2">
          <span className="text-white font-semibold text-xl">Hariom Balhara</span>
        </div>
        <div className="text-gray-200">Click to enter</div>
      </div>
    </div>
  );
}
