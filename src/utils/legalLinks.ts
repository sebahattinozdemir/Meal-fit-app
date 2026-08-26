import { Alert, Linking } from 'react-native';
import { LEGAL_URLS } from '../constants/store';

export async function openLegalUrl(url: string, label: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(label, `Bağlantı açılamadı:\n${url}`);
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Hata', `${label} açılamadı.`);
  }
}

export function openPrivacyPolicy(): Promise<void> {
  return openLegalUrl(LEGAL_URLS.privacy, 'Gizlilik politikası');
}

export function openTermsOfUse(): Promise<void> {
  return openLegalUrl(LEGAL_URLS.terms, 'Kullanım koşulları');
}
