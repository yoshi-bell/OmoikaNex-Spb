# Database Schema (データの保存構造)

> [!NOTE]
> アプリケーションが満たすべきデータベース仕様とデータの「構造」「型」を定義します。
> SNSアプリ（Twitterクローン）のコアをなすテーブル設計です。

## ER Diagram (全体関係図)

```mermaid
erDiagram
    users ||--o{ tweets : "posts (1:N)"
    users ||--o{ likes : "likes (1:N)"
    tweets ||--o{ likes : "is liked by (1:N)"
    tweets ||--o{ tweets : "replies to (1:N)"

    users ||--o{ follows : "follows (1:N)"
    users ||--o{ follows : "is followed by (1:N)"

    users {
        bigint id PK
        varchar name
        varchar email UK
    }

    tweets {
        bigint id PK
        bigint user_id FK
        bigint parent_id FK
        text content
    }

    likes {
        bigint id PK
        bigint user_id FK
        bigint tweet_id FK
    }

    follows {
        bigint id PK
        bigint follower_id FK
        bigint followee_id FK
    }
```

---

## Table Details (詳細定義)

### 1. users

ユーザーの基本情報を管理するテーブル。

| Column            | Type         |  Key   | Nullable | Default | Description              |
| :---------------- | :----------- | :----: | :------: | :------ | :----------------------- |
| **id**            | bigint       | **PK** |    No    |         | 自動採番ID               |
| name              | varchar      |        |    No    |         | ユーザー名（表示名）     |
| email             | varchar      | **UK** |    No    |         | メールアドレス           |
| email_verified_at | timestamp    |        |   Yes    |         | メール確認日時           |
| password          | varchar      |        |    No    |         | パスワード (Hash)        |
| profile_text      | varchar(160) |        |   Yes    |         | プロフィール・自己紹介文 |
| created_at        | timestamp    |        |   Yes    |         | 作成日時                 |
| updated_at        | timestamp    |        |   Yes    |         | 更新日時                 |

### 2. tweets

ユーザーの投稿（ツイート）を管理するテーブル。

| Column        | Type         |  Key   | Nullable | Default | Description                                           |
| :------------ | :----------- | :----: | :------: | :------ | :---------------------------------------------------- |
| **id**        | bigint       | **PK** |    No    |         | 自動採番ID                                            |
| **user_id**   | bigint       | **FK** |    No    |         | `users(id)` への外部キー (Cascade Delete)             |
| **parent_id** | bigint       | **FK** |   Yes    |         | `tweets(id)` への外部キー（返信先ツイートID。NULL可） |
| content       | varchar(140) |        |    No    |         | 投稿本文 (140文字制限)                                |
| created_at    | timestamp    |        |   Yes    |         | 作成日時                                              |
| updated_at    | timestamp    |        |   Yes    |         | 更新日時                                              |

> **構造:** 返信（コメント）機能は、ツイート自体に `parent_id` を持たせる「自己参照」で実現する。これにより、コメントに対しても「いいね」や「さらなる返信」が標準仕様のまま可能となる（Twitter完全互換の仕様）。

### 3. likes

ツイートに対する「いいね（ハート）」履歴を管理する中間テーブル。

| Column       | Type      |     Key      | Nullable | Default | Description                                |
| :----------- | :-------- | :----------: | :------: | :------ | :----------------------------------------- |
| **id**       | bigint    |    **PK**    |    No    |         | 自動採番ID                                 |
| **user_id**  | bigint    | **FK(複合)** |    No    |         | `users(id)` への外部キー (Cascade Delete)  |
| **tweet_id** | bigint    | **FK(複合)** |    No    |         | `tweets(id)` への外部キー (Cascade Delete) |
| created_at   | timestamp |              |   Yes    |         | 作成日時（いいねした日時）                 |
| updated_at   | timestamp |              |   Yes    |         | 更新日時                                   |

> **制約:** `user_id` と `tweet_id` の組み合わせで**ユニーク（一意）制約**を設けることで、1ユーザーが同一ツイートに複数回「いいね」できないようにする。

### 4. follows

ユーザー同士の「フォロー・フォロワー」関係を管理する自己参照中間テーブル。

| Column          | Type      |     Key      | Nullable | Default | Description                                  |
| :-------------- | :-------- | :----------: | :------: | :------ | :------------------------------------------- |
| **id**          | bigint    |    **PK**    |    No    |         | 自動採番ID                                   |
| **follower_id** | bigint    | **FK(複合)** |    No    |         | `users(id)` への外部キー（フォローする側）   |
| **followee_id** | bigint    | **FK(複合)** |    No    |         | `users(id)` への外部キー（フォローされる側） |
| created_at      | timestamp |              |   Yes    |         | 作成日時（フォローした日時）                 |
| updated_at      | timestamp |              |   Yes    |         | 更新日時                                     |

> **制約:** `follower_id` と `followee_id` の組み合わせで**ユニーク（一意）制約**を設けることで、二重フォローを防ぐ。また、自分自身をフォローできないチェック（Check制約またはアプリケーション制御）を行う。
