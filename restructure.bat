@echo off
echo Starting restructuring...
mkdir backend
move "l:\Forest1\api.py" "l:\Forest1\backend\api.py"
move "l:\Forest1\requirements.txt" "l:\Forest1\backend\requirements.txt"
move "l:\Forest1\users.db" "l:\Forest1\backend\users.db"
move "l:\Forest1\evaluate.py" "l:\Forest1\backend\evaluate.py"
xcopy "l:\Forest1\src" "l:\Forest1\backend\src" /E /I /Y
xcopy "l:\Forest1\models" "l:\Forest1\backend\models" /E /I /Y
xcopy "l:\Forest1\data" "l:\Forest1\backend\data" /E /I /Y
rd /S /Q "l:\Forest1\src"
rd /S /Q "l:\Forest1\models"
rd /S /Q "l:\Forest1\data"
del "l:\Forest1\3d_animation.html"
del "l:\Forest1\backend_log.txt"
del "l:\Forest1\index.html"
del "l:\Forest1\streamlit_app_backup.py"
del "l:\Forest1\test_*.py"
del "l:\Forest1\restructure_script.py"
echo Restructuring finished.
