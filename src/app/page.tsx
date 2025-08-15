'use client';

import Image from "next/image";
import UserStatus from "./UserStatus";
import Link from "next/link";

export default function Home() {
  return (
<>  
<div className="w-full h-[60vh] relative z-0 bg-gray-100">
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

  <div className="mx-auto p-10 m-8 font-sans text-4xl text-gray-600">
    <p className="mb-4">一体化平台：集“投资+孵化+培训+交流”于一体</p>
 	  <p className="mb-4">六大功能区：创业空间、人才公寓、企业家俱乐部、招商中心、投融资平台、技术展厅 </p>
 	  <p className="mb-4">三大核心中心：研究中心、服务中心、孵化中心</p>
  	<p className="mb-4">重点产业方向：5G、大数据、AI、工业互联网、数字创意</p>
  </div>

</>
  );
}
