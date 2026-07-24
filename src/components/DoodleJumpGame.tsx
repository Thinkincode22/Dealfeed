import { useEffect, useRef, useState, useCallback } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const GRAVITY = 0.28;
const JUMP_VELOCITY = -10.5;
const SPRING_VELOCITY = -17;
const MOVE_SPEED = 4.2;
const PLAYER_RADIUS = 16;
const PLATFORM_WIDTH = 62;
const PLATFORM_HEIGHT = 14;
const HIGH_SCORE_KEY = 'dealfeed-doodle-highscore';

type PlatformType = 'normal' | 'moving' | 'breaking' | 'spring';

interface Platform {
  x: number;
  y: number;
  type: PlatformType;
  broken: boolean;
  dir: 1 | -1;
}

interface Star {
  x: number;
  y: number;
  r: number;
  twinkle: number;
}

interface Player {
  x: number;
  y: number;
  vy: number;
  vx: number;
  facing: 1 | -1;
  squash: number;
}

type GameState = 'menu' | 'playing' | 'gameover';

function playTone(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = 'sine', startGain = 0.15) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(startGain, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function makeSky(height: number) {
  // height = meters climbed; blends from warm dawn to deep space
  const t = Math.min(1, height / 4000);
  const top = lerpColor([135, 206, 250], [10, 8, 40], t);
  const bottom = lerpColor([255, 236, 179], [40, 20, 70], t);
  return { top, bottom, spaceT: t };
}

function lerpColor(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

function rgb([r, g, b]: number[]) {
  return `rgb(${r},${g},${b})`;
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function DoodleJumpGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stateRef = useRef<GameState>('menu');
  const [uiState, setUiState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const playerRef = useRef<Player>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, vy: 0, vx: 0, facing: 1, squash: 1 });
  const platformsRef = useRef<Platform[]>([]);
  const starsRef = useRef<Star[]>([]);
  const cameraYRef = useRef(0);
  const maxHeightRef = useRef(0);
  const keysRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const rafRef = useRef<number>(0);
  const highestPlatformYRef = useRef(0);

  const getAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') void audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const spawnPlatform = useCallback((y: number) => {
    const roll = Math.random();
    let type: PlatformType = 'normal';
    if (roll > 0.92) type = 'spring';
    else if (roll > 0.78) type = 'breaking';
    else if (roll > 0.58) type = 'moving';

    platformsRef.current.push({
      x: randRange(PLATFORM_WIDTH / 2, GAME_WIDTH - PLATFORM_WIDTH / 2),
      y,
      type,
      broken: false,
      dir: Math.random() > 0.5 ? 1 : -1,
    });
  }, []);

  const resetGame = useCallback(() => {
    platformsRef.current = [];
    starsRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * GAME_HEIGHT * 4 - GAME_HEIGHT * 3,
      r: randRange(0.5, 1.8),
      twinkle: Math.random() * Math.PI * 2,
    }));
    cameraYRef.current = 0;
    maxHeightRef.current = 0;

    // starting platform right under the player
    platformsRef.current.push({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60, type: 'normal', broken: false, dir: 1 });
    let y = GAME_HEIGHT - 140;
    while (y > -GAME_HEIGHT * 3) {
      spawnPlatform(y);
      y -= randRange(55, 95);
    }
    highestPlatformYRef.current = y;

    playerRef.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, vy: JUMP_VELOCITY, vx: 0, facing: 1, squash: 1 };
    setScore(0);
  }, [spawnPlatform]);

  const startGame = useCallback(() => {
    getAudio();
    resetGame();
    stateRef.current = 'playing';
    setUiState('playing');
  }, [getAudio, resetGame]);

  const endGame = useCallback(() => {
    stateRef.current = 'gameover';
    setUiState('gameover');
    const finalScore = Math.floor(maxHeightRef.current / 10);
    setScore(finalScore);
    setHighScore((prev) => {
      const next = Math.max(prev, finalScore);
      try {
        localStorage.setItem(HIGH_SCORE_KEY, String(next));
      } catch {
        /* localStorage may be unavailable */
      }
      return next;
    });
    try {
      const ctx = getAudio();
      playTone(ctx, 220, 0.25, 'sawtooth', 0.12);
      setTimeout(() => playTone(ctx, 140, 0.35, 'sawtooth', 0.12), 120);
    } catch {
      /* audio may be blocked */
    }
  }, [getAudio]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) setHighScore(parseInt(stored, 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    canvas.style.width = `${GAME_WIDTH}px`;
    canvas.style.height = `${GAME_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    const step = () => {
      update();
      draw(ctx);
      rafRef.current = requestAnimationFrame(step);
    };

    function update() {
      if (stateRef.current !== 'playing') return;
      const player = playerRef.current;

      if (keysRef.current.left) {
        player.vx = -MOVE_SPEED;
        player.facing = -1;
      } else if (keysRef.current.right) {
        player.vx = MOVE_SPEED;
        player.facing = 1;
      } else {
        player.vx *= 0.85;
      }

      player.x += player.vx;
      if (player.x < -PLAYER_RADIUS) player.x = GAME_WIDTH + PLAYER_RADIUS;
      if (player.x > GAME_WIDTH + PLAYER_RADIUS) player.x = -PLAYER_RADIUS;

      player.vy += GRAVITY;
      player.y += player.vy;
      player.squash += (1 - player.squash) * 0.2;

      // camera follows upward movement
      const screenY = player.y - cameraYRef.current;
      if (screenY < GAME_HEIGHT * 0.4) {
        const delta = GAME_HEIGHT * 0.4 - screenY;
        cameraYRef.current -= delta;
        maxHeightRef.current = Math.max(maxHeightRef.current, -cameraYRef.current);
        setScore(Math.floor(maxHeightRef.current / 10));
      }

      // move moving platforms & check landing
      for (const p of platformsRef.current) {
        if (p.broken) continue;
        if (p.type === 'moving') {
          p.x += p.dir * 1.6;
          if (p.x < PLATFORM_WIDTH / 2 || p.x > GAME_WIDTH - PLATFORM_WIDTH / 2) p.dir = (p.dir * -1) as 1 | -1;
        }

        if (player.vy > 0) {
          const withinX = Math.abs(player.x - p.x) < PLATFORM_WIDTH / 2 + PLAYER_RADIUS * 0.5;
          const withinY = player.y + PLAYER_RADIUS > p.y && player.y + PLAYER_RADIUS < p.y + PLATFORM_HEIGHT + player.vy;
          if (withinX && withinY) {
            if (p.type === 'breaking') {
              p.broken = true;
              try { playTone(getAudio(), 180, 0.15, 'square', 0.08); } catch { /* ignore */ }
            } else if (p.type === 'spring') {
              player.vy = SPRING_VELOCITY;
              player.squash = 1.4;
              try { playTone(getAudio(), 660, 0.12, 'triangle', 0.1); } catch { /* ignore */ }
              continue;
            } else {
              player.vy = JUMP_VELOCITY;
              player.squash = 1.3;
              try { playTone(getAudio(), 440, 0.08, 'sine', 0.08); } catch { /* ignore */ }
            }
          }
        }
      }
      platformsRef.current = platformsRef.current.filter((p) => !p.broken);

      // recycle / spawn platforms
      const topVisible = cameraYRef.current;
      while (highestPlatformYRef.current > topVisible - GAME_HEIGHT) {
        highestPlatformYRef.current -= randRange(55, 95);
        spawnPlatform(highestPlatformYRef.current);
      }
      platformsRef.current = platformsRef.current.filter((p) => p.y - cameraYRef.current < GAME_HEIGHT + 60);

      if (player.y - cameraYRef.current > GAME_HEIGHT + 40) {
        endGame();
      }
    }

    function draw(ctx: CanvasRenderingContext2D) {
      const sky = makeSky(maxHeightRef.current);
      const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
      grad.addColorStop(0, rgb(sky.top));
      grad.addColorStop(1, rgb(sky.bottom));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      if (sky.spaceT > 0.15) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, (sky.spaceT - 0.15) * 1.4);
        for (const s of starsRef.current) {
          const sy = s.y - cameraYRef.current * 0.3;
          const wrapped = ((sy % (GAME_HEIGHT * 4)) + GAME_HEIGHT * 4) % (GAME_HEIGHT * 4);
          if (wrapped > GAME_HEIGHT) continue;
          const twinkle = 0.5 + 0.5 * Math.sin(s.twinkle + performance.now() / 500);
          ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
          ctx.beginPath();
          ctx.arc(s.x, wrapped, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // platforms (pseudo-3D: gradient top face + shadow underside)
      for (const p of platformsRef.current) {
        const py = p.y - cameraYRef.current;
        if (py < -30 || py > GAME_HEIGHT + 30) continue;
        drawPlatform(ctx, p, py);
      }

      drawPlayer(ctx, playerRef.current, cameraYRef.current);
    }

    function drawPlatform(ctx: CanvasRenderingContext2D, p: Platform, py: number) {
      const w = PLATFORM_WIDTH;
      const h = PLATFORM_HEIGHT;
      const x = p.x - w / 2;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;

      const colors: Record<PlatformType, [string, string]> = {
        normal: ['#7ee787', '#2f9e44'],
        moving: ['#74c0fc', '#1971c2'],
        breaking: ['#e8a15a', '#a5591a'],
        spring: ['#ffe066', '#e8a300'],
      };
      const [light, dark] = colors[p.type];
      const g = ctx.createLinearGradient(x, py, x, py + h);
      g.addColorStop(0, light);
      g.addColorStop(1, dark);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x, py, w, h, 6);
      ctx.fill();
      ctx.restore();

      // top highlight for pseudo-3D pop
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.roundRect(x + 3, py + 1.5, w - 6, h * 0.35, 4);
      ctx.fill();

      if (p.type === 'breaking') {
        ctx.strokeStyle = 'rgba(80,40,10,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - 8, py + 2);
        ctx.lineTo(p.x, py + h - 2);
        ctx.lineTo(p.x + 10, py + 3);
        ctx.stroke();
      }

      if (p.type === 'spring') {
        ctx.strokeStyle = '#7a5200';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const sy = py - 2 - i * 4;
          ctx.moveTo(p.x - 6, sy);
          ctx.lineTo(p.x + 6, sy - 3);
        }
        ctx.stroke();
      }
    }

    function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, camY: number) {
      const x = player.x;
      const y = player.y - camY;
      const stretch = player.vy < 0 ? 1.15 : 1;
      const rx = PLAYER_RADIUS * (2 - player.squash) * 0.95;
      const ry = PLAYER_RADIUS * player.squash * stretch;

      // shadow
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(x, y + ry + 4, rx * 0.8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // body
      const bodyGrad = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 2, x, y, rx * 1.4);
      bodyGrad.addColorStop(0, '#9be564');
      bodyGrad.addColorStop(1, '#4f9d1f');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // legs
      ctx.strokeStyle = '#3d7a17';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - rx * 0.5, y + ry * 0.7);
      ctx.lineTo(x - rx * 0.7, y + ry + 6);
      ctx.moveTo(x + rx * 0.5, y + ry * 0.7);
      ctx.lineTo(x + rx * 0.7, y + ry + 6);
      ctx.stroke();

      // eyes
      const eyeOffsetX = player.facing * rx * 0.35;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(x + eyeOffsetX - 4, y - ry * 0.2, 5, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(x + eyeOffsetX + 6, y - ry * 0.2, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(x + eyeOffsetX - 4 + player.facing * 1.5, y - ry * 0.2, 2.4, 0, Math.PI * 2);
      ctx.arc(x + eyeOffsetX + 6 + player.facing * 1.5, y - ry * 0.2, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if ((e.key === ' ' || e.key === 'Enter') && stateRef.current !== 'playing') {
        e.preventDefault();
        startGame();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [startGame]);

  const setTouch = (side: 'left' | 'right', pressed: boolean) => {
    keysRef.current[side] = pressed;
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10" style={{ width: GAME_WIDTH, height: GAME_HEIGHT, maxWidth: '100%' }}>
        <canvas ref={canvasRef} className="block touch-none" />

        {uiState !== 'playing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/55 backdrop-blur-sm text-white px-6 text-center">
            <h3 className="text-2xl font-extrabold tracking-tight">
              {uiState === 'menu' ? '🚀 Doodle Jump' : '💥 Game Over'}
            </h3>
            {uiState === 'gameover' && (
              <p className="text-sm text-gray-200">
                Score: <span className="font-bold text-white">{score}</span> &middot; Best:{' '}
                <span className="font-bold text-yellow-300">{highScore}</span>
              </p>
            )}
            {uiState === 'menu' && (
              <p className="text-xs text-gray-300 max-w-[240px]">
                Use ← → or A/D to move, or the buttons below on mobile. Bounce on platforms and climb as high as you
                can!
              </p>
            )}
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-full bg-green-500 hover:bg-green-400 active:scale-95 transition-all font-bold text-black shadow-lg"
            >
              {uiState === 'menu' ? 'Play' : 'Play Again'}
            </button>
          </div>
        )}

        {uiState === 'playing' && (
          <div className="absolute top-3 left-3 bg-black/40 text-white text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm">
            {score}
          </div>
        )}
        {uiState === 'playing' && highScore > 0 && (
          <div className="absolute top-3 right-3 bg-black/40 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
            Best {highScore}
          </div>
        )}
      </div>

      <div className="flex gap-4 md:hidden">
        <button
          className="w-20 h-14 rounded-xl bg-gray-800 text-white text-xl font-bold active:bg-gray-600 select-none"
          onPointerDown={() => setTouch('left', true)}
          onPointerUp={() => setTouch('left', false)}
          onPointerLeave={() => setTouch('left', false)}
        >
          ←
        </button>
        <button
          className="w-20 h-14 rounded-xl bg-gray-800 text-white text-xl font-bold active:bg-gray-600 select-none"
          onPointerDown={() => setTouch('right', true)}
          onPointerUp={() => setTouch('right', false)}
          onPointerLeave={() => setTouch('right', false)}
        >
          →
        </button>
      </div>
    </div>
  );
}
