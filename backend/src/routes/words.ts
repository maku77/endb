import { Hono } from "hono";
import type { Env, CreateWordRequest, UpdateWordRequest } from "../types";
import * as db from "../db";
import { authMiddleware } from "../middleware/auth";

const words = new Hono<{ Bindings: Env }>();

// 単語一覧取得
words.get("/", async (c) => {
  const search = c.req.query("search");
  const category_id = c.req.query("category_id");
  const mastery_level = c.req.query("mastery_level");

  const filters = {
    search: search || undefined,
    category_id: category_id ? parseInt(category_id) : undefined,
    mastery_level: mastery_level ? parseInt(mastery_level) : undefined,
  };

  const wordsList = await db.getAllWords(c.env.DB, filters);
  return c.json(wordsList);
});

// 単語詳細取得
words.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const word = await db.getWordById(c.env.DB, id);

  if (!word) {
    return c.json({ error: "Word not found" }, 404);
  }

  return c.json(word);
});

// 単語登録（認証が必要）
words.post("/", authMiddleware, async (c) => {
  const body = await c.req.json<CreateWordRequest>();

  // 入力値のトリミング
  const trimmedBody: CreateWordRequest = {
    en: body.en?.trim() || "",
    ja: body.ja?.trim() || "",
    example: body.example?.trim(),
    notes: body.notes?.trim(),
    category_id: body.category_id,
    created_at: body.created_at,
  };

  // バリデーション
  if (!trimmedBody.en || !trimmedBody.ja) {
    return c.json({ error: "en and ja fields are required" }, 400);
  }

  const id = await db.createWord(c.env.DB, trimmedBody);
  const word = await db.getWordById(c.env.DB, id);

  return c.json(word, 201);
});

// 単語更新（認証が必要）
words.put("/:id", authMiddleware, async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json<UpdateWordRequest>();

  const word = await db.getWordById(c.env.DB, id);
  if (!word) {
    return c.json({ error: "Word not found" }, 404);
  }

  // 入力値のトリミング
  const trimmedBody: UpdateWordRequest = {};
  if (body.en !== undefined) trimmedBody.en = body.en.trim();
  if (body.ja !== undefined) trimmedBody.ja = body.ja.trim();
  if (body.example !== undefined) trimmedBody.example = body.example.trim();
  if (body.notes !== undefined) trimmedBody.notes = body.notes.trim();
  if (body.category_id !== undefined)
    trimmedBody.category_id = body.category_id;
  if (body.created_at !== undefined) trimmedBody.created_at = body.created_at;

  const success = await db.updateWord(c.env.DB, id, trimmedBody);
  if (!success) {
    return c.json({ error: "Failed to update word" }, 500);
  }

  const updatedWord = await db.getWordById(c.env.DB, id);
  return c.json(updatedWord);
});

// 単語削除（認証が必要）
words.delete("/:id", authMiddleware, async (c) => {
  const id = parseInt(c.req.param("id"));

  const word = await db.getWordById(c.env.DB, id);
  if (!word) {
    return c.json({ error: "Word not found" }, 404);
  }

  const success = await db.deleteWord(c.env.DB, id);
  if (!success) {
    return c.json({ error: "Failed to delete word" }, 500);
  }

  return c.json({ message: "Word deleted successfully" });
});

// 例文生成（AWS Bedrock / Claude API使用）（認証が必要）
words.post("/generate-examples", authMiddleware, async (c) => {
  const body = await c.req.json<{ en: string; ja?: string }>();
  const logs: string[] = []; // デバッグ用ログ配列

  if (!body.en) {
    return c.json({ error: "en field is required" }, 400);
  }

  const token = c.env.AWS_BEARER_TOKEN_BEDROCK;
  if (!token) {
    return c.json({ error: "AWS_BEARER_TOKEN_BEDROCK not configured" }, 500);
  }

  const inferenceProfile = c.env.INFERENCE_PROFILE;
  if (!inferenceProfile) {
    return c.json({ error: "INFERENCE_PROFILE not configured" }, 500);
  }

  logs.push(`Token configured: ${token ? "Yes" : "No"}`);
  logs.push(`Token prefix: ${token.substring(0, 20)}...`);
  logs.push(`Inference profile: ${inferenceProfile}`);

  try {
    const ja = body.ja ? body.ja.trim() : null;
    const ja_prompt = ja ? `(意味: ${ja}) ` : "";
    const prompt = `英単語 "${body.en}" ${ja_prompt}を使った英語の例文を3つ生成してください。\n各例文はシンプルで実用的で自然な表現にし、対応する日本語訳も提供してください。\n各例文は長くても10語程度でお願いします。\n\n出力形式:\n1. [英語例文1]\n   [日本語訳1]\n2. [英語例文2]\n   [日本語訳2]\n3. [英語例文3]\n   [日本語訳3]`;

    console.log(
      "Calling Bedrock API with token:",
      token.substring(0, 20) + "..."
    );
    logs.push("Calling Bedrock API...");

    const requestBody = {
      messages: [
        {
          role: "user",
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: 500,
        temperature: 0.7,
      },
    };

    logs.push(
      `Request body: ${JSON.stringify(requestBody).substring(0, 200)}...`
    );

    // 環境変数からinference profileを取得（ARN形式の場合はURLエンコード）
    const encodedProfile = encodeURIComponent(inferenceProfile);
    const endpoint = `https://bedrock-runtime.us-east-1.amazonaws.com/model/${encodedProfile}/converse`;
    logs.push(`Original profile: ${inferenceProfile}`);
    logs.push(`Encoded profile: ${encodedProfile}`);
    logs.push(`Endpoint: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    logs.push(`Response status: ${response.status}`);
    logs.push(`Response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bedrock API error status:", response.status);
      console.error("Bedrock API error body:", errorText);
      logs.push(`Error text: ${errorText}`);
      return c.json(
        {
          error: "Failed to generate examples",
          details: errorText,
          status: response.status,
          logs,
        },
        response.status
      );
    }

    const data = await response.json();
    console.log("Bedrock API response:", JSON.stringify(data, null, 2));
    logs.push(`Response data keys: ${Object.keys(data).join(", ")}`);

    const generatedText = data.output?.message?.content?.[0]?.text || "";
    logs.push(`Generated text length: ${generatedText.length}`);

    if (!generatedText) {
      console.error("No text generated in response:", data);
      return c.json(
        {
          error: "No text generated",
          details: "Response structure: " + JSON.stringify(data),
          logs,
        },
        500
      );
    }

    // 生成されたテキストから例文を抽出（英文と日本語訳のペア）
    const lines = generatedText.split("\n").map((line: string) => line.trim());
    const examples: Array<{ en: string; ja: string }> = [];

    let currentEn = "";
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 番号付きの行（英文）
      if (line.match(/^\d+\./)) {
        currentEn = line.replace(/^\d+\.\s*/, "").trim();
      }
      // 次の行が番号なしで、前に英文がある場合は日本語訳と判断
      else if (currentEn && line && !line.match(/^\d+\./)) {
        examples.push({
          en: currentEn,
          ja: line,
        });
        currentEn = "";
      }
    }

    logs.push(`Extracted ${examples.length} examples`);

    return c.json({ examples, logs });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("Error generating examples:", errorMessage);
    console.error("Error stack:", errorStack);
    logs.push(`Exception: ${errorMessage}`);
    return c.json(
      {
        error: "Internal server error",
        details: errorMessage,
        stack: errorStack,
        logs,
      },
      500
    );
  }
});

export default words;
