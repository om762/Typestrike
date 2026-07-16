@echo off
setlocal

:: Parse optional output name argument (default: typestrike)
if "%~1"=="" (
    set "OUTPUT_NAME=typestrike"
) else (
    set "OUTPUT_NAME=%~1"
)

echo.
echo  ╺┳╸╻ ╻┏━┓┏━╸┏━┓╺┳╸┏━┓╻╻┏ ┏━╸
echo   ┃ ┗┳┛┣━┛┣╸ ┗━┓ ┃ ┣┳┛┃┣┻┓┣╸
echo   ╹  ╹ ╹  ┗━╸┗━┛ ╹ ╹┗╸╹╹ ╹┗━╸
echo.
echo  Building standalone executable...
echo.

:: Step 1: Bundle all source into a single file
echo  [1/4] Bundling with esbuild...
call npx.cmd -y esbuild sea-entry.js --bundle --platform=node --format=cjs --outfile=dist/typestrike-bundle.cjs --minify
if %ERRORLEVEL% neq 0 (
    echo  ERROR: esbuild bundling failed
    exit /b 1
)
echo  Done! (dist\typestrike-bundle.cjs)
echo.

:: Step 2: Generate SEA blob
echo  [2/4] Generating SEA blob...
node --experimental-sea-config sea-config.json
if %ERRORLEVEL% neq 0 (
    echo  ERROR: SEA blob generation failed
    exit /b 1
)
echo  Done! (dist\typestrike.blob)
echo.

:: Step 3: Copy node.exe
echo  [3/4] Copying Node.js binary...
copy /Y "%~dp0node.exe" "dist\%OUTPUT_NAME%.exe" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    :: Try using the node in PATH
    for /f "tokens=*" %%i in ('where node') do (
        copy /Y "%%i" "dist\%OUTPUT_NAME%.exe" >nul
        goto :inject
    )
    echo  ERROR: Could not find node.exe
    exit /b 1
)
:inject
echo  Done!
echo.

:: Step 4: Inject SEA blob
echo  [4/4] Injecting blob into executable...
call npx.cmd -y postject dist/%OUTPUT_NAME%.exe NODE_SEA_BLOB dist/typestrike.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
if %ERRORLEVEL% neq 0 (
    echo  ERROR: Blob injection failed
    exit /b 1
)
echo.
echo  ========================================
echo   Build complete!
echo   Executable: dist\%OUTPUT_NAME%.exe
echo  ========================================
echo.
echo  You can now run: dist\%OUTPUT_NAME%.exe
echo.
endlocal
