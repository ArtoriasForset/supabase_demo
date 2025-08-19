'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [messages, setMessages] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setFiles(Array.from(e.target.files))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    const msgs: string[] = []

    try {
      // 获取当前用户
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessages(['请先登录'])
        setUploading(false)
        return
      }
      const userId = session.user.id

      for (const file of files) {
        const timestamp = Date.now()
        const filePath = `${userId}/${timestamp}_${file.name}` // 添加时间戳避免重名

        msgs.push(`正在上传: ${file.name}`)
        setMessages([...msgs])

        // 上传到 Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('private-files')
          .upload(filePath, file, { 
            cacheControl: '3600', 
            upsert: false 
          })

        if (uploadError) {
          msgs.push(`❌ ${file.name} 上传失败: ${uploadError.message}`)
          console.error('Upload error:', uploadError)
        } else {
          msgs.push(`✅ ${file.name} 上传成功`)
          console.log('Upload success:', uploadData)
        }
      }

    } catch (error) {
      msgs.push(`❌ 上传过程发生错误: ${error}`)
      console.error('Upload process error:', error)
    }

    setMessages(msgs)
    setUploading(false)
    setFiles([])
    
    // 清空文件输入
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="p-6 border rounded-lg w-full max-w-md bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-gray-800">文件上传</h2>
      
      <input 
        type="file" 
        multiple 
        onChange={handleFileChange} 
        className="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        accept="*/*"
      />
      
      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">选中的文件:</h3>
          <ul className="space-y-1">
            {files.map((file, index) => (
              <li key={index} className="text-sm text-gray-600 flex justify-between">
                <span>{file.name}</span>
                <span>({(file.size / 1024).toFixed(1)} KB)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button 
        onClick={handleUpload} 
        disabled={uploading || files.length === 0} 
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400 hover:bg-blue-600 transition-colors"
      >
        {uploading ? '上传中...' : '上传文件'}
      </button>
      
      {messages.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">上传状态:</h3>
          <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm mb-1">{msg}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
