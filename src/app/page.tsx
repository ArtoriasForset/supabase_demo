import Image from "next/image";

export default function Home() {
  return (
<>  
<div className="w-full h-[50vh] relative z-0">
  <Image
    src="/beijing.jpg"
    alt="首页主图"
    fill
    className="object-cover"
    priority
  />

  <div className="absolute inset-0 flex items-center justify-center z-10">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 drop-shadow-lg bg-gray-50 p-2">区块链孵化器数字化管理平台</h1>
      <p className="text-lg drop-shadow text-white bg-red-500 w-24 transform hover:scale-110 transition">点击了解</p>
    </div>
  </div>
</div>

<div className="m-12 p-2 bg-gray-200">测试数据</div>

</>
  );
}
