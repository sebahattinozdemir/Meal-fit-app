# RevenueCat Kurulum Rehberi — Meal Fit

Bu rehber, RevenueCat dashboard'unda Meal Fit Pro aboneliğini adım adım kurar.

**Hedef:** iOS + Android store ürünlerini `pro` entitlement'a bağlamak.

---

## Adım 1 — Hesap ve proje

1. [app.revenuecat.com](https://app.revenuecat.com) → Sign up / Log in
2. **+ New Project** → Proje adı: `Meal Fit`

---

## Adım 2 — iOS uygulaması

1. Sol menü → **Apps** → **+ New**
2. Platform: **Apple App Store**
3. App name: `Meal Fit iOS`
4. Bundle ID: `com.mealfit.app`
5. App Store Connect Shared Secret (önerilir):
   - App Store Connect → Users and Access → Integrations → Shared Secret
   - RevenueCat iOS app ayarına yapıştır
6. **Public API Key** kopyala (`appl_...`) → `.env`:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxx
   ```

---

## Adım 3 — Android uygulaması

1. **Apps** → **+ New** → **Google Play Store**
2. Package name: `com.mealfit.app`
3. Google Play Service Credentials JSON yükle (Play Console API access)
4. **Public API Key** kopyala (`goog_...`) → `.env`:
   ```
   EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxxxx
   ```

---

## Adım 4 — Entitlement

1. **Product catalog** → **Entitlements** → **+ New**
2. Identifier: `pro` (kodda aynı isim kullanılır)
3. Display name: `Meal Fit Pro`

---

## Adım 5 — Store ürünleri

Önce App Store Connect ve Play Console'da ürünleri oluştur (`docs/STORE_LAUNCH.md`).

| Product ID | Store |
|------------|-------|
| `com.mealfit.app.pro.monthly` | iOS + Android |
| `com.mealfit.app.pro.yearly` | iOS + Android |

RevenueCat **Products** bölümünde her ürünü ekle ve **pro** entitlement'a bağla.

---

## Adım 6 — Offering

1. **Offerings** → `default` offering
2. Paket ekle: monthly → `com.mealfit.app.pro.monthly`
3. Paket ekle: yearly → `com.mealfit.app.pro.yearly`
4. Offering'i **current** yap

---

## Adım 7 — Test

- iOS: Sandbox tester + TestFlight build
- Android: License tester + internal track AAB
- RevenueCat **Customers** tab'ında transaction görünmeli

---

## Adım 8 — EAS secrets

```bash
npm run eas:setup
```

---

## Checklist

- [ ] iOS + Android public key `.env`'de
- [ ] Entitlement `pro`
- [ ] 2 ürün entitlement'a bağlı
- [ ] `default` offering current
- [ ] Sandbox test başarılı
