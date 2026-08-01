"use client";

import { useState } from "react";
import { generateAiFortune } from "../lib/aiFortune";
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
  const [isLoading, setIsLoading] = useState(false);

  const drawNewFortune = async () => {
    setIsLoading(true);
    const next = (await generateAiFortune()) ?? drawFortune();
    setFortune(next);
    setIsLoading(false);
    recordFortune(next);
  };

  const handleClick = () => {
    if (isLoading) return;
    if (!flipped) {
      setFlipped(true);
      drawNewFortune();
    } else {
      setFlipped(false);
      window.setTimeout(() => {
        setSpinKey((k) => k + 1);
        setFlipped(true);
        drawNewFortune();
      }, 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className="card-perspective h-[22rem] w-64 cursor-pointer select-none sm:h-[26rem] sm:w-72"
        onClick={handleClick}
        role="button"
        aria-label="카드를 눌러 오늘의 운세 보기"
      >
        <div key={spinKey} className={`card-inner ${flipped ? "is-flipped" : ""}`}>
          <div className="card-face card-front">
            <div className="card-shell card-front-bg flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <span className="floating-orb text-6xl drop-shadow-[0_0_18px_rgba(232,200,116,0.55)]">
                🔮
              </span>
              <div className="flex flex-col items-center gap-2">
                <p className="font-[family-name:var(--font-display)] text-xl font-bold tracking-wide text-[var(--ink)]">
                  오늘의 운세
                </p>
                <div className="gold-divider" />
                <p className="text-xs text-[var(--muted)]">카드를 눌러보세요</p>
              </div>
            </div>
          </div>
          <div className="card-face card-back">
            <div className="card-shell card-back-bg flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              {isLoading && (
                <>
                  <span className="spin-slow text-4xl">✨</span>
                  <p className="text-sm text-[var(--muted)]">
                    AI가 오늘의 운세를 만들고 있어요...
                  </p>
                </>
              )}
              {!isLoading && fortune && (
                <>
                  <span className="text-3xl">✨</span>
                  <p className="font-[family-name:var(--font-display)] text-base leading-relaxed text-[var(--ink)]">
                    {fortune.message}
                  </p>
                  <div className="gold-divider" />
                  <div className="flex w-full items-stretch justify-center gap-3 text-xs">
                    <div className="flex flex-1 flex-col items-center gap-1 border-r border-[var(--gold-soft)] pr-3">
                      <span className="text-[var(--muted)]">아이템</span>
                      <span className="gold-text font-semibold">{fortune.item}</span>
                    </div>
                    <div className="flex flex-1 flex-col items-center gap-1 border-r border-[var(--gold-soft)] px-3">
                      <span className="text-[var(--muted)]">색</span>
                      <span className="gold-text font-semibold">{fortune.color}</span>
                    </div>
                    <div className="flex flex-1 flex-col items-center gap-1 pl-3">
                      <span className="text-[var(--muted)]">숫자</span>
                      <span className="gold-text font-semibold">{fortune.number}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleClick}
        className="rounded-full bg-gradient-to-r from-[#e8c874] to-[#c9932f] px-8 py-3 text-sm font-semibold text-[#1c1236] shadow-[0_10px_30px_-10px_rgba(232,200,116,0.6)] transition-transform hover:scale-105"
      >
        {flipped ? "다시 뽑기" : "운세 뽑기"}
      </button>
    </div>
  );
}
