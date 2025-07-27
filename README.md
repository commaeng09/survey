# 설문지 웹서비스 (Google Forms 스타일)

이 프로젝트는 강사와 훈련생 간 커뮤니케이션을 위한 설문지 생성/배포/분석 웹서비스입니다.

## 주요 기능
- 강사 로그인
- 설문지 생성 및 배포 (Google Forms 스타일 UI)
- 응답/클릭률 등 데이터 분석
- 반응형 디자인 (TailwindCSS)

## 기술 스택
- Vite + React + TypeScript
- TailwindCSS

## 개발 및 실행
```bash
npm install
npm run dev
```

---

# Survey Web Service (Google Forms Style)

A responsive web app for instructors to create, distribute, and analyze surveys for trainees.

## Features
- Instructor login
- Survey creation & distribution (Google Forms-like UI)
- Analytics: response/click rates
- Fully responsive (TailwindCSS)

## Tech Stack
- Vite + React + TypeScript
- TailwindCSS

## Getting Started
```bash
npm install
npm run dev
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
