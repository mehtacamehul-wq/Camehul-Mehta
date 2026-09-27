import React, { useRef, useEffect } from 'react';
import { VideoScene, VideoStyle } from '../../types/ebook';
import { SupportedLanguage } from '../../utils/translations';
import { sceneRatRaceImg, sceneZebraImg, heroLibImg } from '../../data/ebooksData';

interface MotionGraphicsCanvasProps {
  scene: VideoScene;
  playbackProgress: number; // 0 to 1 for the current scene
  isSpeaking: boolean;
  aspectRatio: '16:9' | '9:16';
  videoStyle?: VideoStyle;
  language?: SupportedLanguage;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const MotionGraphicsCanvas: React.FC<MotionGraphicsCanvasProps> = ({
  scene,
  playbackProgress,
  isSpeaking,
  aspectRatio,
  videoStyle = 'cinematic',
  language = 'en',
  canvasRef,
}) => {
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  // Preload background images
  useEffect(() => {
    const loadImg = (key: string, src: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        imagesRef.current[key] = img;
      };
    };

    loadImg('library', heroLibImg);
    loadImg('rat_race', sceneRatRaceImg);
    loadImg('sunlit_assets', sceneRatRaceImg);
    loadImg('zebra_growth', sceneZebraImg);
  }, []);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background based on videoStyle
      drawStylizedBackground(ctx, scene, width, height, playbackProgress, videoStyle, imagesRef.current);

      // 2. Draw Motion Graphic based on scene.chartType and videoStyle
      drawMotionGraphic(ctx, scene.chartType, width, height, playbackProgress, videoStyle);

      // 3. Draw Scene Title & Header Overlay
      ctx.save();
      if (videoStyle === 'motion_reel') {
        ctx.fillStyle = '#38bdf8'; // electric cyan
        ctx.font = '700 13px "JetBrains Mono", monospace';
      } else if (videoStyle === 'infographic') {
        ctx.fillStyle = '#10b981'; // emerald green
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
      } else if (videoStyle === 'studio_3d') {
        ctx.fillStyle = '#a855f7'; // violet
        ctx.font = '600 12px "JetBrains Mono", monospace';
      } else {
        ctx.fillStyle = '#f59e0b'; // cinematic amber
        ctx.font = '600 13px "JetBrains Mono", monospace';
      }

      ctx.fillText(`ACT 0${scene.sceneNumber} // ${scene.title.toUpperCase()}`, 40, 50);

      // Scene Keynote Headline
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(scene.keynote, 40, 85);

      if (scene.secondaryBullet) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = '13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(scene.secondaryBullet, 40, 110);
      }
      ctx.restore();

      // 4. Draw Karaoke Subtitle Box at Bottom (Supporting Multi-Language)
      drawKaraokeSubtitles(ctx, scene.voiceover, width, height, playbackProgress, isSpeaking, videoStyle, language);

      // 5. Draw Progress Timeline Line at the top
      ctx.fillStyle = videoStyle === 'motion_reel' ? '#06b6d4' : '#d97706';
      ctx.fillRect(0, 0, width * playbackProgress, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scene, playbackProgress, isSpeaking, aspectRatio, videoStyle, language]);

  return (
    <canvas
      ref={canvasRef}
      width={aspectRatio === '16:9' ? 960 : 540}
      height={aspectRatio === '16:9' ? 540 : 960}
      className="w-full h-full object-contain rounded-xl shadow-2xl bg-black"
    />
  );
};

// Stylized Background Renderer
function drawStylizedBackground(
  ctx: CanvasRenderingContext2D,
  scene: VideoScene,
  width: number,
  height: number,
  progress: number,
  style: VideoStyle,
  images: Record<string, HTMLImageElement>
) {
  const bgImg = images[scene.visualBackground];

  if (style === 'infographic') {
    // 2D Vector Infographic: Crisp slate blueprint with geometric grid
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    return;
  }

  if (style === 'studio_3d') {
    // 3D Virtual Studio: Isometric floor grid with deep violet space
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
    ctx.lineWidth = 1.5;
    const vanishY = height * 0.35;
    for (let x = -width; x < width * 2; x += 60) {
      ctx.beginPath();
      ctx.moveTo(width / 2, vanishY);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    return;
  }

  if (style === 'motion_reel') {
    // Motion Graphics Reel: Deep dark field with kinetic neon radial pulse
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, width, height);

    const pulseRadius = 180 + Math.sin(progress * Math.PI * 4) * 20;
    const radGrad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, pulseRadius);
    radGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
    radGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.1)');
    radGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Default 'cinematic' style
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    const scale = 1 + progress * 0.08;
    const panX = Math.sin(progress * Math.PI) * 15;
    
    ctx.save();
    ctx.translate(width / 2 + panX, height / 2);
    ctx.scale(scale, scale);
    ctx.drawImage(bgImg, -width / 2, -height / 2, width, height);
    ctx.restore();

    const scrim = ctx.createLinearGradient(0, 0, 0, height);
    scrim.addColorStop(0, 'rgba(10, 10, 15, 0.4)');
    scrim.addColorStop(0.5, 'rgba(10, 10, 15, 0.7)');
    scrim.addColorStop(1, 'rgba(8, 8, 12, 0.95)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, width, height);
  } else {
    const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.8);
    grad.addColorStop(0, '#1c1917');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// Motion Graphic Diagrams Renderer
