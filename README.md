# FitSquad 🏋️

健身打卡与社交 Web 应用 — 组团训练、记录突破、冲击排行榜。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | NextAuth.js v5 (邮箱+密码) |
| 实时 | Supabase Realtime |
| 图表 | Recharts |
| 校验 | Zod |

## 功能

- **用户系统** — 邮箱注册/登录，密码规范校验（大小写+数字，≥8位）
- **组团** — 创建健身团队，队长通过 ID 邀请队员，接受/拒绝邀请
- **训练计划** — 预设模板（PPL/上下肢/全身），自定义计划构建器
- **实时训练追踪** — 圆形进度条 SetCounter，手动确认每组，休息计时器
- **个人纪录 & 排行榜** — 按动作记录最大重量(KG)/次数，队内排名
- **成就徽章** — 连续打卡、训练容量等级
- **动态流** — 团队训练动态实时推送
- **通知** — 邀请、纪录突破等系统通知
- **数据可视化** — 训练趋势图、周活跃度
- **响应式设计** — 移动端底部导航，桌面端顶部导航

## 快速开始

### 1. 克隆并安装依赖

```bash
git clone <repo-url>
cd fitsquad
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写：

```bash
cp .env.example .env
```

必填项：

| 变量 | 说明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | 随机密钥（`openssl rand -base64 32`） |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 |

### 3. 初始化数据库

```bash
npx prisma db push
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`

## 数据库模型

12 个 Prisma 模型：

- **User** — 用户（邮箱、密码哈希、姓名、体重 KG）
- **Team** — 团队（名称、队长）
- **TeamMember** — 团队成员（角色、邀请状态）
- **Exercise** — 动作库（名称、类别、肌群）
- **Plan** — 训练计划（名称、模板标记）
- **PlanDay** — 计划训练日
- **PlanExercise** — 计划中的动作（组数、次数、重量 KG、休息时间）
- **WorkoutSession** — 训练会话（状态：活跃/完成/取消）
- **WorkoutSet** — 训练组（完成标记、实际次数、重量 KG）
- **PersonalRecord** — 个人纪录（最大重量 KG、最大次数）
- **Notification** — 通知（类型、已读标记）
- **UserAchievement** — 用户成就

## 项目结构

```
fitsquad/
├── prisma/
│   ├── schema.prisma          # 数据库模型
│   └── seed.ts                # 种子数据（37 个预设动作 + 3 个模板计划）
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   ├── globals.css        # 全局样式
│   │   ├── (auth)/            # 登录/注册页
│   │   ├── dashboard/         # 仪表盘
│   │   ├── teams/             # 团队列表/详情/创建
│   │   ├── plans/             # 计划列表/详情/创建
│   │   ├── train/             # 训练开始/进行中
│   │   ├── records/           # 个人纪录
│   │   └── api/               # API 路由
│   ├── components/
│   │   ├── layout/            # Navbar 等
│   │   ├── teams/             # TeamCard, TeamInviteModal, TeamMemberList
│   │   ├── plans/             # PlanCard, PlanBuilder
│   │   ├── training/          # SetCounter
│   │   ├── records/           # LeaderboardTable, RecordCard
│   │   ├── feed/              # ActivityFeed
│   │   ├── achievements/      # BadgeGrid
│   │   └── charts/            # TrainingTrendChart, WeeklyActivityChart
│   ├── lib/                   # prisma, auth, supabase, validations, utils
│   ├── hooks/                 # useRealtime, useTrainingSession, useOptimistic
│   ├── providers/             # SessionProvider
│   └── types/                 # TypeScript 类型
```

## API 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/[...nextauth]` | NextAuth 处理 |
| GET/POST | `/api/teams` | 团队列表/创建 |
| GET/PUT/DELETE | `/api/teams/[id]` | 团队详情/更新/删除 |
| POST | `/api/teams/[id]/invite` | 邀请成员 |
| POST | `/api/teams/join` | 接受/拒绝邀请 |
| GET | `/api/teams/[id]/leaderboard` | 队内排行榜 |
| GET/POST | `/api/plans` | 计划列表/创建 |
| GET/DELETE | `/api/plans/[id]` | 计划详情/删除 |
| GET | `/api/exercises` | 动作库 |
| POST | `/api/sessions/start` | 开始训练 |
| POST | `/api/sessions/[id]/complete-set` | 完成一组 |
| GET/POST | `/api/records` | 个人纪录 |
| GET | `/api/feed` | 动态流 |
| GET/PUT | `/api/notifications` | 通知列表/标记已读 |

## 重量单位

本应用所有重量统一使用 **KG（千克）**，不使用其他单位。

## 密码规则

- 最少 8 个字符
- 必须包含至少一个大写字母
- 必须包含至少一个小写字母
- 必须包含至少一个数字

## License

MIT
