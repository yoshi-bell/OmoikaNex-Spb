import { render, screen, waitFor } from '@/test/utils';
import { Sidebar } from '../Sidebar';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { asUserId } from '@/types/brands';

// モックの設定
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/features/auth/api/auth');
vi.mock('@/hooks/useAuthUser');
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 子コンポーネントのモック (副作用を避ける)
vi.mock('@/features/tweets/components/PostTweetForm', () => ({
  PostTweetForm: () => <div data-testid="post-tweet-form" />,
}));

describe('Sidebar (ID 1-8, 1-10: ログアウト機能の堅牢性検証)', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();
  const mockQueryClient = {
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    
    // 💡 プロジェクト規約に従い、外部ライブラリの複雑な型定義を回避
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);
  });

  const mockUser = {
    id: asUserId("user-1"),
    name: "Test User",
    avatar_url: null,
    email: "t@e.com",
    created_at: "now",
    is_following: false,
  };

  it('ID 1-8, 1-10: [正常系] ログアウトが成功し、キャッシュとストアがクリアされること', async () => {
    const user = userEvent.setup();
    const mockClearAuth = vi.fn();

    vi.mocked(useAuthUser).mockReturnValue({
      user: mockUser,
      isInitialLoading: false,
      clearAuth: mockClearAuth,
      setUser: vi.fn(),
      isAuthenticated: true,
    });

    vi.mocked(authApi.signOut).mockResolvedValue({ success: true });

    render(<Sidebar />);

    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(authApi.signOut).toHaveBeenCalledTimes(1); // 💡 攻撃2への防壁検証
      expect(mockQueryClient.clear).toHaveBeenCalled();
      expect(mockClearAuth).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('ログアウトしました');
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('ID 1-8: [異常系] ログアウトAPIが失敗した場合、状態が破棄されずエラーが表示されること', async () => {
    const user = userEvent.setup();
    const mockClearAuth = vi.fn();

    vi.mocked(useAuthUser).mockReturnValue({
      user: mockUser,
      isInitialLoading: false,
      clearAuth: mockClearAuth,
      setUser: vi.fn(),
      isAuthenticated: true,
    });

    // 💡 ログアウト失敗をシミュレート (攻撃1)
    vi.mocked(authApi.signOut).mockResolvedValue({ 
      success: false, 
      error: { type: 'SYSTEM_ERROR', message: 'ログアウトに失敗しました。' } 
    });

    render(<Sidebar />);

    const logoutButton = screen.getByRole('button', { name: /ログアウト/i });
    const clickPromise = user.click(logoutButton);

    // 💡 修正ポイント: ステート更新（再レンダリング）を待機して検証
    await waitFor(() => {
      expect(logoutButton).toBeDisabled();
    });
    
    await clickPromise;

    await waitFor(() => {
      expect(authApi.signOut).toHaveBeenCalledTimes(1);
      // 💡 エラー時は状態を破壊していないことを検証 (状態不整合の防止)
      expect(mockQueryClient.clear).not.toHaveBeenCalled();
      expect(mockClearAuth).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('ログアウトに失敗しました。');
      // ボタンが再び活性化されること
      expect(logoutButton).not.toBeDisabled();
    });
  });

  it('ID 1-X: [UX] 認証初期化中 (isInitialLoading) は、ログイン/ログアウトボタンを表示しないこと', () => {
    // 💡 初期化中をシミュレート (攻撃3)
    vi.mocked(useAuthUser).mockReturnValue({
      user: null,
      isInitialLoading: true,
      clearAuth: vi.fn(),
      setUser: vi.fn(),
      isAuthenticated: false,
    });

    render(<Sidebar />);

    // ローディング中はどちらのボタンも存在しないことを検証 (チラつき防止)
    expect(screen.queryByRole('button', { name: /ログアウト/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ログイン/i })).not.toBeInTheDocument();
  });
});
