# 🐣 Picky 앱 – 로그인/회원가입 기능 포함

React와 Firebase를 이용해 만든 **고민 투표 앱**입니다.  
사용자는 로그인하고, 투표를 만들거나 참여하며, 여러 사람의 선택으로 고민을 해결할 수 있어요!

---

## ✨ 주요 기능

### 🔐 로그인 및 회원가입
- 이메일/비밀번호로 로그인
- 이름, 이메일, 지역, 프로필 이미지 포함한 회원가입
- 로그인한 유저만 접근 가능한 보호된 페이지
- 사용자 세션 관리

### 📝 회원가입 시 입력 항목
- 이름 (성 / 이름)
- 이메일 주소
- 비밀번호 / 비밀번호 확인
- 지역 선택
- 프로필 이미지  
  ※ 로컬 미리보기만 지원, Firebase Storage는 사용하지 않음

### 🎲 Picky 기능
- 여러 항목 중에서 하나를 랜덤으로 뽑기
- 항목 추가/삭제 가능
- 깔끔하고 반응형 UI

### 🛡️ 보안 및 유효성 검사
- Yup 스키마 기반 폼 검증
- React Hook Form 사용
- Firebase Authentication
- Firestore를 이용한 사용자 정보 저장

---

## 🛠️ 사용 기술 (Tech Stack)

- **프론트엔드**: React 19, TypeScript, Tailwind CSS  
- **폼 처리**: React Hook Form + Yup  
- **인증**: Firebase Authentication  
- **DB**: Firebase Firestore  
- **라우팅**: React Router DOM

---
