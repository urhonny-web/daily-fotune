"use client";

import { useState } from "react";
import { recordFortune } from "../lib/fortuneHistory";

type Fortune = {
  message: string;
  item: string;
  color: string;
  number: number;
};

const MESSAGES = [
  "오늘은 뜻밖의 좋은 소식이 들려올 거예요.",
  "작은 용기가 큰 행운을 불러오는 하루입니다.",
  "주변 사람과의 대화 속에 힌트가 숨어있어요.",
  "차분히 준비한 일이 드디어 결실을 맺습니다.",
  "새로운 만남이 즐거운 기회로 이어질 거예요.",
  "고민하던 일에 명쾌한 답이 떠오르는 날.",
  "베푼 친절이 배로 돌아오는 하루가 될 거예요.",
  "가벼운 발걸음이 좋은 인연을 데려옵니다.",
  "오늘은 무리하지 말고 여유를 가져보세요.",
  "숨겨진 재능이 빛을 발하는 순간이 옵니다.",
  "돈이 들어올 좋은 징조가 보이는 하루예요.",
  "작은 실수는 있어도 결국 웃게 될 거예요.",
  "미뤄둔 일을 시작하기에 완벽한 타이밍입니다.",
  "가족이나 친구에게 반가운 연락이 올 거예요.",
  "직감을 믿고 움직이면 좋은 결과가 따릅니다.",
];

const ITEMS = [
  "네잎클로버 모양 스티커",
  "따뜻한 아메리카노",
  "노란색 우산",
  "은색 반지",
  "책갈피",
  "동전 지갑",
  "라벤더 향초",
  "손편지",
  "작은 화분",
  "체크무늬 손수건",
  "별 모양 열쇠고리",
  "귀여운 양말",
];

const COLORS = [
  "빨강",
  "주황",
  "노랑",
  "초록",
  "파랑",
  "남색",
  "보라",
  "하양",
  "검정",
  "핑크",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function drawFortune(): Fortune {
  return {
    message: pick(MESSAGES),
    item: pick(ITEMS),
    color: pick(COLORS),
    number: Math.floor(Math.random() * 99) + 1,
  };
}

export default function FortuneCard() {
  const [flipped, setFlipped] = useState(false);
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [spinKey, setSpinKey] = useState(0);

  const handleClick = () => {
    if (!flipped) {
      const next = drawFortune();
      setFortune(next);
      setFlipped(true);
      recordFortune(next);
    } else {
      setFlipped(false);
      window.setTimeout(() => {
        const next = drawFortune();
        setFortune(next);
        setSpinKey((k) => k + 1);
        setFlipped(true);
        recordFortune(next);
      }, 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className="card-perspective h-80 w-56 cursor-pointer select-none sm:h-96 sm:w-64"
        onClick={handleClick}
        role="button"
        aria-label="카드를 눌러 오늘의 운세 보기"
      >
        <div key={spinKey} className={`card-inner ${flipped ? "is-flipped" : ""}`}>
          <div className="card-face card-front">
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl">
              <span className="text-5xl">🔮</span>
              <p className="text-lg font-bold tracking-wide">오늘의 운세</p>
              <p className="text-xs text-white/80">카드를 눌러보세요</p>
            </div>
          </div>
          <div className="card-face card-back">
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300 p-6 text-center text-zinc-800 shadow-xl dark:text-zinc-900">
              {fortune && (
                <>
                  <span className="text-4xl">✨</span>
                  <p className="text-base font-semibold leading-relaxed">
                    {fortune.message}
                  </p>
                  <div className="mt-2 flex flex-col gap-1 text-sm">
                    <p>
                      🍀 행운의 아이템:{" "}
                      <span className="font-bold">{fortune.item}</span>
                    </p>
                    <p>
                      🎨 행운의 색: <span className="font-bold">{fortune.color}</span>
                    </p>
                    <p>
                      🔢 행운의 숫자:{" "}
                      <span className="font-bold">{fortune.number}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleClick}
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {flipped ? "다시 뽑기" : "운세 뽑기"}
      </button>
    </div>
  );
}
