set -e
cd /home/claude/t3
npx esbuild w3d.mjs --bundle --minify --format=iife --legal-comments=none --outfile=w3d.min.js --log-level=warning
python3 -I -c "
import base64
b=base64.b64encode(open('/home/claude/rig/work/wahsh_game.glb','rb').read()).decode()
open('/home/claude/t3/wahsh3d2.js','w').write(open('/home/claude/t3/w3d.min.js').read()+';window.__W3D_GLB=\"'+b+'\";if(window.__w3dLoaded)window.__w3dLoaded();')"
cp wahsh3d2.js /home/claude/ahmed-1343/src/v1/wahsh3d2.js
cd /home/claude/ahmed-1343 && python3 src/build.py > /tmp/build.log 2>&1; tail -1 /tmp/build.log
