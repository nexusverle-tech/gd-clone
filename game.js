// Geometry Dash - Clone (textures + tuning)
(function(){
  // Audio elements
  const music = document.getElementById('music');
  const sfxJump = document.getElementById('sfx-jump');
  const sfxDie = document.getElementById('sfx-die');
  const sfxPortal = document.getElementById('sfx-portal');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // HUD and UI
  const scoreEl = document.getElementById('score');
  const statusEl = document.getElementById('status');
  const levelSelect = document.getElementById('levelSelect');
  const playBtn = document.getElementById('playBtn');
  const iconBtn = document.getElementById('iconBtn');
  const iconModal = document.getElementById('iconModal');
  const iconSave = document.getElementById('iconSave');
  const iconClose = document.getElementById('iconClose');
  const iconShape = document.getElementById('iconShape');
  const iconColor = document.getElementById('iconColor');
  const iconGlow = document.getElementById('iconGlow');
  const editorBtn = document.getElementById('editorBtn');

  const gravityRange = document.getElementById('gravityRange');
  const speedRange = document.getElementById('speedRange');
  const jumpRange = document.getElementById('jumpRange');
  const holdRange = document.getElementById('holdRange');
  const fpsEl = document.getElementById('fps');
  const particleCountRange = document.getElementById('particleCountRange');
  const particleSizeRange = document.getElementById('particleSizeRange');
  const particleGravityRange = document.getElementById('particleGravityRange');
  const particleSpriteToggle = document.getElementById('particleSpriteToggle');
  const particlePresetSave = document.getElementById('particlePresetSave');
  const particlePresetLoad = document.getElementById('particlePresetLoad');
  const particlePresetList = document.getElementById('particlePresetList');
  // --- Particle Preset Save/Load ---
  function getParticlePresets() {
    return JSON.parse(localStorage.getItem('gd_particle_presets')||'[]');
  }
  function setParticlePresets(presets) {
    localStorage.setItem('gd_particle_presets', JSON.stringify(presets));
  }
  function updateParticlePresetList() {
    const presets = getParticlePresets();
    particlePresetList.innerHTML = '';
    presets.forEach((p,i)=>{
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = p.name || ('Preset '+(i+1));
      particlePresetList.appendChild(opt);
    });
  }
  particlePresetSave.addEventListener('click',()=>{
    const name = prompt('Preset name?','My Preset');
    if(!name) return;
    const presets = getParticlePresets();
    presets.push({
      name,
      settings: {...particleSettings}
    });
    setParticlePresets(presets);
    updateParticlePresetList();
    alert('Preset saved!');
  });
  particlePresetLoad.addEventListener('click',()=>{
    const idx = parseInt(particlePresetList.value,10);
    const presets = getParticlePresets();
    if(presets[idx]){
      Object.assign(particleSettings, presets[idx].settings);
      updateParticleUI();
      alert('Preset loaded!');
    }
  });
  updateParticlePresetList();

  const editorModal = document.getElementById('editorModal');
  const editorCanvas = document.getElementById('editorCanvas');
  const editorCtx = editorCanvas.getContext('2d');
  const editorTool = document.getElementById('editorTool');
  const editorGrid = document.getElementById('editorGrid');
  const editorPlay = document.getElementById('editorPlay');
  const editorExport = document.getElementById('editorExport');
  const editorImport = document.getElementById('editorImport');
  const editorClose = document.getElementById('editorClose');

  // Physics tuned to feel like Geometry Dash (adjustable)
  const GAME = {
    gravity: 2400,      // px/s^2 (tuned slightly higher)
    speed: 380,         // px/s (level scroll)
    jumpVel: 740,       // initial jump velocity
    maxHold: 0.12,      // seconds of extended upward thrust when holding
    playerX: 150,
    groundY: H - 40
  };

  // Player and icon customization
  let icon = JSON.parse(localStorage.getItem('gd_icon')||'null') || {shape:'square',color:'#ffcc00',glow:true};
  function saveIcon(){ localStorage.setItem('gd_icon', JSON.stringify(icon)); }
  iconShape.value = icon.shape; iconColor.value = icon.color; iconGlow.checked = !!icon.glow;

  // texture assets
  const assets = {bg:null,tiles:null};
  assets.particle = null;
  let tilePattern = null;
  function loadAssets(cb){
    let loaded=0; const total=2;
    const a1=new Image(); a1.src='assets/bg.svg'; a1.onload=()=>{ assets.bg=a1; loaded++; if(loaded===total) cb(); };
    const a2=new Image(); a2.src='assets/tile.svg'; a2.onload=()=>{ assets.tiles=a2; loaded++; if(loaded===total) cb(); };
    // particle asset (non-blocking)
    const p = new Image(); p.src='assets/particle.svg'; p.onload=()=>{ assets.particle = p; };
  }

  // Levels
  const levels = [];
  function addSampleLevels(){

    // Stereo Madness (sample)
    levels.push({id:'stereo',name:'Stereo Madness (sample)',length:3000,objs:[
      {type:'block',x:400,y:GAME.groundY-40,w:120,h:40},
      {type:'block',x:700,y:GAME.groundY-80,w:40,h:80},
      {type:'spike',x:1100,y:GAME.groundY,dir:'up'},
      {type:'block',x:1300,y:GAME.groundY-40,w:220,h:40},
      {type:'spike',x:1800,y:GAME.groundY,dir:'up'},
      {type:'portal',x:2100,y:GAME.groundY-60,w:30,h:60,mode:'reverse'},
      {type:'platform',x:2300,y:GAME.groundY-100,w:100,h:20,range:60,speed:80,dir:'vertical'}
    ]});

    // Back On Track (sample)
    levels.push({id:'backontrack',name:'Back On Track (sample)',length:2200,objs:[
      {type:'block',x:300,y:GAME.groundY-40,w:80,h:40},
      {type:'spike',x:600,y:GAME.groundY,dir:'up'},
      {type:'block',x:800,y:GAME.groundY-120,w:160,h:120},
      {type:'spike',x:1500,y:GAME.groundY,dir:'up'},
      {type:'portal',x:1700,y:GAME.groundY-60,w:30,h:60,mode:'lowgrav'},
      {type:'platform',x:1800,y:GAME.groundY-80,w:120,h:20,range:100,speed:60,dir:'horizontal'}
    ]});

    // Extra Level: Platform Mayhem
    levels.push({id:'platform1',name:'Platform Mayhem',length:3200,objs:[
      {type:'block',x:200,y:GAME.groundY-40,w:100,h:40},
      {type:'platform',x:400,y:GAME.groundY-100,w:120,h:20,range:80,speed:90,dir:'vertical'},
      {type:'spike',x:600,y:GAME.groundY,dir:'up'},
      {type:'platform',x:800,y:GAME.groundY-60,w:100,h:20,range:120,speed:70,dir:'horizontal'},
      {type:'spike',x:1100,y:GAME.groundY,dir:'up'},
      {type:'block',x:1300,y:GAME.groundY-80,w:80,h:80},
      {type:'platform',x:1500,y:GAME.groundY-120,w:120,h:20,range:60,speed:100,dir:'vertical'},
      {type:'portal',x:1700,y:GAME.groundY-60,w:30,h:60,mode:'reverse'},
      {type:'spike',x:2000,y:GAME.groundY,dir:'up'},
      {type:'block',x:2200,y:GAME.groundY-40,w:200,h:40}
    ]});

    // Extra Level: Portal Playground
    levels.push({id:'portal1',name:'Portal Playground',length:2600,objs:[
      {type:'block',x:100,y:GAME.groundY-40,w:120,h:40},
      {type:'portal',x:400,y:GAME.groundY-60,w:30,h:60,mode:'reverse'},
      {type:'spike',x:600,y:GAME.groundY,dir:'up'},
      {type:'portal',x:900,y:GAME.groundY-60,w:30,h:60,mode:'lowgrav'},
      {type:'block',x:1200,y:GAME.groundY-80,w:120,h:80},
      {type:'spike',x:1500,y:GAME.groundY,dir:'up'},
      {type:'portal',x:1700,y:GAME.groundY-60,w:30,h:60,mode:'reverse'},
      {type:'block',x:2000,y:GAME.groundY-40,w:120,h:40}
    ]});

    // Example: user levels can use new types too
    const userLevels = JSON.parse(localStorage.getItem('gd_levels')||'[]');
    for(const l of userLevels) levels.push(l);
  }
  addSampleLevels();

  function populateLevelSelect(){ levelSelect.innerHTML = ''; levels.forEach((l,i)=>{ const opt=document.createElement('option'); opt.value=i; opt.textContent=l.name||('Level '+(i+1)); levelSelect.appendChild(opt); }); }
  populateLevelSelect();

  // Game state
  let running=false, t0=0, cam=0, level=null;
  let player = {x:GAME.playerX,y:GAME.groundY-40,w:32,h:32,vy:0,onGround:true,hold:0,reverse:false,lowgrav:false};

  function startLevel(idx){
    level = JSON.parse(JSON.stringify(levels[idx]));
    cam=0; t0=performance.now(); player.y=GAME.groundY-40; player.vy=0; player.onGround=true; player.hold=0;
    running=true; statusEl.textContent='Playing';
    // Music sync
    if(music){
      music.currentTime = 0;
      music.volume = 0.7;
      music.play().catch(()=>{});
    }
    requestAnimationFrame(loop);
  }

  // Input
  let inputDown=false;
  function press(){
    if(!running) return;
    if(player.onGround){
      player.vy = -GAME.jumpVel;
      player.onGround = false;
      player.hold = 0;
      // spawn small jump particles at feet
      spawnParticles(player.x + player.w/2, player.y + player.h, icon.color, 8, 30);
      if(sfxJump){ try{sfxJump.currentTime=0;sfxJump.play();}catch(e){} }
    }
    inputDown = true;
  }
  function release(){ inputDown=false; }
  window.addEventListener('mousedown',e=>{ if(e.target===canvas) press(); });
  window.addEventListener('mouseup',release);
  window.addEventListener('touchstart',e=>{ press(); e.preventDefault(); },{passive:false});
  window.addEventListener('touchend',e=>{ release(); e.preventDefault(); },{passive:false});
  window.addEventListener('keydown',e=>{ if(e.code==='Space'||e.code==='ArrowUp'){ press(); e.preventDefault(); }});
  window.addEventListener('keyup',e=>{ if(e.code==='Space'||e.code==='ArrowUp'){ release(); e.preventDefault(); }});

  function boxCollides(a,b){ return !(a.x+a.w < b.x || a.x > b.x+b.w || a.y+a.h < b.y || a.y > b.y+b.h); }

  function triSpikeCollide(spike,playerRect){
    const sx = spike.x, sy = spike.y, size=20;
    const px = playerRect.x, py = playerRect.y, pw=playerRect.w, ph=playerRect.h;
    const points = [ [px,py],[px+pw,py],[px,py+ph],[px+pw,py+ph],[px+pw/2,py+ph/2] ];
    for(const p of points){ const x=p[0], y=p[1]; const x1=sx, y1=sy, x2=sx+size, y2=sy, x3=sx+size/2, y3=sy-size; const denom = ((y2 - y3)*(x1 - x3) + (x3 - x2)*(y1 - y3)); const a = ((y2 - y3)*(x - x3) + (x3 - x2)*(y - y3)) / denom; const b = ((y3 - y1)*(x - x3) + (x1 - x3)*(y - y3)) / denom; const c = 1 - a - b; if(a>=0 && b>=0 && c>=0) return true; }
    return false;
  }

  let lastFPS=0, fpsTimer=0;
  function loop(ts){
    const dt = Math.min(0.05,(ts - t0)/1000); t0 = ts;
    // fps
    lastFPS = Math.round(1/dt);
    fpsTimer += dt; if(fpsTimer>0.2){ fpsEl.textContent = lastFPS + ' fps'; fpsTimer=0; }

    if(running){
      cam += (player.reverse ? -1 : 1) * GAME.speed * dt;
      // platform movement
      for(const o of (level?.objs||[])){
        if(o.type==='platform'){
          if(!o._t) o._t = 0;
          o._t += dt * (o.speed||60)/60;
          if(o.dir==='vertical'){
            o.y0 = o.y0 ?? o.y;
            o.y = o.y0 + Math.sin(o._t) * (o.range||60);
          } else {
            o.x0 = o.x0 ?? o.x;
            o.x = o.x0 + Math.sin(o._t) * (o.range||100);
          }
        }
      }
      // player physics
      let grav = player.lowgrav ? GAME.gravity*0.5 : GAME.gravity;
      if(!player.onGround){
        if(inputDown && player.hold < GAME.maxHold){ player.vy += -GAME.jumpVel * 0.02; player.hold += dt; }
        player.vy += grav * dt;
        player.y += player.vy * dt;
        if(player.y + player.h >= GAME.groundY){ player.y = GAME.groundY - player.h; player.vy=0; player.onGround=true; }
      }
      // collision with blocks/platforms
      for(const o of level.objs){
        const sx = o.x - cam;
        if(o.type==='block'||o.type==='platform'){
          const rect = {x:o.x - cam, y:o.y, w:o.w, h:o.h};
          const pRect = {x:player.x, y:player.y, w:player.w, h:player.h};
          if(boxCollides(pRect,rect)){
            if(player.vy >= 0 && (player.y+player.h - rect.y) <= 20){ player.y = rect.y - player.h; player.vy=0; player.onGround=true; }
            else { die(); }
          }
        } else if(o.type==='spike'){
          const spikeScreen = {x:o.x - cam, y:o.y};
          if(triSpikeCollide(spikeScreen, {x:player.x,y:player.y,w:player.w,h:player.h})) die();
        } else if(o.type==='portal'){
          const rect = {x:o.x - cam, y:o.y, w:o.w, h:o.h};
          const pRect = {x:player.x, y:player.y, w:player.w, h:player.h};
          if(boxCollides(pRect,rect)){
            let triggered = false;
            if(o.mode==='reverse' && !player.reverse){
              player.reverse = true;
              setTimeout(()=>{player.reverse=false;}, 2000);
              triggered = true;
            }
            if(o.mode==='lowgrav' && !player.lowgrav){
              player.lowgrav = true;
              setTimeout(()=>{player.lowgrav=false;}, 2000);
              triggered = true;
            }
            if(triggered && sfxPortal){ try{sfxPortal.currentTime=0;sfxPortal.play();}catch(e){} }
          }
        }
      }
      const percent = Math.min(100, Math.floor((Math.abs(cam) / level.length) * 100));
      scoreEl.textContent = percent + '%';
      if(Math.abs(cam) >= level.length){ win(); }
    }

    // update particles with same dt
    updateParticles(dt);

    render();
    // draw particles on top of world but behind player
    drawParticles();

    if(running) requestAnimationFrame(loop);
  }

  function die(){
    running = false;
    statusEl.textContent = 'Dead — Click Play to retry';
    // big explosion of particles
    spawnParticles(player.x + player.w/2, player.y + player.h/2, '#ff4d4d', 36, 120);
    if(sfxDie){ try{sfxDie.currentTime=0;sfxDie.play();}catch(e){} }
    if(music) music.pause();
  }
  function win(){
    running=false;
    statusEl.textContent='Completed!';
    if(music) music.pause();
  }

  function render(){
    ctx.clearRect(0,0,W,H);
    drawBackground();
    ctx.fillStyle = '#0e2a44'; ctx.fillRect(0, GAME.groundY, W, H-GAME.groundY);
    if(level){
      for(const o of level.objs){
        const sx = Math.floor(o.x - cam);
        if(sx < -300 || sx > W+300) continue;
        if(o.type==='block') drawBlock(sx,o.y,o.w,o.h);
        if(o.type==='spike') drawSpike(sx,o.y);
        if(o.type==='platform') drawPlatform(sx,o.y,o.w,o.h,o);
        if(o.type==='portal') drawPortal(sx,o.y,o.w,o.h,o);
      }
    }
    drawPlayer(player.x, player.y, player.w, player.h);
  }

  function drawPlatform(x,y,w,h,obj){
    ctx.save();
    ctx.fillStyle = '#b6eaff';
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle = '#3a6fb3';
    ctx.strokeRect(x,y,w,h);
    ctx.restore();
  }

  function drawPortal(x,y,w,h,obj){
    ctx.save();
    ctx.strokeStyle = obj.mode==='reverse' ? '#ff6b6b' : '#6bffb6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x+w/2, y+h/2, Math.min(w,h)/2-2, 0, Math.PI*2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.restore();
  }

  // ensure particles updated/drawn
  // note: updateParticles is also called from loop for physics timing

  function drawBackground(){ if(assets.bg){ // parallax bg image
      const parCount = 3; for(let i=0;i<parCount;i++){ const speed = 0.2 + i*0.15; const x = -((cam*speed) % assets.bg.width); ctx.globalAlpha = 0.6 - i*0.12; ctx.drawImage(assets.bg, x, 0, assets.bg.width, H); ctx.drawImage(assets.bg, x + assets.bg.width, 0, assets.bg.width, H); } ctx.globalAlpha = 1; }
    else {
      for(let i=0;i<6;i++){ const offset = (cam*0.2*(i+1))% (W*2); ctx.fillStyle = `rgba(255,255,255,${0.02*(i+1)})`; ctx.fillRect(W - offset - 200, 20 + i*20, 400, 8); }
    } }

  function drawBlock(x,y,w,h){ if(tilePattern){ ctx.fillStyle = tilePattern; ctx.save(); ctx.translate(x,y); ctx.fillRect(0,0,w,h); ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.strokeRect(x,y,w,h); }
    else { const g = ctx.createLinearGradient(x,y,x,y+h); g.addColorStop(0,'#6aa6ff'); g.addColorStop(1,'#3a6fb3'); ctx.fillStyle = g; ctx.fillRect(x,y,w,h); ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.strokeRect(x,y,w,h); } }

  function drawSpike(x,y){ const size = 20; ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+size,y); ctx.lineTo(x+size/2,y-size); ctx.closePath(); ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.1)'; ctx.stroke(); }

  function drawPlayer(x,y,w,h){ const shape = icon.shape; const color = icon.color; const grad = ctx.createRadialGradient(x + w/2, y + h/2, w/8, x + w/2, y + h/2, w); grad.addColorStop(0,'#ffffff'); grad.addColorStop(0.1,color); grad.addColorStop(1,'#000000'); if(icon.glow){ ctx.shadowColor = color; ctx.shadowBlur = 16; } else { ctx.shadowBlur = 0; } ctx.fillStyle = grad; ctx.beginPath(); if(shape==='square') ctx.rect(x, y, w, h); else if(shape==='circle') ctx.arc(x + w/2, y + h/2, w/2, 0, Math.PI*2); else if(shape==='triangle'){ ctx.moveTo(x,y+h); ctx.lineTo(x+w/2,y); ctx.lineTo(x+w,y+h); ctx.closePath(); } ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.stroke(); }

  // --- Particle system ---
  const particles = [];
  // particle settings (modifiable via UI)
  const particleSettings = {
    multiplier: 1,
    sizeMul: 1,
    gravityFactor: 60,
    useSprite: true
  };

  function spawnParticles(x,y,color,count,spread){
    const mult = particleSettings.multiplier || 1;
    const finalCount = Math.max(1, Math.floor((count||6) * mult));
    for(let i=0;i<finalCount;i++){
      const angle = Math.PI * (0.4 + Math.random()*0.6);
      const speed = 60 + Math.random()*140;
      particles.push({
        x: x + (Math.random()-0.5)*6,
        y: y + (Math.random()-0.2)*6,
        vx: Math.cos(angle) * (Math.random()*speed - speed/2),
        vy: -Math.sin(angle) * (80 + Math.random()*120),
        life: 0.4 + Math.random()*0.6,
        size: (2 + Math.random()*3) * particleSettings.sizeMul,
        color: color,
        rotation: Math.random()*Math.PI*2
      });
    }
  }

  function updateParticles(dt){
    for(let i=particles.length-1;i>=0;i--){
      const p = particles[i];
      p.vy += (particleSettings.gravityFactor||60) * dt; // particle gravity
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += dt * 6;
      p.life -= dt;
      if(p.life <= 0) particles.splice(i,1);
    }
  }

  function drawParticles(){
    ctx.save();
    for(const p of particles){
      const alpha = Math.max(0, Math.min(1, p.life));
      if(particleSettings.useSprite && assets.particle){
        const s = (8 + p.size*2);
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.drawImage(assets.particle, -s/2, -s/2, s, s);
        ctx.rotate(-p.rotation);
        ctx.translate(-p.x, -p.y);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = hexToRgba(p.color, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function hexToRgba(hex, a){
    const c = (hex||'#ffffff').replace('#','');
    const r = parseInt(c.substring(0,2),16)||255;
    const g = parseInt(c.substring(2,4),16)||255;
    const b = parseInt(c.substring(4,6),16)||255;
    return `rgba(${r},${g},${b},${a})`;
  }

  // UI wiring
  playBtn.addEventListener('click',()=>{ startLevel(parseInt(levelSelect.value||0)); });
  iconBtn.addEventListener('click',()=>{ iconModal.classList.remove('hidden'); });
  iconClose.addEventListener('click',()=>{ iconModal.classList.add('hidden'); });
  iconSave.addEventListener('click',()=>{ icon.shape = iconShape.value; icon.color = iconColor.value; icon.glow = iconGlow.checked; saveIcon(); iconModal.classList.add('hidden'); });

  editorBtn.addEventListener('click',()=>{ editorModal.classList.remove('hidden'); loadEditorLevel(); });
  editorClose.addEventListener('click',()=>{ editorModal.classList.add('hidden'); });

  // Editor core
  let editorLevel = {id:'user',name:'Custom Level',length:2000,objs:[]};
  function loadEditorLevel(){ editorGrid.value = editorGrid.value || 20; drawEditor(); }
  function drawEditor(){ const g = parseInt(editorGrid.value,10); editorCtx.clearRect(0,0,editorCanvas.width,editorCanvas.height); editorCtx.strokeStyle='rgba(255,255,255,0.03)'; for(let x=0;x<editorCanvas.width;x+=g){ editorCtx.beginPath(); editorCtx.moveTo(x,0); editorCtx.lineTo(x,editorCanvas.height); editorCtx.stroke(); } for(let y=0;y<editorCanvas.height;y+=g){ editorCtx.beginPath(); editorCtx.moveTo(0,y); editorCtx.lineTo(editorCanvas.width,y); editorCtx.stroke(); } for(const o of editorLevel.objs){ if(o.type==='block'){ editorCtx.fillStyle='#3a6fb3'; editorCtx.fillRect(o.x,o.y,o.w,o.h); } else if(o.type==='spike'){ editorCtx.fillStyle='#ff4d4d'; editorCtx.beginPath(); editorCtx.moveTo(o.x,o.y); editorCtx.lineTo(o.x+20,o.y); editorCtx.lineTo(o.x+10,o.y-20); editorCtx.closePath(); editorCtx.fill(); } } }

  editorCanvas.addEventListener('click',e=>{ const rect = editorCanvas.getBoundingClientRect(); const x = Math.floor(e.clientX - rect.left); const y = Math.floor(e.clientY - rect.top); const g = parseInt(editorGrid.value,10); const gx = Math.floor(x/g)*g; const gy = Math.floor(y/g)*g; const tool = editorTool.value; if(tool==='block'){ editorLevel.objs.push({type:'block',x:gx,y:gy,w:g*4,h:g}); } else if(tool==='spike'){ editorLevel.objs.push({type:'spike',x:gx,y:gy+g}); } else if(tool==='erase'){ editorLevel.objs = editorLevel.objs.filter(o=>{ if(o.type==='block') return !(x>=o.x && x<=o.x+o.w && y>=o.y && y<=o.y+o.h); if(o.type==='spike') return !(x>=o.x && x<=o.x+20 && y>=o.y-20 && y<=o.y); return true; }); } drawEditor(); });

  editorExport.addEventListener('click',()=>{ const json = JSON.stringify(editorLevel, null, 2); prompt('Copy level JSON', json); });
  editorImport.addEventListener('click',()=>{ const s = prompt('Paste level JSON'); try{ const obj = JSON.parse(s); editorLevel = obj; drawEditor(); }catch(e){ alert('Invalid JSON'); } });
  editorPlay.addEventListener('click',()=>{ editorLevel.name = editorLevel.name || ('Custom '+(levels.length+1)); levels.push(editorLevel); localStorage.setItem('gd_levels', JSON.stringify(levels.filter(l=>l.id==='user'||l.id))); populateLevelSelect(); editorModal.classList.add('hidden'); startLevel(levels.length-1); });

  // tuning UI bindings
  function updateTuningUI(){ gravityRange.value = GAME.gravity; speedRange.value = GAME.speed; jumpRange.value = GAME.jumpVel; holdRange.value = GAME.maxHold; }
  gravityRange.addEventListener('input',()=>{ GAME.gravity = parseFloat(gravityRange.value); });
  speedRange.addEventListener('input',()=>{ GAME.speed = parseFloat(speedRange.value); });
  jumpRange.addEventListener('input',()=>{ GAME.jumpVel = parseFloat(jumpRange.value); });
  holdRange.addEventListener('input',()=>{ GAME.maxHold = parseFloat(holdRange.value); });
  updateTuningUI();
  // particle UI bindings
  function updateParticleUI(){ particleCountRange.value = particleSettings.multiplier; particleSizeRange.value = particleSettings.sizeMul; particleGravityRange.value = particleSettings.gravityFactor; particleSpriteToggle.checked = particleSettings.useSprite; }
  particleCountRange.addEventListener('input',()=>{ particleSettings.multiplier = parseInt(particleCountRange.value,10); });
  particleSizeRange.addEventListener('input',()=>{ particleSettings.sizeMul = parseFloat(particleSizeRange.value); });
  particleGravityRange.addEventListener('input',()=>{ particleSettings.gravityFactor = parseFloat(particleGravityRange.value); });
  particleSpriteToggle.addEventListener('change',()=>{ particleSettings.useSprite = !!particleSpriteToggle.checked; });
  // defaults
  particleSettings.multiplier = 1; particleSettings.sizeMul = 1; particleSettings.gravityFactor = 60; particleSettings.useSprite = true;
  updateParticleUI();

  // initial render and asset load
  render();
  loadAssets(()=>{ try{ tilePattern = ctx.createPattern(assets.tiles,'repeat'); }catch(e){} render(); });

})();
