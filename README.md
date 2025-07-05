# 🐣 Picky – 고민 해결을 위한 투표 플랫폼

**Picky**는 여러 사람의 의견을 통해 선택을 도와주는 고민 투표 웹 앱입니다.  
사용자는 로그인 후 직접 고민을 올리고, 다양한 사람들의 투표를 받아 더 나은 결정을 내릴 수 있습니다.

---

## 🚀 Installation & Start

```bash
# 1. 저장소 클론
git clone https://github.com/neulHa33/picky
cd picky

# 2. 의존성 설치 (npm 사용)
npm install

# 3. Firebase 설정 (.env 파일 or src/firebase/config.ts 참고)
# Firebase 프로젝트 생성 후 필요한 설정을 추가하세요

# 4. 개발 서버 실행
npm run dev
```

> ⚠️ 프로젝트는 Firebase 설정이 완료되어야 정상 작동합니다.  
> 예: `src/firebase/config.ts` 또는 `.env` 파일에 API 키 등 등록 필요

---

## 📄 Project Documentation

### ✅ 사용 기술 스택

| 패키지             | 버전          |
|------------------|---------------|
| React            | 18.x          |
| TypeScript       | ^4.x          |
| Tailwind CSS     | ^3.x          |
| React Router DOM | ^6.x          |
| Firebase         | ^9.x Modular  |
| React Hook Form  | ^7.x          |
| Yup              | ^1.x          |

> 자세한 버전은 `package.json` 참고

---

### 🗂️ 주요 페이지 구조

| 경로              | 설명                                      |
|------------------|-------------------------------------------|
| `/`              | 홈 (소개 및 인기 투표)                   |
| `/votes`         | 전체 투표 목록                            |
| `/vote/:id`      | 투표 상세 페이지 (마감/투표 여부에 따라 제한) |
| `/login`         | 로그인 (이메일/구글 로그인)              |
| `/signup`        | 회원가입 (이름, 지역, 프로필 이미지 포함) |
| `/create-vote`   | 투표 생성 (로그인 필요)                  |
| `/mypage`        | 내 활동 (내가 쓴 투표/참여 투표 목록)    |

---

### ✨ 주요 기능 요약

#### 🔐 인증 & 회원가입
- Firebase Authentication 기반 로그인/회원가입
- 이메일/비밀번호 & 구글 로그인 지원
- 회원가입 시 이름, 이메일, 지역, 프로필 이미지 등록

#### 🗳️ 투표 기능
- 투표 제목, 설명, 옵션(최대 4개), 마감일 설정
- 마감일 기준 서버시간 동기화
- 로그인한 유저만 투표 가능 / 마감 시 투표 비활성화
- 내 투표만 수정/삭제 가능

#### 📊 투표 결과
- 마감되거나 투표 완료 시 결과 차트 제공
- 득표 수, 비율 %, 우승 옵션 하이라이트

#### 💬 댓글 기능
- 투표마다 댓글 등록 가능
- 실시간 Firestore 기반 댓글 반영
- 비로그인 사용자는 읽기만 가능

#### 🛡️ 보안
- Firebase Firestore 규칙을 통해 사용자별 접근 제한
- Yup + React Hook Form으로 폼 검증
- 마감일 조작 방지를 위한 서버 시간 기준 검증

---

## 🔧 Configurations (예시 코드)

```tsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Example = () => {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
  );
};
```

---

## 📌 관련 문서 및 자료

- [📝 프로젝트 노션 문서](https://www.notion.so/zerobaseschool/Picky-App-1f818cd7a3e78082a7e1c2ebe5fe5dcc)
  - 기획 배경 및 타겟
  - 와이어프레임 & 플로우차트
  - 기능 정의서 및 개발 일정
  - 관련 기술 문서 및 회고록 포함

---

## 🙋‍♀️ Author

- 문하늘 (Haneul Mun)
  - [Github](https://github.com/neulHa33)
  - 이메일: tpffpdk@naver.com
