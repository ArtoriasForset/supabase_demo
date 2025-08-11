'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function RegisterPage ({ children }: { children: React.ReactNode }) {

    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    async function handleRegister (e: React.FormEvent) {
        e.preventDefault()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin + "/login"
            }
        })

        if (error) {
            setMessage("注册失败:" + error.message)
        } else if (data.session) {
            // 注册成功并登录
            router.push("/tasks")
        } else {
            setMessage("注册成功! 请检查您的邮箱以验证账户")
        }
    }

    return (
        
        <form onSubmit={handleRegister} className="max-w-md mx-auto p-4 mb-96 mt-32">
            <h1>注册</h1>
            <input 
                type="email" 
                placeholder="邮箱" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="border p-2 my-2 w-full"
            />
            <input 
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border p-2 my-2 w-full"
            />
            <button type="submit" className="bg-blue-500 text-white p-2 w-full">注册</button>
            {message && <p className="mt-4 text-center">{message}</p>}
        </form>
    )

}