function drawMotionGraphic(
  ctx: CanvasRenderingContext2D,
  type: string,
  width: number,
  height: number,
  progress: number,
  style: VideoStyle
) {
  const centerX = width / 2;
  const centerY = height / 2 + 10;

  ctx.save();

  if (type === 'cashflow_quadrant') {
    const boxSize = 135;
    const startX = centerX - boxSize;
    const startY = centerY - boxSize;

    ctx.strokeStyle = style === 'motion_reel' ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, boxSize * 2, boxSize * 2);
    ctx.beginPath();
    ctx.moveTo(centerX, startY);
    ctx.lineTo(centerX, startY + boxSize * 2);
    ctx.moveTo(startX, centerY);
    ctx.lineTo(startX + boxSize * 2, centerY);
    ctx.stroke();

    const quadrants = [
      { code: 'E', label: 'Employee', sub: 'Trades Time for Money', x: startX + 20, y: startY + 40, active: progress < 0.35, color: '#f87171' },
      { code: 'S', label: 'Self-Employed', sub: 'Owns a Job', x: startX + 20, y: centerY + 40, active: progress < 0.5, color: '#fb923c' },
      { code: 'B', label: 'Business Owner', sub: 'Owns a System', x: centerX + 20, y: startY + 40, active: progress >= 0.5, color: '#38bdf8' },
      { code: 'I', label: 'Investor', sub: 'Money Works For You', x: centerX + 20, y: centerY + 40, active: progress >= 0.7, color: '#4ade80' }
    ];

    quadrants.forEach(q => {
      ctx.fillStyle = q.active ? q.color : 'rgba(255, 255, 255, 0.3)';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(q.code, q.x, q.y);

      ctx.fillStyle = q.active ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(q.label, q.x, q.y + 24);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(q.sub, q.x, q.y + 42);
    });

    if (progress > 0.4) {
      const arrowProgress = (progress - 0.4) / 0.6;
      ctx.strokeStyle = style === 'motion_reel' ? '#06b6d4' : '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, Math.PI, Math.PI * (1 + arrowProgress));
      ctx.stroke();
    }

  } else if (type === 'rat_race_cycle') {
    const radius = 90;
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(centerX - 80, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    const angle = progress * Math.PI * 4;
    const arrowX = centerX - 80 + Math.cos(angle) * radius;
    const arrowY = centerY + Math.sin(angle) * radius;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(arrowX, arrowY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('RAT RACE HAMSTER WHEEL', centerX - 80, centerY - 15);
    ctx.font = '11px sans-serif';
    ctx.fillText('Paycheck → Expenses → Debt', centerX - 80, centerY + 10);

    ctx.textAlign = 'left';
    if (progress > 0.3) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - 80, centerY - radius);
      ctx.bezierCurveTo(centerX - 20, centerY - radius, centerX + 20, centerY, centerX + 120, centerY - 70);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillText('FREEDOM VECTOR →', centerX + 100, centerY - 80);
      ctx.font = '12px sans-serif';
      ctx.fillText('Asset Column Growth', centerX + 100, centerY - 60);
    }

  } else if (type === 'compound_interest') {
    const graphWidth = 360;
    const graphHeight = 180;
    const originX = centerX - graphWidth / 2;
    const originY = centerY + graphHeight / 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, originY - graphHeight);
    ctx.lineTo(originX, originY);
    ctx.lineTo(originX + graphWidth, originY);
    ctx.stroke();

    ctx.strokeStyle = style === 'motion_reel' ? '#38bdf8' : '#fbbf24';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(originX, originY);

    const steps = 60;
    const currentStep = Math.floor(steps * progress);
    for (let i = 0; i <= currentStep; i++) {
      const t = i / steps;
      const x = originX + t * graphWidth;
      const y = originY - Math.pow(t, 2.8) * graphHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const tipT = currentStep / steps;
    const tipX = originX + tipT * graphWidth;
    const tipY = originY - Math.pow(tipT, 2.8) * graphHeight;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style === 'motion_reel' ? '#38bdf8' : '#fbbf24';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText(`EXPONENTIAL COMPOUNDING (Year ${Math.round(tipT * 30)})`, tipX - 70, tipY - 15);

  } else if (type === 'asset_vs_liability') {
    const colWidth = 100;
    const colHeightMax = 160;

    const assetH = colHeightMax * Math.min(1, progress * 1.2);
    ctx.fillStyle = '#059669';
    ctx.fillRect(centerX - 130, centerY + 80 - assetH, colWidth, assetH);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('ASSET COLUMN', centerX - 130, centerY + 105);
    ctx.font = '11px sans-serif';
    ctx.fillText('Puts Money In Pocket', centerX - 130, centerY + 125);

    const liabH = colHeightMax * Math.max(0.2, 1 - progress * 0.7);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(centerX + 30, centerY + 80 - liabH, colWidth, liabH);

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('LIABILITIES', centerX + 30, centerY + 105);
    ctx.font = '11px sans-serif';
    ctx.fillText('Drains Cashflow', centerX + 30, centerY + 125);

  } else if (type === 'zebra_vs_unicorn') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 140, centerY - 60, 120, 120);

    ctx.fillStyle = '#09090b';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(centerX - 140 + i * 24, centerY - 60, 12, 120);
    }

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ZEBRA COMPANY', centerX - 140, centerY + 85);
    ctx.font = '11px sans-serif';
    ctx.fillText('Sustainable Profit + Purpose', centerX - 140, centerY + 105);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('VS', centerX + 5, centerY);

    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(centerX + 50, centerY - 60, 120, 120);
    ctx.setLineDash([]);

    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('UNICORN BUBBLE', centerX + 50, centerY + 85);
    ctx.font = '11px sans-serif';
    ctx.fillText('Negative Margins & Burn', centerX + 50, centerY + 105);

  } else {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 140, 70, 0, 0, Math.PI * 2);
    ctx.stroke();

    const velAngle = progress * Math.PI * 4;
    const dotX = centerX + Math.cos(velAngle) * 140;
    const dotY = centerY + Math.sin(velAngle) * 70;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VELOCITY OF CAPITAL', centerX, centerY);
    ctx.textAlign = 'left';
  }

  ctx.restore();
}

