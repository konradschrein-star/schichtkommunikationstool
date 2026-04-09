@echo off
echo ========================================
echo ShiftSync MVP Deployment
echo ========================================
echo.

echo [1/3] Creating deployment archive...
tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=data/media --exclude=data/reports -czf shiftsync-deploy.tar.gz .
echo Archive created: shiftsync-deploy.tar.gz
echo.

echo [2/3] Uploading to server...
echo Run this command in a separate terminal:
echo scp -i ~/.ssh/id_hetzner shiftsync-deploy.tar.gz root@65.108.6.149:/tmp/
echo.
echo Press any key when upload is complete...
pause

echo [3/3] Deploy on server...
echo Now SSH into the server and run:
echo.
echo ssh -i ~/.ssh/id_hetzner root@65.108.6.149
echo.
echo Then on the server:
echo cd /opt/schichtkommunikationstool
echo tar -xzf /tmp/shiftsync-deploy.tar.gz
echo ./deploy.sh
echo npm run seed-demo
echo.
echo ========================================
echo Deployment Instructions Ready!
echo ========================================
pause
