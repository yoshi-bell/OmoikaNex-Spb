"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, type ProfileFormType, type UserDomain } from "@/lib/schemas";
import { useUpdateProfile } from "@/features/users/hooks/useUpdateProfile";
import { getAvatarUrl } from "@/lib/utils";
import Image from "next/image";
import { Camera } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditProfileModalProps {
    user: UserDomain;
    trigger: React.ReactNode;
}

/**
 * プロフィール編集モーダル・コンポーネント
 * 
 * 名前、自己紹介、アバター画像の更新を担当。
 * 画像プレビュー機能付き。
 */
export function EditProfileModal({ user, trigger }: EditProfileModalProps) {
    const [open, setOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const form = useForm<ProfileFormType>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: user.name,
            profile_text: user.profile_text || "",
        },
    });

    // 画像選択時の処理
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // プレビュー用URLの生成
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    // 保存処理
    const onSubmit = (values: ProfileFormType) => {
        updateProfile(
            {
                userId: user.id,
                name: values.name,
                profileText: values.profile_text,
                avatarFile: selectedFile,
            },
            {
                onSuccess: (result) => {
                    if (result.success) {
                        setOpen(false);
                        // プレビューURLのメモリ解放
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                    }
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-slate-800 bg-[#16181c] text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">プロフィールを編集</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {/* アバター画像編集エリア */}
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div 
                                className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-2 border-slate-700"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Image
                                    src={previewUrl || getAvatarUrl(user.avatar_url, user.updated_at)}
                                    alt="Avatar"
                                    fill
                                    className="object-cover transition-opacity group-hover:opacity-50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-slate-500 text-center">
                                クリックして画像を変更
                            </p>
                        </div>

                        {/* 名前入力 */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-400">名前</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            className="border-slate-700 bg-transparent text-white focus:border-indigo-500"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        {/* 自己紹介入力 */}
                        <FormField
                            control={form.control}
                            name="profile_text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-400">自己紹介</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ""}
                                            disabled={isPending}
                                            rows={4}
                                            className="resize-none border-slate-700 bg-transparent text-white focus:border-indigo-500"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="rounded-full bg-white px-8 font-bold text-black hover:bg-slate-200"
                            >
                                {isPending ? "保存中..." : "保存"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
