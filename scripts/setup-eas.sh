#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Meal Fit EAS kurulumu"
echo ""

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "✓ .env oluşturuldu (.env.example'dan)"
fi

# shellcheck disable=SC1091
set -a && source .env && set +a

if [[ -z "${EXPO_TOKEN:-}" ]]; then
  echo "❌ EXPO_TOKEN eksik."
  echo "   expo.dev → Account Settings → Access Tokens → Create"
  echo "   Token'ı .env dosyasına EXPO_TOKEN=... olarak ekle."
  exit 1
fi

export EXPO_TOKEN

echo "→ Expo oturumu kontrol ediliyor..."
npx eas-cli whoami

echo ""
echo "→ EAS projesi bağlanıyor (eas init)..."
npx eas-cli init --id "${EAS_PROJECT_ID:-}" --non-interactive 2>/dev/null || npx eas-cli init --non-interactive

echo ""
echo "→ EAS secrets (RevenueCat)..."
if [[ -n "${EXPO_PUBLIC_REVENUECAT_IOS_API_KEY:-}" ]]; then
  npx eas-cli secret:create --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY \
    --value "$EXPO_PUBLIC_REVENUECAT_IOS_API_KEY" --type string --force-non-interactive 2>/dev/null || true
fi
if [[ -n "${EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY:-}" ]]; then
  npx eas-cli secret:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY \
    --value "$EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY" --type string --force-non-interactive 2>/dev/null || true
fi

echo ""
echo "✅ EAS kurulumu tamamlandı."
echo "   Sonraki adım: npm run eas:build:preview"
