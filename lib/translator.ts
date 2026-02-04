// MyMemory API를 사용한 무료 번역
type Language = "ko" | "en" | "ja" | "zh";

const CACHE_KEY = "translation-cache";

interface TranslationCache {
  [key: string]: string;
}

// 캐시 로드
const getCache = (): TranslationCache => {
  if (typeof window === "undefined") return {};
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

// 캐시 저장
const saveCache = (cache: TranslationCache) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    console.warn("Failed to save translation cache");
  }
};

// MyMemory API 호출
export async function translateText(
  text: string,
  targetLang: Language
): Promise<string> {
  // 한국어면 원문 반환
  if (targetLang === "ko") {
    return text;
  }

  // 캐시 확인
  const cacheKey = `${text}|${targetLang}`;
  const cache = getCache();
  if (cache[cacheKey]) {
    console.log("[Translator] Using cached translation:", cacheKey);
    return cache[cacheKey];
  }

  // 언어 코드 맵핑
  const langMap: Record<Language, string> = {
    ko: "ko",
    en: "en",
    ja: "ja",
    zh: "zh-CN",
  };

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=ko|${langMap[targetLang]}`
    );
    const data = await response.json();

    if (data.responseStatus === 200) {
      const translated = data.responseData.translatedText;
      console.log(`[Translator] Translated to ${targetLang}:`, translated);

      // 캐시에 저장
      cache[cacheKey] = translated;
      saveCache(cache);

      return translated;
    } else {
      console.warn(
        `[Translator] Translation failed: ${data.responseStatus}`,
        text
      );
      return text; // 실패 시 원문 반환
    }
  } catch (error) {
    console.error("[Translator] API call failed:", error);
    return text; // 에러 시 원문 반환
  }
}

// 여러 텍스트 일괄 번역
export async function translateBatch(
  texts: string[],
  targetLang: Language
): Promise<string[]> {
  if (targetLang === "ko") {
    return texts;
  }

  return Promise.all(texts.map((text) => translateText(text, targetLang)));
}
