// app/page.tsx
import React from 'react'

interface Task {
  id: number
  title: string
  status: string
  created_at: string
}

// SSR 方式获取数据（Next.js 13+，默认服务器组件）
async function getTasks(): Promise<Task[]> {
  const res = await fetch('http://101.126.80.44:3001/tasks', {
    cache: 'no-store', // 不缓存，实时请求
  })
  if (!res.ok) {
    throw new Error('Failed to fetch tasks')
  }
  return res.json()
}

export default async function Page() {
  const tasks = await getTasks()

  return (
    <main className="p-4">
      <h1>任务列表</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <strong>{task.title}</strong> - 状态: {task.status} - 创建时间:{' '}
            {new Date(task.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </main>
  )
}
