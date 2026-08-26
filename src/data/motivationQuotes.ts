const MOTIVATION_QUOTES: string[] = [
  'Bugünkü antrenman, yarınki gücün temeli.',
  'Küçük adımlar büyük değişimleri getirir.',
  'Disiplin, motivasyon bittiğinde devreye girer.',
  'Her tekrar seni hedefe bir adım daha yaklaştırır.',
  'Vücudun yapabileceklerinin sınırını zorla.',
  'Dünkü sen, bugünkü senin gurur duyacağı kişi.',
  'Başlamak için mükemmel anı bekleme — şimdi başla.',
  'Güçlü olmak sadece kas değil, kararlılıktır.',
  'Beslenmen antrenman kadar önemli — ikisine de odaklan.',
  'Tutarlılık, yoğunluktan daha değerlidir.',
];

export const MOTIVATION_QUOTE_COUNT = MOTIVATION_QUOTES.length;

function hashKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getMotivationQuoteIndex(seed: number): number {
  return seed % MOTIVATION_QUOTE_COUNT;
}

export function getHourlyMotivationQuoteIndex(
  userId: string,
  dateKey: string,
  hour: number
): number {
  return getMotivationQuoteIndex(hashKey(`${userId}|${dateKey}|${hour}`));
}

export function getHourlyMotivationQuote(userId: string, dateKey: string, hour: number): string {
  return MOTIVATION_QUOTES[getHourlyMotivationQuoteIndex(userId, dateKey, hour)];
}

export function getDailyMotivationQuote(userId: string, dateKey: string): string {
  return getHourlyMotivationQuote(userId, dateKey, 12);
}

export { MOTIVATION_QUOTES };
