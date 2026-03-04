"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { registerSchema, type RegisterFormType } from '@/lib/schemas'
import { authApi } from '@/features/auth/api/auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

/**
 * 新規登録フォーム・コンポーネント
 * 
 * 登録見本画像のデザインを忠実に再現。
 * 「ユーザーネーム」「メールアドレス」「パスワード」の3項目で構成。
 */
export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: RegisterFormType) => {
    setIsLoading(true)
    
    // authApi.signUp を呼び出し、Supabase Auth への登録を実行
    // (内部で name メタデータも送信され、DBトリガーで users テーブルへ同期される)
    const { success, error } = await authApi.signUp(values)

    if (success) {
      toast.success('会員登録が完了しました。')
      router.push('/')
      router.refresh()
    } else {
      console.error('Signup Debug Error:', error); // 生のエラーをログ出力
      toast.error(error?.message || '会員登録に失敗しました。')
      
      if (error?.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
          form.setError(field as keyof RegisterFormType, { 
            message: messages[0] 
          })
        })
      }
    }
    
    setIsLoading(false)
  }

  return (
    <div className="bg-white rounded-lg p-8 shadow-md">
      <h1 className="text-center text-xl font-bold mb-8 text-gray-800">
        新規登録
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ユーザーネーム入力 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="ユーザーネーム" 
                    {...field} 
                    className="h-12 border-gray-300 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* メールアドレス入力 */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="メールアドレス" 
                    type="email"
                    {...field} 
                    className="h-12 border-gray-300 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* パスワード入力 */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="パスワード" 
                    type="password"
                    {...field} 
                    className="h-12 border-gray-300 focus:ring-[#4f46e5] focus:border-[#4f46e5]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 送信ボタン */}
          <div className="flex justify-center mt-8">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-10 py-6 rounded-full font-bold transition-all disabled:opacity-50"
            >
              {isLoading ? '登録中...' : '新規登録'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
