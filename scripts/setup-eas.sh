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
  echo "   https://expo.dev/settings/access-tokens → Create token"
  echo "   Cursor Secrets veya .env → EXPO_TOKEN=..."
  exit 1
fi

if [[ -z "${EXPO_ACCOUNT:-}" ]]; then
  echo "❌ EXPO_ACCOUNT eksik (Expo kullanıcı adın)."
  echo "   Cursor Secrets veya .env → EXPO_ACCOUNT=your-username"
  exit 1
fi

export EXPO_TOKEN

echo "→ Expo oturumu kontrol ediliyor..."
npx eas-cli whoami

echo ""
echo "→ EAS projesi bağlanıyor (eas init)..."
if [[ -n "${EAS_PROJECT_ID:-}" ]]; then
  npx eas-cli init --id "$EAS_PROJECT_ID" --non-interactive --force
else
  npx eas-cli init --non-interactive --force
fi

echo ""
echo "→ Proje bilgisi alınıyor..."
PROJECT_JSON="$(npx eas-cli project:info --json 2>/dev/null || true)"
if [[ -n "$PROJECT_JSON" ]]; then
  PROJECT_ID="$(node -e "const j=JSON.parse(process.argv[1]); console.log(j.id||'');" "$PROJECT_JSON" 2>/dev/null || true)"
  if [[ -n "$PROJECT_ID" ]]; then
    if grep -q '^EAS_PROJECT_ID=' .env 2>/dev/null; then
      sed -i "s/^EAS_PROJECT_ID=.*/EAS_PROJECT_ID=$PROJECT_ID/" .env
    else
      echo "EAS_PROJECT_ID=$PROJECT_ID" >> .env
    fi
    echo "✓ EAS_PROJECT_ID=$PROJECT_ID (.env güncellendi)"
  fi
fi

echo ""
echo "→ EAS secrets (build ortam değişkenleri)..."
upsert_secret() {
  local name="$1"
  local value="$2"
  [[ -z "$value" ]] && return 0
  npx eas-cli env:create --name "$name" --value "$value" --environment production --visibility plaintext --non-interactive 2>/dev/null \
    || npx eas-cli env:update --name "$name" --value "$value" --environment production --visibility plaintext --non-interactive 2>/dev/null \
    || true
}

upsert_secret "EXPO_PUBLIC_PRIVACY_POLICY_URL" "${EXPO_PUBLIC_PRIVACY_POLICY_URL:-}"
upsert_secret "EXPO_PUBLIC_TERMS_URL" "${EXPO_PUBLIC_TERMS_URL:-}"
upsert_secret "EXPO_PUBLIC_REVENUECAT_IOS_API_KEY" "${EXPO_PUBLIC_REVENUECAT_IOS_API_KEY:-}"
upsert_secret "EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY" "${EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY:-}"

echo ""
echo "✅ EAS kurulumu tamamlandı."
echo ""
echo "   Kontrol: npm run store:check"
echo "   Preview:  npm run eas:build:preview"
echo "   Store:    npm run eas:build:production"
