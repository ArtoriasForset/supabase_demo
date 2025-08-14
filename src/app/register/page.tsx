'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function RegisterPage({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [code, setCode] = useState("")
    const [step, setStep] = useState<"register" | "verify">("register")
    const [message, setMessage] = useState("")

    // 第一步：发送验证码到邮箱
    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setMessage("")

        // 使用 signUp 发送邮箱验证码
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: "" // 留空，邮件里不带链接
            }
        })

        if (error) {
            setMessage("注册失败: " + error.message)
        } else {
            setStep("verify")
            setMessage("验证码已发送到邮箱，请输入验证码完成注册。")
        }
    }

    // 第二步：验证 6 位验证码
    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()
        setMessage("")

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: "signup"
        })

        if (error) {
            setMessage("验证码验证失败: " + error.message)
        } else {
            setMessage("注册成功！")
            router.push("/task")
        }
    }

    return (
        <div className="max-w-md mx-auto p-4 mt-[20vh] mb-[50vh] bg-gray-100 rounded shadow">
            {step === "register" ? (
                <form onSubmit={handleRegister}>
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
                </form>
            ) : (
                <form onSubmit={handleVerify}>
                    <p className="mb-2">{message}</p>
                    <input
                        type="text"
                        placeholder="输入邮箱收到的6位验证码"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className="border border-yellow-500 p-2 my-2 w-full focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                    />
                    <button type="submit" className="bg-yellow-600 text-white text-xl p-2 w-full hover:bg-yellow-500 transition-colors">验证验证码</button>
                </form>
            )}
            {message && step === "register" && <p className="mt-4 text-center">{message}</p>}
        </div>
    )
}
