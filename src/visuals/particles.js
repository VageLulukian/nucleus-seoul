// visuals/particles.js — поле частиц NUCLEUS (Шаг 1, Task 7). docs/03 §5.2.
//
// Редкие дрейфующие частицы с лёгким параллаксом (по глубине z), низкая
// прозрачность, cyan. SCAN — стягиваются к центру (поток), ALERT — краснеют+
// джиттерят (docs/03 §7). Лимит — config.PARTICLE_LIMIT (перф-гард ~60fps,
// docs/07 §8). Стартовые позиции/фазы детерминированы от сидируемого PRNG
// (docs/02 §6.4) → дубли визуально повторяются.
//
// makeParticleField — ЧИСТАЯ функция (DOM-free, node-тестируемая): консумит
// переданный PRNG, возвращает массив частиц с нормализованными [0,1) координатами
// (резолюшн-независимо — масштабируются на w/h при отрисовке).

/**
 * makeParticleField — детерминированно построить поле из `count` частиц,
 * консумя переданный PRNG. Координаты нормализованы [0,1); z — глубина (параллакс
 * + размер); phase/speed — для дрейфа. Один и тот же PRNG-сид → идентичное поле.
 * @param {() => number} prng — сидируемый генератор (core.makePRNG).
 * @param {number} count — число частиц (config.PARTICLE_LIMIT).
 * @returns {Array<{x:number,y:number,z:number,phase:number,speed:number}>}
 */
export function makeParticleField(prng, count) {
  const arr = [];
  for (let i = 0; i < count; i += 1) {
    arr.push({
      x: prng(), // нормализованная позиция X [0,1)
      y: prng(), // нормализованная позиция Y [0,1)
      z: 0.3 + prng() * 0.7, // глубина 0.3..1.0 → параллакс/размер/яркость
      phase: prng() * Math.PI * 2, // фаза джиттера/дрейфа
      speed: 0.2 + prng() * 0.8, // индивидуальная скорость дрейфа
    });
  }
  return arr;
}

export function createParticles() {
  return {
    render(env, field) {
      const { ctx, w, h, vt, dpr, accent, isAlert, isScan: scan, coreX: cx, coreY: cy, rgba } = env;
      if (!ctx || !field) return;
      const t = vt / 1000;

      for (let i = 0; i < field.length; i += 1) {
        const p = field[i];
        // Медленный вертикальный дрейф с параллаксом по глубине; wrap 0..1.
        let ny = p.y - t * 0.02 * p.speed * p.z;
        ny -= Math.floor(ny);
        let px = p.x * w;
        let py = ny * h;

        // SCAN — поток к центру (нарастает к ~3с скана, docs/03 §7).
        if (scan) {
          const k = 0.12 * (1 + p.z) * Math.min(1, t / 3);
          px += (cx - px) * k;
          py += (cy - py) * k;
        }
        // ALERT — джиттер (краснеет за счёт accent=red, docs/03 §7).
        if (isAlert) {
          px += Math.sin(vt * 0.02 + p.phase) * 2 * p.z;
          py += Math.cos(vt * 0.025 + p.phase) * 2 * p.z;
        }

        const size = (0.6 + p.z * 1.6) * (dpr || 1);
        ctx.fillStyle = rgba(accent, 0.1 + p.z * 0.18);
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
}
