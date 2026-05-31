# Auto PPT Generator - Context

## 프로젝트 개요
웹 폼에서 슬라이드 내용을 입력하면 PPTX 파일을 자동 생성하는 플랫폼.
현재 AI 없이 구조화된 입력 → PPTX 생성 MVP 구현 완료.

## 기술 스택
- **Frontend**: Next.js (TypeScript) + Tailwind CSS → `frontend/`
- **Backend**: FastAPI (Python) + python-pptx → `backend/`
- **Backend venv**: `backend/venv/`

## 실행 방법
```bash
# Backend (포트 8000)
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Frontend (포트 3000 또는 3001)
cd frontend && npm run dev
```

## 주요 파일
- `backend/app/main.py` - FastAPI 앱, POST /api/generate 엔드포인트
- `backend/app/generator.py` - python-pptx로 PPTX 생성 로직
- `backend/app/templates.py` - 테마 정의 (business, simple, dark)
- `backend/app/models.py` - Pydantic 데이터 모델
- `frontend/src/app/page.tsx` - 메인 페이지 (입력 폼)
- `frontend/src/components/SlideCard.tsx` - 슬라이드 카드 컴포넌트
- `frontend/src/components/BulletList.tsx` - 불릿 리스트 편집
- `frontend/src/components/ThemeSelector.tsx` - 테마 선택기
- `frontend/src/types.ts` - 타입 정의

## 현재 상태
- [x] Backend API 구현 (POST /api/generate)
- [x] Frontend UI 구현 (입력 폼 + 다운로드)
- [x] 7종 레이아웃: title, toc, content, image-text, grid, two-column, closing
- [x] 3종 테마: business(네이비), simple(딥네이비), dark(블랙+시안)
- [x] 이미지 업로드 (localStorage + base64 → PPT 삽입)
- [x] 참고 PPT 포맷 반영 (10x5.625in, 다크 표지, 컬러 제목바)
- [x] API 테스트 통과 (PPTX 파일 정상 생성)
- [x] Vercel 배포 (frontend, Root Directory: frontend)
- [x] GitHub push 완료

## 의사결정 이력
- 참고 PPT(퐆.pptx)의 슬라이드 크기(10x5.625in), 색상(#001D2C 표지), 레이아웃 패턴을 기반으로 재구성
- 이미지는 localStorage에 base64로 저장, API 호출 시 base64로 전송

## 마지막 업데이트
2026-05-31 18:18
