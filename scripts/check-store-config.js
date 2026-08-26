#!/usr/bin/env node
/**
 * Store yayını öncesi zorunlu yapılandırmayı kontrol eder.
 * Kullanım: npm run store:check
 * Canlı URL testi: npm run store:check -- --online
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const PLACEHOLDER = /REPLACE_WITH_|YOUR_/;
const ONLINE = process.argv.includes('--online');

const requiredEnv = [
  { key: 'EXPO_TOKEN', hint: 'expo.dev → Account Settings → Access Tokens' },
  { key: 'EXPO_ACCOUNT', hint: 'Expo kullanıcı adın (owner)' },
  { key: 'EAS_PROJECT_ID', hint: 'eas init sonrası UUID' },
  { key: 'EXPO_PUBLIC_REVENUECAT_IOS_API_KEY', hint: 'RevenueCat → iOS public key (appl_...)' },
  { key: 'EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY', hint: 'RevenueCat → Android public key (goog_...)' },
  { key: 'EXPO_PUBLIC_PRIVACY_POLICY_URL', hint: 'GitHub Pages veya kendi alan adın' },
  { key: 'EXPO_PUBLIC_TERMS_URL', hint: 'GitHub Pages veya kendi alan adın' },
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

function checkLegalHtmlFiles() {
  const issues = [];
  for (const file of ['privacy.html', 'terms.html', 'index.html']) {
    const p = path.join(ROOT, 'docs', file);
    if (!fs.existsSync(p)) {
      issues.push(`docs/${file} eksik — GitHub Pages için gerekli`);
    }
  }
  return issues;
}

function fetchStatus(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    });
    req.on('error', () => resolve(0));
    req.on('timeout', () => {
      req.destroy();
      resolve(0);
    });
  });
}

async function checkLiveUrls() {
  const warnings = [];
  const privacy = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
  const terms = process.env.EXPO_PUBLIC_TERMS_URL;

  if (!privacy || !terms) return warnings;

  for (const [label, url] of [
    ['Gizlilik', privacy],
    ['Koşullar', terms],
  ]) {
    const code = await fetchStatus(url);
    if (code >= 200 && code < 400) {
      console.log(`  ✓ ${label} URL canlı (${code}): ${url}`);
    } else {
      warnings.push(
        `${label} URL erişilemiyor (${code || 'timeout'}): ${url}\n      → GitHub: Settings → Pages → main /docs → Save`
      );
    }
  }
  return warnings;
}

loadDotEnv();

(async () => {
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
warnings.push(...checkLegalHtmlFiles());

if (missing.length) {
  console.log('\n❌ Eksik ortam değişkenleri:\n');
  console.log(missing.join('\n'));
  console.log('\n  Çözüm: npm run store:setup-env');
  console.log('         .env dosyasını doldur veya Cursor secret\'larına ekle.\n');
  process.exit(1);
}

if (ONLINE) {
  console.log('\n🌐 Canlı URL kontrolü...\n');
  warnings.push(...(await checkLiveUrls()));
} else {
  console.log('\n  ℹ️  Canlı URL testi için: npm run store:check -- --online\n');
}

if (warnings.length) {
  console.log('\n⚠️  Uyarılar:\n');
  warnings.forEach((w) => console.log(`  • ${w}`));
  process.exit(1);
}

console.log('\n✅ Tüm zorunlu alanlar dolu. Build başlatabilirsin:\n');
console.log('   npm run eas:build:preview     # internal test');
console.log('   npm run eas:build:production  # store gönderimi\n');
})();
