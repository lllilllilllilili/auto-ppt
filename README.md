# PPT 자동 생성기

웹 폼에서 슬라이드 내용을 입력하면 PPTX 파일을 자동 생성해주는 플랫폼.

## 실행 방법

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속.

## 기능

- 4종 슬라이드 레이아웃: 표지, 콘텐츠, 2단 비교, 마무리
- 3종 테마: 비즈니스, 심플, 다크
- 슬라이드 순서 변경, 추가/삭제
- PPTX 파일 다운로드
# auto-ppt
