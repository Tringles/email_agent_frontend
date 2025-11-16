# Email Agent Frontend

Email AI Aggregator의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Query** (데이터 fetching)
- **Zustand** (상태 관리)
- **Axios** (API 통신)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
email_agent_frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (dashboard)/       # 대시보드 페이지
│   ├── api/               # API 라우트
│   └── layout.tsx          # 루트 레이아웃
├── components/             # 재사용 가능한 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   ├── email/             # 이메일 관련 컴포넌트
│   └── layout/            # 레이아웃 컴포넌트
├── lib/                    # 유틸리티 및 설정
│   ├── api/               # API 클라이언트
│   └── store/             # 상태 관리
├── types/                  # TypeScript 타입 정의
└── styles/                # 전역 스타일
```

## 주요 기능

- ✅ Google SSO 로그인
- ✅ 이메일 목록 조회
- ✅ 이메일 상세 보기
- ✅ Gmail 계정 연결
- ✅ AI 처리 상태 모니터링
- ✅ 설정 및 규칙 관리
- ✅ 검색 기능

## API 연동

백엔드 API는 `NEXT_PUBLIC_API_URL` 환경 변수로 설정된 주소를 사용합니다.
기본값은 `http://localhost:8000`입니다.

