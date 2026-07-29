import FortuneCard from "./components/FortuneCard";

export default function Home() {
  return (
    <div className="rainbow-bg flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          오늘의 운세 🌈
        </h1>
        <p className="text-sm text-zinc-700">
          카드를 눌러 오늘의 운세와 행운의 아이템을 확인해보세요.
        </p>
      </div>
      <FortuneCard />
    </div>
  );
}
