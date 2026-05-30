(() => {
  const $ = id => document.getElementById(id);

  const talkMinInput = $('talk-min');
  const qaMinInput = $('qa-min');
  const setBtn = $('set-btn');
  const fullscreenBtn = $('fullscreen-btn');

  const phaseEl = $('phase');
  const timeEl = $('time');
  const timeMinEl = $('time-min');
  const timeSecEl = $('time-sec');
  const subEl = $('sub');

  const startBtn = $('start-btn');
  const pauseBtn = $('pause-btn');
  const resetBtn = $('reset-btn');
  const nextBtn = $('next-btn');
  const screen = $('timer-screen');

  let durations = { talk: 15*60, qa: 5*60 };
  let currentPhase = 'talk';
  let remaining = durations.talk;
  let interval = null;
  let running = false;

  function formatTime(s){
    if (s < 0) s = 0;
    const mm = Math.floor(s/60);
    const ss = Math.floor(s%60).toString().padStart(2,'0');
    return { mm: String(mm), ss };
  }

  function updateDisplay(){
    phaseEl.textContent = currentPhase === 'talk' ? 'Talk' : 'Q&A';
    const { mm, ss } = formatTime(remaining);
    if (timeMinEl && timeSecEl) {
      timeMinEl.textContent = mm;
      timeSecEl.textContent = ss;
      timeEl.setAttribute('aria-label', `${mm}:${ss}`);
    } else {
      timeEl.textContent = `${mm}:${ss}`;
    }
    if (remaining <= 0){
      screen.classList.remove('state-ok','state-warn');
      screen.classList.add('state-urgent');
      subEl.textContent = 'Time is up';
    } else if (remaining <= 30){
      screen.classList.remove('state-ok','state-urgent');
      screen.classList.add('state-warn');
      subEl.textContent = 'Hurry up';
    } else {
      screen.classList.remove('state-warn','state-urgent');
      screen.classList.add('state-ok');
      subEl.textContent = running ? 'Running' : 'Ready';
    }
  }

  function setDurations(){
    const t = Math.max(1, parseInt(talkMinInput.value || '15',10));
    const q = Math.max(0, parseInt(qaMinInput.value || '5',10));
    durations.talk = t*60;
    durations.qa = q*60;
    currentPhase = 'talk';
    remaining = durations.talk;
    updateDisplay();
  }

  function tick(){
    remaining -= 1;
    updateDisplay();
    if (remaining <= 0){
      playBeepSequence(3);
      pause();
    }
  }

  function start(){
    if (running) return;
    running = true;
    updateDisplay();
    interval = setInterval(tick, 1000);
  }

  function pause(){
    running = false;
    if (interval) { clearInterval(interval); interval = null; }
    updateDisplay();
  }

  function reset(){
    pause();
    currentPhase = 'talk';
    remaining = durations.talk;
    updateDisplay();
  }

  function nextPhase(){
    pause();
    if (currentPhase === 'talk'){
      if (durations.qa <= 0){
        subEl.textContent = 'No Q&A — finished';
        return;
      }
      currentPhase = 'qa';
      remaining = durations.qa;
    } else {
      currentPhase = 'talk';
      remaining = durations.talk;
    }
    updateDisplay();
  }

  // simple beep using WebAudio
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playBeep(ms=180, freq=880){
    try{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
      o.start();
      setTimeout(()=>{ g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02); o.stop(); }, ms);
    }catch(e){ console.warn('Audio failed', e); }
  }

  function playBeepSequence(n=2){
    for(let i=0;i<n;i++) setTimeout(()=>playBeep(160, 880 - i*80), i*350);
  }

  fullscreenBtn.addEventListener('click', async ()=>{
    if (!document.fullscreenElement){
      await document.documentElement.requestFullscreen().catch(()=>{});
      fullscreenBtn.textContent = 'Exit Fullscreen';
    } else {
      await document.exitFullscreen().catch(()=>{});
      fullscreenBtn.textContent = 'Enter Fullscreen';
    }
  });

  setBtn.addEventListener('click', ()=>{ setDurations(); });
  startBtn.addEventListener('click', ()=>{ start(); });
  pauseBtn.addEventListener('click', ()=>{ pause(); });
  resetBtn.addEventListener('click', ()=>{ reset(); });
  nextBtn.addEventListener('click', ()=>{ nextPhase(); });

  // keyboard shortcuts
  document.addEventListener('keydown', (e)=>{
    if (e.code === 'Space') { e.preventDefault(); running ? pause() : start(); }
    if (e.key === 'n' || e.key === 'N') nextPhase();
    if (e.key === 'r' || e.key === 'R') reset();
  });

  // init
  setDurations();
  updateDisplay();
})();
