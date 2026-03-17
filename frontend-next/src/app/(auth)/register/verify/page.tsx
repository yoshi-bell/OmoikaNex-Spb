"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/features/auth/api/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * 認証メール送信完了・待機画面
 */
function VerifyContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [isResending, setIsResending] = useState(false);

    const handleResend = async () => {
        if (!email) return;
        setIsResending(true);
        const { success, error } = await authApi.resendVerificationEmail(email);
        
        if (success) {
            toast.success("認証メールを再送信しました。");
        } else {
            toast.error(error?.message || "再送信に失敗しました。");
        }
        setIsResending(false);
    };

    return (
        <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-indigo-100 p-4 rounded-full">
                    <Mail className="h-12 w-12 text-indigo-600" />
                </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
                メールをご確認ください
            </h1>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
                <span className="font-bold text-indigo-600">{email}</span> 宛に認証メールを送信しました。<br />
                メール内のリンクをクリックして、登録を完了させてください。
            </p>

            <div className="space-y-4">
                <Button 
                    onClick={handleResend}
                    disabled={isResending || !email}
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white py-6 rounded-full font-bold transition-all disabled:opacity-50"
                >
                    {isResending ? "送信中..." : "認証メールを再送信する"}
                </Button>

                <Link 
                    href="/login"
                    className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    ログイン画面へ戻る
                </Link>
            </div>
        </div>
    );
}

export default function RegisterVerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
