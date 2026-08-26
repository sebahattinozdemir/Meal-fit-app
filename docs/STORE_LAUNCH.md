# Meal Fit — App Store & Google Play Yayın Rehberi

Bu rehber, Meal Fit uygulamasını App Store ve Google Play'e göndermek için gereken adımları listeler.

## Ön koşullar

- [ ] Apple Developer Program üyeliği ($99/yıl)
- [ ] Google Play Console hesabı ($25 tek seferlik)
- [ ] [RevenueCat](https://www.revenuecat.com) hesabı (IAP yönetimi)
- [ ] Expo hesabı + [EAS CLI](https://docs.expo.dev/build/setup/)

```bash
npm install -g eas-cli
eas login
cd meal-fit-app
eas init   # app.json → extra.eas.projectId güncellenir
```

---

## 1. Ortam değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın ve doldurun:

```bash
cp .env.example .env
```

| Değişken | Açıklama |
|----------|----------|
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | RevenueCat iOS public key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | RevenueCat Android public key |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | Yayınlanmış gizlilik politikası URL'si |
| `EXPO_PUBLIC_TERMS_URL` | Kullanım koşulları URL'si |

EAS build için secret'ları ekleyin:

```bash
eas secret:create --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value appl_xxx --type string
eas secret:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value goog_xxx --type string
```

---

## 2. Uygulama kimlikleri

| Platform | Alan | Değer |
|----------|------|-------|
| iOS | Bundle ID | `com.mealfit.app` |
| Android | Package | `com.mealfit.app` |
| Scheme | Deep link | `mealfit://` |

Farklı bir bundle ID kullanacaksanız `app.config.js` ve `src/constants/store.ts` dosyalarını güncelleyin.

### Hızlı komutlar

```bash
npm run store:setup-env   # .env oluştur
# .env dosyasını doldur
npm run eas:setup         # EAS init + secrets
npm run store:check       # eksik alan kontrolü
npm run eas:build:preview # internal test build
```

RevenueCat adımları: `docs/REVENUECAT_SETUP.md`

---

## 3. Abonelik ürünleri (IAP)

### App Store Connect

1. Uygulamayı oluşturun → **Subscriptions** grubu ekleyin (ör. `pro`).
2. Aşağıdaki ürünleri oluşturun:

| Product ID | Tip | Önerilen fiyat |
|------------|-----|----------------|
| `com.mealfit.app.pro.monthly` | Auto-renewable monthly | ₺99/ay |
| `com.mealfit.app.pro.yearly` | Auto-renewable yearly | ₺799/yıl |

3. **7 günlük ücretsiz deneme** (intro offer) isteğe bağlı ekleyin.
4. Abonelik açıklamasında Pro özelliklerini listeleyin.

### Google Play Console

1. **Monetize → Subscriptions** altında aynı product ID'leri oluşturun.
2. Base plan + isteğe bağlı free trial tanımlayın.

### RevenueCat

1. Yeni proje → iOS + Android uygulamalarını bağlayın.
2. **Entitlements:** `pro` oluşturun.
3. Her iki store ürününü `pro` entitlement'a bağlayın.
4. **Offerings → default** offering'e monthly + yearly paketlerini ekleyin.
5. Public API key'leri `.env` / EAS secrets'a yapıştırın.

---

## 4. Gizlilik & yasal

1. `docs/PRIVACY_POLICY.md` dosyasını web'de yayınlayın.
2. `docs/TERMS_OF_USE.md` dosyasını web'de yayınlayın.
3. App Store Connect → **App Privacy** anketi:
   - Veri toplama: **Evet** (cihazda; sağlık/fitness kategorisi)
   - Veri sunucuya gönderilmiyor (backend yok)
   - Satın alma: Apple/RevenueCat üzerinden
4. Play Console → **Data safety**: aynı bilgileri işaretleyin.

Uygulama içinde **Ana sayfa → Yasal & destek** kartından linkler açılır.

---

## 5. Ekran görüntüleri & mağaza metinleri

### Gerekli boyutlar

| Platform | Boyut |
|----------|-------|
| iPhone 6.7" | 1290 × 2796 |
| iPhone 6.5" | 1242 × 2688 |
| Android phone | 1080 × 1920 minimum |

### Önerilen ekranlar

1. Ana sayfa — günlük plan + kişisel öneri
2. Yemek planı — makro uyumu
3. Antrenman programları — Pro kilidi
4. Gelişim grafikleri
5. Pro paywall

### Kısa açıklama (TR)

> Antrenman günlerine göre kişisel yemek planı, alışveriş listesi ve spor programları. Pro ile tüm programlar, tarifler ve akıllı hatırlatmalar.

### Anahtar kelimeler (iOS)

`fitness, beslenme, yemek planı, antrenman, spor, kilo, protein, alışveriş listesi`

---

## 6. Build & test

### Geliştirme (mock IAP)

```bash
npm start
# Expo Go — satın alma simüle edilir
```

### Preview build (internal test)

```bash
eas build --profile preview --platform all
```

### Production build

```bash
eas build --profile production --platform all
```

### TestFlight (iOS)

```bash
eas submit --platform ios --profile production
```

Sandbox Apple ID ile gerçek IAP test edin (RevenueCat dashboard'da transaction görünmeli).

### Google Play internal testing

1. Production AAB'yi internal track'e yükleyin.
2. License tester hesapları ekleyin.
3. Abonelik test kartlarıyla satın almayı doğrulayın.

---

## 7. Store inceleme notları

Apple/Google'a gönderirken **Review Notes** alanına:

```
Meal Fit is offline-first. No backend login required for core features.
Test account: create any local account on Login screen (email + password stored on device only).

Pro subscription unlocks all workout programs, extra recipes, smart reminders, and advanced charts.
Use Sandbox tester for IAP on iOS / license tester on Android.

Privacy policy: [YOUR_PRIVACY_URL]
Support: support@mealfit.app
```

---

## 8. Gönderim öncesi kontrol listesi

- [ ] `app.json` → `extra.eas.projectId` ve `owner` güncellendi
- [ ] RevenueCat offering + entitlement yapılandırıldı
- [ ] Store'da monthly + yearly ürünler oluşturuldu
- [ ] Gizlilik politikası URL'si canlı
- [ ] Paywall'da otomatik yenileme metni görünüyor
- [ ] "Satın alımı geri yükle" çalışıyor
- [ ] Bildirim izni metni Türkçe
- [ ] Uygulama ikonu + splash hazır
- [ ] TestFlight / internal test tamamlandı
- [ ] `eas submit` veya manuel yükleme yapıldı

---

## 9. Sık karşılaşılan red sebepleri

| Sebep | Çözüm |
|-------|-------|
| Gizlilik politikası URL'si 404 | URL'yi yayınlayın, App Store Connect'e ekleyin |
| IAP restore yok | Paywall'da "Satın alımı geri yükle" mevcut |
| Abonelik şartları eksik | Paywall alt metni + Terms linki |
| Demo hesap yok | Review notes'a yerel hesap açıklaması ekleyin |
| Health data without purpose | App Privacy'de fitness amacını belirtin |

---

## 10. Yayın sonrası

- RevenueCat → **Charts** ile dönüşüm takibi
- Crash: EAS + isteğe bağlı Sentry
- Kullanıcı geri bildirimi: support@mealfit.app
- Fiyat A/B: RevenueCat Experiments
