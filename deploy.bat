@echo off
echo ========================================
echo RoutineFlow 자동 배포 준비 도우미
echo ========================================

:: Git 초기화
git init
if %errorlevel% neq 0 (
    echo [오류] Git이 설치되지 않았거나 경로를 찾을 수 없습니다.
    echo Git을 설치하셨다면 터미널을 다시 열어주세요.
    pause
    exit /b
)

:: 파일 추가 및 커밋
git add .
git commit -m "RoutineFlow Initial Commit"

echo.
echo ----------------------------------------
echo 1. 이제 브라우저에서 GitHub 로그인 후 'New Repository'를 만드세요.
echo 2. Repository 이름은 'RoutineFlow'로 해주세요.
echo 3. 아래 명령어를 복사해서 붙여넣으면 진짜로 업로드됩니다!
echo.
echo git remote add origin https://github.com/%USERNAME%/RoutineFlow.git
echo git branch -M main
echo git push -u origin main
echo ----------------------------------------
echo.
echo 잠시 후 GitHub 사이트를 열어드릴게요...
timeout /t 5
start https://github.com/new

pause
