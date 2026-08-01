import AuthPanel from "./components/AuthPanel";
import FortuneCard from "./components/FortuneCard";
import FortuneHistory from "./components/FortuneHistory";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center gap-10 bg-gradient-to-b from-zinc-50 to-zinc-100 px-6 py-16 dark:from-black dark:to-zinc-900">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          오늘의 운세 🔮
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          카드를 눌러 오늘의 운세와 행운의 아이템을 확인해보세요.
        </p>
      </div>
      <AuthPanel />
      <FortuneCard />
      <FortuneHistory />
    </div>
  );
}
