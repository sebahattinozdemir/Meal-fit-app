# Meal Fit — App Store & Google Play Yayın Rehberi

Bu rehber, **yeni özellik eklemeden** uygulamayı mağazaya göndermek için gereken adımları listeler.

## Hızlı özet — senin yapman gerekenler

| # | Adım | Nerede |
|---|------|--------|
| 1 | GitHub Pages aç | Repo → Settings → Pages → Branch: `main`, Folder: `/docs` |
| 2 | `.env` doldur | `npm run store:setup-env` → RevenueCat + Expo token |
| 3 | EAS bağla | `npm run eas:setup` |
| 4 | Kontrol | `npm run store:check` → sonra `npm run store:check -- --online` |
| 5 | Store ürünleri | App Store Connect + Play Console + RevenueCat |
| 6 | Preview build | `npm run eas:build:preview` → TestFlight / internal test |
| 7 | IAP test | Sandbox Apple ID ile gerçek satın alma |
| 8 | Production build | `npm run eas:build:production` |
| 9 | Gönder | App Store Connect + Play Console yükleme |

Yasal sayfalar repoda hazır: `docs/privacy.html`, `docs/terms.html`  
Varsayılan URL: `https://sebahattinozdemir.github.io/Meal-fit-app/privacy.html`

---

## 0. GitHub Pages (gizlilik & koşullar)

1. GitHub repo: `sebahattinozdemir/Meal-fit-app`
2. **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / Folder: **/docs**
5. Save — birkaç dakika sonra URL'ler canlı olur
6. Doğrula: `npm run store:check -- --online` (`.env` dolu olmalı)

Kendi alan adın varsa `EXPO_PUBLIC_PRIVACY_POLICY_URL` ve `EXPO_PUBLIC_TERMS_URL` güncelle.

---

## 1. Ortam değişkenleri

```bash
npm run store:setup-env
# .env dosyasını düzenle
```

| Değişken | Açıklama |
|----------|----------|
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | RevenueCat iOS public key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | RevenueCat Android public key |
| `EXPO_TOKEN` | expo.dev access token |
| `EXPO_ACCOUNT` | Expo kullanıcı adın |
| `EAS_PROJECT_ID` | `eas init` sonrası UUID |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | Canlı gizlilik URL |
| `EXPO_PUBLIC_TERMS_URL` | Canlı koşullar URL |

EAS secrets: `npm run eas:setup` (RevenueCat anahtarlarını otomatik ekler)

---

## 2. Uygulama kimlikleri

| Platform | Alan | Değer |
|----------|------|-------|
| iOS | Bundle ID | `com.mealfit.app` |
| Android | Package | `com.mealfit.app` |
| Scheme | Deep link | `mealfit://` |

---

## 3. Abonelik ürünleri (IAP)

### App Store Connect

1. Uygulamayı oluştur → **Subscriptions** grubu (ör. `pro`)
2. Ürünler:

| Product ID | Tip | Önerilen fiyat |
|------------|-----|----------------|
| `com.mealfit.app.pro.monthly` | Auto-renewable monthly | ₺99/ay |
| `com.mealfit.app.pro.yearly` | Auto-renewable yearly | ₺799/yıl |

3. İsteğe bağlı **7 günlük ücretsiz deneme** (intro offer)

### Google Play Console

Aynı product ID'ler → **Monetize → Subscriptions**

### RevenueCat

Detay: `docs/REVENUECAT_SETUP.md` — entitlement `pro`, offering `default`

---

## 4. Gizlilik & yasal (uygulama içi)

- Paywall'da otomatik yenileme metni + koşullar/gizlilik linkleri ✓
- Profil → **Yasal & destek** kartı ✓
- App Store Connect → **App Privacy**: fitness verisi cihazda, sunucuya gönderilmez
- Play Console → **Data safety**: aynı bilgiler

---

## 5. Ekran görüntüleri & mağaza metinleri

| Platform | Boyut |
|----------|-------|
| iPhone 6.7" | 1290 × 2796 |
| Android phone | 1080 × 1920 min |

**Kısa açıklama (TR):**  
Antrenman günlerine göre kişisel yemek planı, alışveriş listesi ve spor programları. Pro ile tüm programlar, tarifler ve akıllı hatırlatmalar.

---

## 6. Build & test

```bash
npm run store:check          # env kontrolü
npm run eas:build:preview    # internal test (APK + iOS)
npm run eas:build:production # store build (AAB + iOS)
```

**TestFlight:** Sandbox Apple ID ile gerçek IAP — RevenueCat dashboard'da transaction görünmeli.

Submit yapılandırması: `eas.submit.example.json` → `eas.json` içine `submit` bloğu ekle.

---

## 7. Store inceleme notları

```
Meal Fit is offline-first. No backend login required for core features.
Test account: create any local account on Login screen (email + password stored on device only).

Pro subscription unlocks all workout programs, extra recipes, smart reminders, and advanced charts.
Use Sandbox tester for IAP on iOS / license tester on Android.

Privacy policy: https://sebahattinozdemir.github.io/Meal-fit-app/privacy.html
Support: support@mealfit.app
```

---

## 8. Gönderim öncesi kontrol listesi

- [ ] GitHub Pages canlı (privacy + terms URL 200 döner)
- [ ] `.env` + `npm run store:check` yeşil
- [ ] RevenueCat offering + entitlement yapılandırıldı
- [ ] Store'da monthly + yearly ürünler oluşturuldu
- [ ] Paywall yasal metinleri görünüyor
- [ ] "Satın alımı geri yükle" çalışıyor (TestFlight)
- [ ] Ekran görüntüleri + mağaza açıklaması hazır
- [ ] TestFlight / internal test tamamlandı
- [ ] Production build yüklendi

---

## 9. Sık red sebepleri

| Sebep | Çözüm |
|-------|-------|
| Gizlilik URL 404 | GitHub Pages aç veya URL güncelle |
| IAP restore yok | Paywall'da "Satın alımı geri yükle" mevcut |
| Abonelik şartları eksik | Paywall alt metni + Terms linki |
| Demo hesap yok | Review notes'a yerel hesap açıklaması |

---

## 10. Sonraki faz (şimdi değil)

Spor salonları / PT özelleştirmesi (salon markası, PT program atama, üye yönetimi) ayrı bir ürün fazıdır — mağaza yayınından sonra değerlendirilebilir.
