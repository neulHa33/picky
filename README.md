🐣 Picky 앱 – 로그인/회원가입 기능 포함
React와 Firebase를 이용해 만든 고민 투표 앱입니다.
사용자는 로그인하고, 투표를 만들거나 참여하며, 여러 사람의 선택으로 고민을 해결할 수 있어요!

✨ 주요 기능
🔐 로그인 및 회원가입
이메일/비밀번호로 로그인

이름, 이메일, 지역, 프로필 이미지 포함한 회원가입

로그인한 유저만 접근 가능한 보호된 페이지

사용자 세션 관리

📝 회원가입 시 입력 항목
이름 (성 / 이름)

이메일 주소

비밀번호 / 비밀번호 확인

지역 선택

프로필 이미지 (※ 로컬 미리보기만, Firebase Storage는 사용 안 함)

🎲 Picky 기능
여러 항목 중에서 하나를 랜덤으로 뽑기

항목 추가/삭제 가능

깔끔하고 반응형 UI

🛡️ 보안 및 유효성 검사
Yup 스키마 기반 폼 검증

react-hook-form 사용

Firebase Authentication

Firestore를 이용한 사용자 정보 저장

🛠️ 사용 기술 (Tech Stack)
프론트엔드: React 19, TypeScript, Tailwind CSS

폼 처리: React Hook Form + Yup

인증: Firebase Authentication

DB: Firebase Firestore

라우팅: React Router DOM

📦 설치 방법
1. 필요한 패키지 설치
bash
복사
편집
npm install
2. Firebase 프로젝트 설정
Firebase 콘솔에서 새 프로젝트 생성

이메일/비밀번호 로그인 기능 활성화

Firestore 데이터베이스 생성 (테스트 모드 OK)

Firebase Storage는 사용하지 않음

Firebase 설정 정보 복사

3. Firebase 설정 코드 수정 (src/firebase/config.ts)
ts
복사
편집
const firebaseConfig = {
  apiKey: "복사한 값",
  authDomain: "복사한 값",
  ...
};
4. Firestore 보안 규칙 설정
js
복사
편집
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
📁 폴더 구조 예시
bash
복사
편집
src/
├── components/
│   ├── Login.tsx          # 로그인 폼
│   ├── Signup.tsx         # 회원가입 폼
│   ├── Dashboard.tsx      # 메인 페이지
│   ├── ProtectedRoute.tsx # 로그인 여부 확인 라우트
│   └── Picky.tsx          # 랜덤 뽑기 기능 컴포넌트
├── contexts/
│   └── AuthContext.tsx    # 사용자 인증 정보 context
├── firebase/
│   └── config.ts          # Firebase 설정
└── App.tsx                # 전체 라우팅
🚀 실행 방법
.env 파일에 Firebase 설정 추가:

env
복사
편집
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
앱 실행:

bash
복사
편집
npm run dev
🔍 사용법 요약
/signup → 회원가입

/login → 로그인

/dashboard → 뽑기 기능 페이지

우측 상단 로그아웃 클릭 시 세션 종료

⚙️ 명령어 정리
npm run dev – 개발 서버 실행

npm run build – 빌드

npm run preview – 빌드 결과 미리보기

npm run lint – 코드 검사

📬 오픈소스 참여 방법 (선택)
이 레포지토리를 fork 하기

브랜치 생성 후 기능 개발

Pull Request 생성하기

📝 라이선스
MIT 라이선스를 따릅니다. 자유롭게 사용하세요!

