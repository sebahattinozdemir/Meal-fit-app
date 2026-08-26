#!/usr/bin/env node
/**
 * Store yayını öncesi zorunlu yapılandırmayı kontrol eder.
 * Kullanım: npm run store:check
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLACEHOLDER = /REPLACE_WITH_|YOUR_/;

const requiredEnv = [
  { key: 'EXPO_TOKEN', hint: 'expo.dev → Account Settings → Access Tokens' },
  { key: 'EXPO_ACCOUNT', hint: 'Expo kullanıcı adın (owner)' },
  { key: 'EAS_PROJECT_ID', hint: 'eas init sonrası UUID' },
  { key: 'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY', hint: 'RevenueCat → iOS public key (appl_...)' },
  { key: 'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY', hint: 'RevenueCat → Android public key (goog_...)' },
  { key: 'EXPO_PUBLIC_PRIVACY_POLICY_URL', hint: 'Yayınlanmış gizlilik politikası URL' },
  { key: 'EXPO_PUBLIC_TERMS_URL', hint: 'Yayınlanmış kullanım koşulları URL' },
];

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function checkAppConfig() {
  const configPath = path.join(ROOT, 'app.config.js');
  const src = fs.readFileSync(configPath, 'utf8');
  const issues = [];
  if (src.includes('REPLACE_WITH_EXPO_ACCOUNT')) {
    issues.push('app.config.js → EXPO_ACCOUNT veya owner hâlâ placeholder');
  }
  if (src.includes('REPLACE_WITH_EAS_PROJECT_ID') && !process.env.EAS_PROJECT_ID) {
    issues.push('EAS_PROJECT_ID eksik — `npm run eas:init` çalıştır');
  }
  return issues;
}

loadDotEnv();

console.log('\n🛒 Meal Fit — Store yapılandırma kontrolü\n');

const missing = [];
const warnings = [];

for (const { key, hint } of requiredEnv) {
  const value = process.env[key];
  if (!value || PLACEHOLDER.test(value)) {
    missing.push(`  ✗ ${key}\n      → ${hint}`);
  } else {
    console.log(`  ✓ ${key}`);
  }
}

warnings.push(...checkAppConfig());

if (missing.length) {
  console.log('\n❌ Eksik ortam değişkenleri:\n');
  console.log(missing.join('\n'));
  console.log('\n  Çözüm: .env.example dosyasını .env olarak kopyala ve doldur.');
  console.log('         veya Cursor ortam secret\'larına ekle.\n');
  process.exit(1);
}

if (warnings.length) {
  console.log('\n⚠️  Uyarılar:\n');
  warnings.forEach((w) => console.log(`  • ${w}`));
  process.exit(1);
}

console.log('\n✅ Tüm zorunlu alanlar dolu. Build başlatabilirsin:\n');
console.log('   npm run eas:build:preview     # internal test');
console.log('   npm run eas:build:production  # store gönderimi\n');
