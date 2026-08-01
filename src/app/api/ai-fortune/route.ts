import "server-only";
import { NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";
const REQUEST_TIMEOUT_MS = 15000;

type AiFortune = {
  message: string;
  item: string;
  color: string;
  number: number;
};

function isValidFortune(value: unknown): value is AiFortune {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.message === "string" &&
    v.message.trim().length > 0 &&
    typeof v.item === "string" &&
    v.item.trim().length > 0 &&
    typeof v.color === "string" &&
    v.color.trim().length > 0 &&
    typeof v.number === "number" &&
    Number.isInteger(v.number) &&
    v.number >= 1 &&
    v.number <= 99
  );
}

export async function POST() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        temperature: 1,
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              '당신은 "오늘의 운세" 카드 문구를 쓰는, 위트 있고 짓궂은 작가입니다. ' +
              '"오늘은 좋은 일이 생길 거예요", "긍정적인 마음으로", "뜻밖의 행운" 같은 뻔한 덕담과 상투어는 절대 쓰지 마세요. ' +
              "대신 구체적이고 엉뚱한 상황, 예상 못한 반전, 가벼운 자조나 풍자가 섞인 유머로 웃음을 주는 문장을 쓰세요. " +
              "운세는 여전히 재미있고 애정 어린 톤이어야 하며, 매번 완전히 다른 소재를 다루세요. " +
              "행운의 아이템도 뻔한 사물(네잎클로버, 반지 등) 대신 구체적이고 의외인 것으로 고르세요. " +
              "아래 JSON 형식으로만 응답하고, 그 외의 텍스트는 절대 포함하지 마세요.\n" +
              '{"message": "위트있고 구체적인 2문장 이내의 운세 메시지", "item": "행운의 아이템 (5단어 이내, 의외성 있는 명사구)", "color": "행운의 색 (한국어 색상 이름 한 단어)", "number": 1에서 99 사이의 정수}',
          },
          {
            role: "user",
            content: "오늘의 운세를 새로 만들어줘. 뻔한 덕담 말고 위트있게.",
          },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `OpenRouter request failed (${res.status}): ${detail}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON" },
        { status: 502 },
      );
    }

    if (!isValidFortune(parsed)) {
      return NextResponse.json(
        { error: "Model response missing required fields" },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
