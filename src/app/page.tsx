import AuthPanel from "./components/AuthPanel";
import FortuneCard from "./components/FortuneCard";
import FortuneHistory from "./components/FortuneHistory";

export default function Home() {
  return (
    <div className="app-bg relative flex flex-1 flex-col items-center px-6 py-10 sm:py-14">
      <div className="relative z-10 flex w-full max-w-2xl justify-end">
        <AuthPanel />
      </div>

      <div className="relative z-10 mt-4 flex flex-col items-center gap-3 text-center sm:mt-8">
        <p className="eyebrow text-xs font-medium uppercase">Daily Fortune</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">
          오늘의 운세
        </h1>
        <div className="gold-divider" />
        <p className="max-w-xs text-sm text-[var(--muted)]">
          카드를 눌러 오늘의 운세와 행운의 아이템을 확인해보세요.
        </p>
      </div>

      <div className="relative z-10 mt-10">
        <FortuneCard />
      </div>

      <div className="relative z-10 mt-16 w-full max-w-2xl">
        <FortuneHistory />
      </div>
    </div>
  );
}
