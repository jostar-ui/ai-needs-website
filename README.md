# 모두의 업무위키

공무원 업무 지식 공유 플랫폼 — 전임자의 업무 설명·주의사항·법령·노하우를 카드로 등록하고, 부서·업무명으로 빠르게 찾는 내부 위키입니다.

## 기술 스택

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Storage)

## 로컬 실행

```bash
npm install
npm run dev
```

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 채웁니다:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_PASSWORD=your_admin_password
```

## Render 배포

### 설정값

| 항목 | 값 |
|------|----|
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Node Version | 20 |

### 환경 변수 (Render 대시보드 → Environment)

| 키 | 설명 |
|----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |
| `ADMIN_PASSWORD` | 관리자 페이지 비밀번호 |

### 배포 후 수정

GitHub에 push하면 Render가 자동으로 재빌드·재배포합니다.

```bash
git add .
git commit -m "변경 내용"
git push
```

## 관리자 페이지

`/admin/login` 접속 후 `ADMIN_PASSWORD`로 로그인합니다.
