@echo off
chcp 65001 >nul 2>&1
echo ========================================
echo KaNote 快速安装脚本
echo ========================================
echo.

:: 直接使用指定的POI目录
set "POI_DIR=%APPDATA%\poi\plugins\node_modules"

echo 目标POI目录: %POI_DIR%
echo.

:: 检查POI目录
if not exist "%POI_DIR%" (
    echo 错误: POI目录不存在
    echo 请确认路径: %POI_DIR%
    pause
    exit /b 1
)

:: 检查是否已构建
@REM if not exist "dist\bundle.js" (
@REM     echo 检测到未构建，开始构建...
@REM     echo.
    
@REM     :: 检查Node.js
@REM     node -v >nul 2>&1
@REM     if %errorlevel% neq 0 (
@REM         echo 错误: 未安装Node.js，请先安装
@REM         pause
@REM         exit /b 1
@REM     )
    
@REM     :: 安装依赖并构建
@REM     echo 安装依赖...
@REM     call npm install >nul 2>&1
    
@REM     echo 构建插件...
@REM     call npm run build >nul 2>&1
    
@REM     if not exist "dist\bundle.js" (
@REM         echo 错误: 构建失败
@REM         pause
@REM         exit /b 1
@REM     )
    
@REM     echo 构建完成!
@REM     echo.
@REM )
echo 开始构建...
call npm run build
set BUILD_EXIT=%ERRORLEVEL%
if %BUILD_EXIT% neq 0 (
    echo.
    echo 错误: 构建失败，退出码 %BUILD_EXIT%
    echo 请直接运行 "npm run build" 查看完整输出并修复问题。
    pause
    exit /b %BUILD_EXIT%
)

:: 创建目标目录
set "TARGET_DIR=%POI_DIR%\poi-plugin-kanote"

echo 安装插件到: %TARGET_DIR%

if exist "%TARGET_DIR%" (
    echo 发现现有安装，正在更新...
    rd /s /q "%TARGET_DIR%" >nul 2>&1
)

mkdir "%TARGET_DIR%" >nul 2>&1

:: 复制文件
echo 复制插件文件...
copy "package.json" "%TARGET_DIR%\" >nul
copy "index.js" "%TARGET_DIR%\" >nul
if exist "README.md" copy "README.md" "%TARGET_DIR%\" >nul

:: 复制目录
if exist "dist" (
    xcopy /s /e /y "dist" "%TARGET_DIR%\dist\" >nul
    echo - 复制构建文件
)

if exist "assets" (
    xcopy /s /e /y "assets" "%TARGET_DIR%\assets\" >nul
    echo - 复制资源文件
)

echo.
echo ========================================
echo 安装成功！
echo ========================================
echo.
echo 下一步：
echo   1. 重启POI
echo   2. 设置 - 插件 - 启用KaNote
echo   3. 在主界面点击舰C笔记本标签
echo.
echo 安装位置: %TARGET_DIR%
echo.