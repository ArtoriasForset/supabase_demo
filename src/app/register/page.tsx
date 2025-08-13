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
        
        <form onSubmit={handleRegister} className="max-w-md mx-auto p-4 mb-[50vh] mt-[20vh] bg-gray-100 rounded shadow">
            <input 
                type="email" 
                placeholder="邮箱" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="border border-yellow-500 p-2 my-2 w-full focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
            />
            <input 
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-yellow-500 p-2 my-2 w-full focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
            />
            <button type="submit" className="bg-yellow-600 text-white text-xl p-2 w-full hover:bg-yellow-500 transition-colors">注册</button>
            {message && <p className="mt-4 text-center">{message}</p>}
        </form>
    )

}