export type AiFortune = {
  message: string;
  item: string;
  color: string;
  number: number;
};

export async function generateAiFortune(): Promise<AiFortune | null> {
  try {
    const res = await fetch("/api/ai-fortune", { method: "POST" });
    if (!res.ok) {
      console.error("AI fortune request failed", await res.text().catch(() => ""));
      return null;
    }
    return (await res.json()) as AiFortune;
  } catch (err) {
    console.error("AI fortune request failed", err);
    return null;
  }
}
