import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "数字化管理平台",
  description: "西安巨果电子科技有限公司",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cn">
      <body
        className="min-h-screen flex flex-col"
      >
        <header>
          <nav className="flex text-sl items-end h-full z-10">

            <Link href="/" className="h-20">
              <Image src="/LOGO.png" alt="公司Logo" width={120} height={40}></Image>
            </Link>

            <div className="relative group p-4 transform hover:bg-gray-200 transition z-10">
              <Link href="/task" className="p-4 font-semibold hover:underline underline-offset-8">首页</Link>
              <div className="absolute absolute left-0 top-full bg-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100">
                <Link href="/task" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  宣传页面
                </Link>
                <Link href="/task/create" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  业务介绍
                </Link>
              </div>
            </div>

            <div className="relative group p-4 transform hover:bg-gray-200 transition w-32 z-10">
              <Link href="/task" className="p-4 font-semibold hover:underline underline-offset-8">公司简介</Link>
              <div className="absolute absolute w-32 text-center left-0 top-full bg-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100">
                <Link href="/task" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  企业资质
                </Link>
                <Link href="/task/create" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  企业文化
                </Link>
              </div>
            </div>

            <div className="relative group p-4 transform hover:bg-gray-200 transition w-32 z-10">
              <Link href="/task" className="p-4 font-semibold hover:underline underline-offset-8">办公地址</Link>
              <div className="absolute text-center absolute left-0 w-32 top-full bg-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100">
                <Link href="/task" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  全国布局图
                </Link>
              </div>
            </div>

            <div className="relative group p-4 transform hover:bg-gray-200 transition w-36 z-10">
              <Link href="/task" className="p-4 font-semibold hover:underline underline-offset-8">产品与服务</Link>
              <div className="absolute text-center w-36 absolute left-0 top-full bg-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100">
                <Link href="/task" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  共享办公室
                </Link>
                <Link href="/task/create" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  虚拟办公室
                </Link>
                <Link href="/task" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  定制办公室
                </Link>
              </div>
            </div>

            <div className="relative group p-4 transform hover:bg-gray-200 transition w-36 z-10">
              <Link href="/task" className="p-4 font-semibold hover:underline underline-offset-8">客户端下载</Link>
              <div className="absolute text-center w-36 absolute left-0 top-full bg-gray-200 invisible group-hover:visible opacity-0 group-hover:opacity-100">
                <Link href="/task" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  安卓下载
                </Link>
                <Link href="/task/create" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  iOS下载
                </Link>
                <Link href="/task" className="block p-4 text-gray-700 hover:bg-gray-100 hover:text-red-500">
                  电脑端下载
                </Link>
              </div>
            </div> 

            <div className="ml-auto flex items-center space-x-4 m-4 h-4">
              <p>联系电话 </p>
              <p className="text-red-500 font-bold">13232917222</p>
              <Link href="/login" className="transform hover:scale-125 text-white transition bg-red-500 p-2">登录</Link>
              <Link href="/register" className="transform hover:scale-125 transition text-white bg-red-500 p-2">注册</Link>
            </div>  
          </nav>
        </header>
        {children}
        <footer className="p-4 bg-gray-100 text-gray-900 w-full items-center">
          <p className="bg-gray-100 w-36 p-2 font-semibold text-center">合作伙伴</p>
          <p className=" bg-red-500 text-white p-2 w-36 text-center transform hover:scale-110 transition">代理 / 特许加盟</p>
          <p className="font-sans m-2 text-center text-sm">©2025</p>
        </footer>
      </body>
      
    </html>
  );
}
