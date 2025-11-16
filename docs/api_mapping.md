# API 엔드포인트 매핑 문서

프론트엔드 API 클라이언트와 백엔드 FastAPI 엔드포인트 매핑 문서입니다.

## ✅ 구현 완료된 엔드포인트

### Auth API

| 프론트엔드 | 백엔드 | 메서드 | 설명 |
|-----------|--------|--------|------|
| `authApi.getGoogleLoginUrl()` | `/api/v1/auth/google/login` | GET | Google OAuth 로그인 시작 (RedirectResponse) |
| `authApi.handleGoogleCallback(code)` | `/api/v1/auth/google/callback?code=xxx` | GET | Google OAuth 콜백 처리 |
| `emailAccountApi.getGmailConnectUrl(userId)` | `/api/v1/auth/email-accounts/gmail/connect?user_id=xxx` | GET | Gmail 계정 연결 시작 (RedirectResponse) |
| `emailAccountApi.handleGmailCallback(code, state)` | `/api/v1/auth/email-accounts/gmail/callback?code=xxx&state=user_id` | GET | Gmail 계정 연결 콜백 |

### Email API

| 프론트엔드 | 백엔드 | 메서드 | 설명 |
|-----------|--------|--------|------|
| `emailApi.getEmailById(id)` | `/api/v1/email/{email_id}` | GET | 이메일 상세 조회 (TODO: 실제 데이터 반환 필요) |
| `emailApi.getEmailSummary(id)` | `/api/v1/email/{email_id}/summary` | GET | 이메일 요약 조회 (TODO: 실제 요약 반환 필요) |

### Agent API

| 프론트엔드 | 백엔드 | 메서드 | 설명 |
|-----------|--------|--------|------|
| `agentApi.runAgent(emailId?)` | `/api/v1/agent/run?email_id=xxx` | POST | AI Agent 실행 |

## 🚧 구현 필요한 엔드포인트

### Auth API

- `GET /api/v1/auth/me` - 현재 사용자 정보 조회

### Email API

- `GET /api/v1/email` - 이메일 목록 조회 (페이지네이션, 필터링)
  - Query Parameters:
    - `page`: 페이지 번호
    - `page_size`: 페이지 크기
    - `status`: 이메일 상태 (pending, processing, processed, failed)
    - `is_read`: 읽음 여부
    - `is_important`: 중요 여부
    - `search`: 검색어
  - Response: `PaginatedResponse<Email>`

- `PATCH /api/v1/email/{id}/read` - 이메일 읽음 처리
- `PATCH /api/v1/email/{id}/important` - 이메일 중요 표시
- `DELETE /api/v1/email/{id}` - 이메일 삭제
- `PATCH /api/v1/email/{id}/archive` - 이메일 아카이브

### Email Account API

- `GET /api/v1/email-accounts` - 연결된 계정 목록 조회
- `DELETE /api/v1/email-accounts/{id}` - 계정 연결 해제
- `PATCH /api/v1/email-accounts/{id}` - 계정 설정 업데이트
  - Body: `{ fetch_interval?: number, is_active?: boolean }`

### Agent API

- `GET /api/v1/agent/stats` - AI 처리 통계
  - Response: `{ processed: number, processing: number, pending: number }`
- `GET /api/v1/agent/processing` - 처리 중인 이메일 목록
- `GET /api/v1/agent/pending` - 대기 중인 이메일 목록

## 📝 참고사항

1. **RedirectResponse 처리**: 
   - `/auth/google/login`과 `/auth/email-accounts/gmail/connect`는 `RedirectResponse`를 반환하므로 프론트엔드에서 직접 `window.location.href`로 리다이렉트합니다.

2. **에러 처리**:
   - 구현되지 않은 엔드포인트는 프론트엔드에서 에러를 catch하고 빈 데이터를 반환하도록 처리했습니다.

3. **인증 토큰**:
   - JWT 토큰은 `Authorization: Bearer {token}` 헤더로 전송됩니다.
   - 토큰은 `localStorage`에 저장됩니다.

4. **백엔드 응답 형식**:
   - Google 콜백: `{ access_token, token_type, user, message }`
   - Gmail 콜백: `{ email_account_id, email, message }`

