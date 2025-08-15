'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Task() {

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login'); // 用户未登录，跳转登录页
      } else {
        setLoading(false); // 用户已登录
      }
    }

    checkUser();

    // 监听登录状态变化
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="container mx-auto p-4 bg-gray-50 rounded shadow m-4 h-[80vh] text-center">
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">填写表单</h1>
          <input type="text" placeholder="输入任务内容" className="border p-2 w-[10vw] mb-4 m-2" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded">添加任务</button>
        </div>
      )}
    </div>
  )
}
