# MealFit - Spor & Yemek Planlama Uygulaması

Haftada 3 gün spora giden biri için tasarlanmış React Native (Expo) mobil uygulama. Spor günleri ve dinlenme günleri için farklı yemek planları, otomatik alışveriş listesi ve haftalık program yönetimi sunar.

## Özellikler

- **Ana Sayfa**: Bugünün yemek planı, günlük kalori/protein hedefleri, haftalık spor günü özeti
- **Yemek Planı**: Gün bazında spor/dinlenme menüleri, makro besin değerleri, malzeme detayları
- **Spor Günleri**: Haftalık 3-5 gün arası spor günü seçimi (varsayılan: Pazartesi, Çarşamba, Cuma)
- **Alışveriş Listesi**: Yemek planına göre otomatik oluşturulan, kategorize edilmiş haftalık alışveriş listesi
- **Kalıcı Depolama**: AsyncStorage ile tercihlerin kaydedilmesi

## Kurulum

```bash
cd meal-fit-app
npm install
npm start
```

Expo Go uygulaması ile QR kodu tarayarak telefonunuzda test edebilirsiniz.

## Teknolojiler

- React Native + Expo (TypeScript)
- React Navigation (Bottom Tabs)
- AsyncStorage
- Expo Linear Gradient & Vector Icons

## Proje Yapısı

```
src/
├── components/     # UI bileşenleri (MealCard, StatCard, DayChip)
├── constants/      # Tema renkleri ve spacing
├── context/        # Global state (AppContext)
├── data/           # Örnek yemek planları
├── navigation/     # Tab navigasyonu
├── screens/        # Ekranlar
└── types/          # TypeScript tipleri
```

## Spor vs Dinlenme Günü Beslenmesi

| | Spor Günü | Dinlenme Günü |
|---|---|---|
| Kalori | ~1730 kcal | ~1390 kcal |
| Protein | Yüksek (113g) | Orta (82g) |
| Odak | Antrenman öncesi/sonrası beslenme | Dengeli, hafif öğünler |

## Lisans

MIT
