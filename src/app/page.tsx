'use client';

import Image from "next/image";
import UserStatus from "./UserStatus";
import Link from "next/link";

export default function Home() {
  return (
<>  
<div className="w-full h-[60vh] relative z-0">
  <Image
    src="/beijing.jpg"
    alt="首页主图"
    fill
    className="object-cover"
    priority
  />

  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 drop-shadow-lg bg-gray-50 p-2">数智化产业·创孵云社区</h1>
      <Link href="/task" className="text-xl drop-shadow text-white bg-red-500 transform hover:scale-110 transition inline-block px-3 py-1">点击了解</Link>
    </div>
  </div>
</div>

</>
  );
}
