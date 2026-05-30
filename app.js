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
    } else if (remaining <= 60){
      // 1 minute or less: urgent (red)
      screen.classList.remove('state-ok','state-warn');
      screen.classList.add('state-urgent');
      subEl.textContent = 'Hurry up';
    } else if (remaining <= 5 * 60){
      // 3 minutes or less: warning (orange)
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
    if (remaining <= 0){
      if (currentPhase === 'talk' && durations.qa > 0){
        // Move straight into Q&A so overlong talks consume Q&A, not the next slot.
        currentPhase = 'qa';
        remaining = durations.qa;
        updateDisplay();
        return;
      }
      remaining = 0;
      updateDisplay();
      pause();
      return;
    }
    updateDisplay();
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

  function syncFullscreenButton(){
    fullscreenBtn.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen';
  }

  fullscreenBtn.addEventListener('click', async ()=>{
    if (!document.fullscreenElement){
      await document.documentElement.requestFullscreen().catch(()=>{});
    } else {
      await document.exitFullscreen().catch(()=>{});
    }
  });

  document.addEventListener('fullscreenchange', syncFullscreenButton);

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
  syncFullscreenButton();
  updateDisplay();
})();
