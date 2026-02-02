import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

export default function App() {
  // Получаем имя из URL параметров
  const name = useMemo(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const raw = params.get("name");
    const cleaned = (raw ?? "").trim();
    return cleaned.length > 0 ? cleaned : "Friend";
  }, []);

  // Состояние для отслеживания того, был ли выбран "Да"
  const [saidYes, setSaidYes] = useState(false);

  // Ссылки на элементы DOM
  const arenaRef = useRef<HTMLDivElement | null>(null); // .arena (вся зона для No)
  const noBtnRef = useRef<HTMLButtonElement | null>(null);
  const yesBtnRef = useRef<HTMLButtonElement | null>(null);

  // Текущая позиция кнопки No внутри арены (в px для translate)
  const posRef = useRef({ x: 20, y: 120 });

  // Троттлинг через rAF, чтобы не дёргать DOM слишком часто
  const rafRef = useRef<number | null>(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  // Ограничиваем значение между минимальным и максимальным значениями
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);

  // Получаем границы арены и кнопок
  const getBounds = useCallback(() => {
    const arena = arenaRef.current;
    const noBtn = noBtnRef.current;
    const yesBtn = yesBtnRef.current;
    if (!arena || !noBtn) {
      return null;
    }

    const arenaRect = arena.getBoundingClientRect();
    const arenaW = arena.clientWidth;
    const arenaH = arena.clientHeight;

    const btnW = noBtn.offsetWidth;
    const btnH = noBtn.offsetHeight;

    const padding = 12;

    // Зона вокруг Yes-кнопки, которую нужно избегать
    let yesZone: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    } | null = null;
    if (yesBtn) {
      const yesRect = yesBtn.getBoundingClientRect();
      const safeMargin = 20; // отступ от Yes кнопки
      yesZone = {
        left: yesRect.left - arenaRect.left - safeMargin,
        right: yesRect.right - arenaRect.left + safeMargin,
        top: yesRect.top - arenaRect.top - safeMargin,
        bottom: yesRect.bottom - arenaRect.top + safeMargin,
      };
    }

    const minX = padding;
    const maxX = Math.max(minX, arenaW - btnW - padding);
    const minY = padding;
    const maxY = Math.max(minY, arenaH - btnH - padding);

    return {
      arenaW,
      arenaH,
      btnW,
      btnH,
      padding,
      minX,
      maxX,
      minY,
      maxY,
      yesZone,
    };
  }, []);

  // Применяем новую позицию к кнопке No
  const applyPos = (x: number, y: number) => {
    const noBtn = noBtnRef.current;
    if (!noBtn) {
      return;
    }
    posRef.current = { x, y };
    (noBtn as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
  };

  // Проверяем, пересекается ли позиция с зоной Yes-кнопки
  const isOverlappingYes = useCallback(
    (x: number, y: number, b: ReturnType<typeof getBounds>) => {
      if (!b?.yesZone) return false;
      const { yesZone, btnW, btnH } = b;
      // Проверяем пересечение прямоугольников
      return !(
        x + btnW < yesZone.left ||
        x > yesZone.right ||
        y + btnH < yesZone.top ||
        y > yesZone.bottom
      );
    },
    []
  );

  // Рандомно располагаем кнопку No внутри арены, избегая Yes
  const placeRandom = useCallback(() => {
    const b = getBounds();
    if (!b) {
      return;
    }

    let x: number;
    let y: number;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      x = Math.floor(Math.random() * (b.maxX - b.minX + 1) + b.minX);
      y = Math.floor(Math.random() * (b.maxY - b.minY + 1) + b.minY);
      attempts++;
    } while (isOverlappingYes(x, y, b) && attempts < maxAttempts);

    applyPos(clamp(x, b.minX, b.maxX), clamp(y, b.minY, b.maxY));
  }, [getBounds, isOverlappingYes]);

  // "Умное" убегание: двигаем кнопку от курсора
  const fleeFromPointer = useCallback(
    (pointerX: number, pointerY: number) => {
      const arena = arenaRef.current;
      const b = getBounds();
      if (!arena || !b) {
        return;
      }

      const { x: curX, y: curY } = posRef.current;

      // Центр кнопки No (в координатах арены)
      const btnCenterX = curX + b.btnW / 2;
      const btnCenterY = curY + b.btnH / 2;

      // Вектор от указателя к кнопке
      let dx = btnCenterX - pointerX;
      let dy = btnCenterY - pointerY;

      const dist = Math.hypot(dx, dy);

      // Радиус "опасной зоны": если указатель ближе — убегаем
      const dangerRadius = 120;

      if (dist > dangerRadius) {
        return;
      }

      // Если вдруг точно в центре (dist ~ 0), зададим направление
      if (dist < 0.001) {
        dx = 1;
        dy = 0;
      }

      // Нормализуем направление
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);

      // Шаг убегания: чем ближе курсор — тем сильнее отскок
      const intensity = clamp((dangerRadius - dist) / dangerRadius, 0.2, 1);
      const step = 100 * intensity; // базовый "пинок" в px

      // Небольшой рандом, чтобы не было предсказуемо
      const jitter = 18;
      const jx = (Math.random() * 2 - 1) * jitter;
      const jy = (Math.random() * 2 - 1) * jitter;

      let nextX = curX + nx * step + jx;
      let nextY = curY + ny * step + jy;

      // Зажимаем в пределах арены
      nextX = clamp(nextX, b.minX, b.maxX);
      nextY = clamp(nextY, b.minY, b.maxY);

      // Если попадает на Yes-кнопку — ищем другое место
      if (isOverlappingYes(nextX, nextY, b)) {
        placeRandom();
        return;
      }

      // Если упёрлись в край и почти не сдвинулись — делаем быстрый рандомный репозиционинг
      const moved = Math.hypot(nextX - curX, nextY - curY);
      if (moved < 8) {
        placeRandom();
        return;
      }

      applyPos(nextX, nextY);
    },
    [getBounds, isOverlappingYes, placeRandom]
  );

  // Планируем убегание кнопки No от курсора
  const scheduleFlee = (pointerX: number, pointerY: number) => {
    lastPointerRef.current = { x: pointerX, y: pointerY };
    if (rafRef.current) {
      return;
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null as unknown as number;
      const p = lastPointerRef.current;
      fleeFromPointer(p.x, p.y);
    });
  };

  // Обрабатываем движение курсора внутри арены
  const handleArenaPointerMove = (e: { clientX: number; clientY: number }) => {
    const arena = arenaRef.current;
    if (!arena) {
      return;
    }
    const rect = (arena as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left; // координаты внутри арены
    const y = e.clientY - rect.top;
    scheduleFlee(x, y);
  };

  // Обрабатываем попадание курсора на кнопку No
  const handleNoPointerEnter = (e: { clientX: number; clientY: number }) => {
    // если курсор всё-таки попал по кнопке — сразу сильнее отскакиваем
    const arena = arenaRef.current;
    if (!arena) {
      return;
    }
    const rect = (arena as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // два шага подряд — эффектнее
    fleeFromPointer(x, y);
    setTimeout(() => fleeFromPointer(x, y), 0);
  };

  // Устанавливаем стартовую позицию и слушатели
  useEffect(() => {
    // Стартовая позиция — безопасно внутри арены, избегая Yes
    requestAnimationFrame(() => {
      placeRandom();
    });

    const onResize = () => requestAnimationFrame(() => placeRandom());
    globalThis.addEventListener("resize", onResize);

    return () => {
      globalThis.removeEventListener("resize", onResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [getBounds, placeRandom]);

  return (
    <div className="page">
      <div className="card">
        <div className="badge">💘 Valentine mini-app</div>

        <h1 className="title">{name}, will you be my valentine?</h1>

        <p className="subtitle">
          I realise that it's a really difficult choice 🙈
        </p>

        <div
          className="arena"
          ref={arenaRef}
          onPointerMove={handleArenaPointerMove}
        >
          <div className="actions">
            <button
              className="btn btnYes"
              ref={yesBtnRef}
              onClick={() => setSaidYes(true)}
              type="button"
            >
              Yes
            </button>
          </div>

          <div className={`result ${saidYes ? "show" : ""}`} aria-live="polite">
            <div className="resultInner">
              <h2 className="resultTitle">Yay! 💖</h2>
              <p className="resultText">Best decision of the day.</p>

              <img
                className="gif"
                src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
                alt="Cute celebration"
                loading="lazy"
              />
            </div>
          </div>

          {/* No-кнопка в арене — прыгает по всей области */}
          {!saidYes && (
            <button
              className="btn btnNo"
              ref={noBtnRef}
              type="button"
              onPointerEnter={handleNoPointerEnter}
              onPointerDown={handleNoPointerEnter}
              onFocus={() => placeRandom()}
              aria-label="No (good luck!)"
            >
              No
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
