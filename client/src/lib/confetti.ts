import confetti from 'canvas-confetti';

export function firePublishConfetti() {
  const duration = 2800;
  const end = Date.now() + duration;
  const colors = ['#c5a67c', '#4e342e', '#e8dfd6', '#2e7d32'];

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });
  frame();
}
