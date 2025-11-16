# 프론트엔드 ID 암호화 마이그레이션 가이드

백엔드에서 ID 암호화를 적용한 후, 프론트엔드에서 필요한 변경 사항입니다.

**✅ 완료된 변경 사항:**
- 타입 정의 업데이트 (ID를 string으로 변경)
- API 클라이언트 업데이트 (모든 id 파라미터를 string으로)
- 페이지 컴포넌트 업데이트 (parseInt 제거)
- EmailCard 컴포넌트 업데이트 (provider_type 사용)

## 주요 변경 사항

### 1. 타입 정의 변경 (`types/index.ts`)

ID 필드를 `number`에서 `string`으로 변경:

```typescript
// 변경 전
export interface Email {
  id: number;
  email_account_id: number;
  // ...
}

export interface EmailAccount {
  id: number;
  user_id: number;
  // ...
}

// 변경 후
export interface Email {
  id: string;  // 암호화된 ID
  email_account_id: string;  // 암호화된 ID
  // ...
}

export interface EmailAccount {
  id: string;  // 암호화된 ID
  user_id: number;  // user_id는 그대로 (필요시 변경)
  // ...
}
```

### 2. API 클라이언트 변경 (`lib/api/email.ts`)

모든 ID 파라미터를 `string`으로 변경:

```typescript
// 변경 전
getEmailById: async (id: number): Promise<Email> => {
  const response = await apiClient.instance.get(`/email/${id}`);
  return response.data;
},

// 변경 후
getEmailById: async (id: string): Promise<Email> => {
  const response = await apiClient.instance.get(`/email/${id}`);
  return response.data;
},
```

모든 메서드의 `id` 파라미터를 `string`으로 변경:
- `getEmailById(id: string)`
- `getEmailSummary(id: string)`
- `markAsRead(id: string, ...)`
- `markAsImportant(id: string, ...)`
- `deleteEmail(id: string)`
- `archiveEmail(id: string, ...)`
- `syncEmails(accountId?: string)` - account_id도 string으로

### 3. 페이지 컴포넌트 변경

#### `app/(dashboard)/email/[id]/page.tsx`

```typescript
// 변경 전
const { id } = params;
const emailId = parseInt(id);  // ❌ 제거

const { data: email, isLoading } = useQuery({
  queryKey: ['email', emailId],
  queryFn: () => emailApi.getEmailById(emailId),
  enabled: !!emailId,
});

// 변경 후
const { id } = params;  // 이미 string, 그대로 사용

const { data: email, isLoading } = useQuery({
  queryKey: ['email', id],
  queryFn: () => emailApi.getEmailById(id),  // string 그대로 전달
  enabled: !!id,
});
```

#### `components/email/EmailCard.tsx`

```typescript
// 변경 전: 이미 string으로 사용 가능하므로 변경 불필요
<Link href={`/email/${email.id}`}>  // ✅ 그대로 사용

// 단, account_id 비교 로직이 있다면:
// 변경 전
{email.email_account_id === 1 ? 'Gmail' : 'Naver'}  // ❌

// 변경 후: account_id도 string이므로 비교 방식 변경 필요
// 또는 account.provider_type 사용
```

### 4. 계정 관련 API (`lib/api/emailAccount.ts`)

```typescript
// 변경 전
disconnectAccount: async (id: number): Promise<void> => {
  // ...
}

// 변경 후
disconnectAccount: async (id: string): Promise<void> => {
  // ...
}
```

### 5. Agent API (`lib/api/agent.ts`)

```typescript
// 변경 전
runAgent: async (emailId?: number): Promise<any> => {
  const params = emailId ? { email_id: emailId } : {};
  // ...
}

// 변경 후
runAgent: async (emailId?: string): Promise<any> => {
  const params = emailId ? { email_id: emailId } : {};
  // ...
}
```

### 6. 계정 ID 비교 로직 수정

`EmailCard.tsx`에서 `email_account_id` 비교:

```typescript
// 변경 전
{email.email_account_id === 1 ? 'Gmail' : 'Naver'}

// 변경 후: account 정보를 props로 전달하거나
// account_id 대신 provider_type 사용
{email.provider_type === 'gmail' ? 'Gmail' : 'Naver'}
```

또는 Email 타입에 `provider_type` 필드 추가 필요.

## 변경 체크리스트

- [ ] `types/index.ts`: Email.id, Email.email_account_id, EmailAccount.id를 string으로 변경
- [ ] `lib/api/email.ts`: 모든 id 파라미터를 string으로 변경
- [ ] `lib/api/emailAccount.ts`: id 파라미터를 string으로 변경
- [ ] `lib/api/agent.ts`: emailId 파라미터를 string으로 변경
- [ ] `app/(dashboard)/email/[id]/page.tsx`: parseInt 제거
- [ ] `components/email/EmailCard.tsx`: account_id 비교 로직 수정
- [ ] `app/(dashboard)/settings/accounts/page.tsx`: account.id 사용 부분 확인
- [ ] `app/(dashboard)/ai/processing/page.tsx`: email.id 사용 부분 확인

## 주의사항

1. **백엔드와 동기화**: 백엔드가 암호화된 ID를 반환하는지 확인
2. **기존 데이터**: 기존에 저장된 number ID가 있다면 마이그레이션 필요
3. **URL 파라미터**: Next.js 동적 라우트에서 string ID는 그대로 사용 가능
4. **비교 연산**: ID 비교는 `===`로 문자열 비교 (암호화된 ID는 고유하므로 안전)

## 테스트

1. 이메일 목록 조회 → 암호화된 ID 확인
2. 이메일 상세 조회 → URL에 암호화된 ID 사용
3. 이메일 액션 (읽음, 중요, 삭제) → 암호화된 ID로 API 호출
4. 계정 관리 → 암호화된 account_id 사용

