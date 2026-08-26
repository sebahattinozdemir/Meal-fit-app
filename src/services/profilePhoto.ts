import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

const AVATAR_DIR = `${FileSystem.documentDirectory}avatars/`;

async function ensureAvatarDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(AVATAR_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(AVATAR_DIR, { intermediates: true });
  }
}

export async function requestPhotoPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('İzin gerekli', 'Profil fotoğrafı için galeri erişimine izin ver.');
    return false;
  }
  return true;
}

export async function pickProfilePhoto(userId: string): Promise<string | null> {
  const ok = await requestPhotoPermissions();
  if (!ok) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]?.uri) return null;

  await ensureAvatarDir();
  const ext = result.assets[0].uri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = `${AVATAR_DIR}${userId}.${ext}`;

  if (Platform.OS === 'web') {
    return result.assets[0].uri;
  }

  await FileSystem.copyAsync({ from: result.assets[0].uri, to: dest });
  return dest;
}

export async function deleteStoredPhoto(uri: string | null | undefined): Promise<void> {
  if (!uri || Platform.OS === 'web') return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // ignore cleanup errors
  }
}