// Karaoke Subtitles Renderer at Bottom with Multi-Language Support
function drawKaraokeSubtitles(
  ctx: CanvasRenderingContext2D,
  voiceover: string,
  width: number,
  height: number,
  progress: number,
  isSpeaking: boolean,
  style: VideoStyle,
  language: SupportedLanguage
) {
  const boxHeight = 85;
  const boxY = height - boxHeight - 20;
  const paddingX = 40;

  ctx.save();
  ctx.fillStyle = style === 'motion_reel' ? 'rgba(5, 5, 10, 0.92)' : 'rgba(15, 15, 20, 0.88)';
  ctx.beginPath();
  ctx.roundRect(paddingX, boxY, width - paddingX * 2, boxHeight, 12);
  ctx.fill();

  ctx.strokeStyle = isSpeaking 
    ? (style === 'motion_reel' ? 'rgba(6, 182, 212, 0.8)' : 'rgba(245, 158, 11, 0.6)') 
    : 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Words highlighting based on progress
  const words = voiceover.split(/\s+/);
  const highlightedWordCount = Math.floor(words.length * progress);

  ctx.font = language === 'hi' 
    ? '500 16px "Plus Jakarta Sans", sans-serif'
    : '500 15px "Plus Jakarta Sans", sans-serif';

  let currentX = paddingX + 20;
  let currentY = boxY + 32;
  const lineHeight = 24;
  const maxWidth = width - paddingX * 2 - 40;

  words.forEach((word, idx) => {
    const wordWidth = ctx.measureText(word + ' ').width;

    if (currentX + wordWidth > paddingX + maxWidth) {
      currentX = paddingX + 20;
      currentY += lineHeight;
    }

    if (idx <= highlightedWordCount) {
      ctx.fillStyle = style === 'motion_reel' ? '#67e8f9' : '#fef08a';
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
    }

    ctx.fillText(word, currentX, currentY);
    currentX += wordWidth;
  });

  ctx.restore();
}
