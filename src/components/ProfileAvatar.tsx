import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, borderRadius } from '../constants/theme';

interface Props {
  size?: number;
  editable?: boolean;
  light?: boolean;
}

export function ProfileAvatar({ size = 48, editable = false, light = false }: Props) {
  const { user, updateAvatar, removeAvatar } = useAuth();
  const [loading, setLoading] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('')
    : '?';

  const handlePress = async () => {
    if (!editable || !user || loading) return;

    Alert.alert('Profil fotoğrafı', 'Ne yapmak istersin?', [
      { text: 'İptal', style: 'cancel' },
      ...(user.avatarUri
        ? [{ text: 'Fotoğrafı kaldır', style: 'destructive' as const, onPress: () => removeAvatar() }]
        : []),
      {
        text: user.avatarUri ? 'Değiştir' : 'Galeriden seç',
        onPress: async () => {
          setLoading(true);
          try {
            await updateAvatar();
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const content = (
    <View style={[styles.wrap, ringStyle, light && styles.wrapLight]}>
      {loading ? (
        <ActivityIndicator color={light ? '#fff' : colors.primary} />
      ) : user?.avatarUri ? (
        <Image source={{ uri: user.avatarUri }} style={[styles.image, ringStyle]} />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.34 }, light && styles.initialsLight]}>
          {initials}
        </Text>
      )}
      {editable && (
        <View style={[styles.editBadge, { width: size * 0.34, height: size * 0.34, borderRadius: size * 0.17 }]}>
          <Ionicons name="camera" size={size * 0.16} color="#fff" />
        </View>
      )}
    </View>
  );

  if (editable) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} accessibilityLabel="Profil fotoğrafı">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '55',
    overflow: 'hidden',
  },
  wrapLight: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  image: { resizeMode: 'cover' },
  initials: { fontWeight: '800', color: colors.primaryDark },
  initialsLight: { color: '#fff' },
  editBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
