// ========================================================
// EFFET SONORE NOTIFICATION CHIME (WEB AUDIO API ULTRA-RAPIDE)
// ========================================================
export const playNotificationChime = (soundEnabled = true) => {
  if (!soundEnabled) return;
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // Mi 5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // La 5
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch (e) {}
};

// Alias de rétrocompatibilité sans mention publique
export const playAlibabaChime = playNotificationChime;
