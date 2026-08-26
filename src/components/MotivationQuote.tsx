import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getHourlyMotivationQuote,
  getHourlyMotivationQuoteIndex,
  MOTIVATION_QUOTE_COUNT,
} from '../data/motivationQuotes';
import { toDateKey } from '../utils/date';
import { spacing, borderRadius, colors } from '../constants/theme';

function msUntilNextHour(from: Date = new Date()): number {
  const next = new Date(from);
  next.setHours(from.getHours() + 1, 0, 0, 0);
  return Math.max(0, next.getTime() - from.getTime());
}

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min <= 0) return `${sec} sn`;
  return `${min} dk ${sec.toString().padStart(2, '0')} sn`;
}

interface Props {
  userId: string;
  lightBackground?: boolean;
}

export function MotivationQuote({ userId, lightBackground = false }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const ms = msUntilNextHour();
      timeoutId = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, ms + 50);
    };

    const tickId = setInterval(() => setNow(new Date()), 1000);
    schedule();

    return () => {
      clearInterval(tickId);
      clearTimeout(timeoutId);
    };
  }, []);

  const dateKey = toDateKey(now);
  const hour = now.getHours();
  const quoteIndex = useMemo(
    () => getHourlyMotivationQuoteIndex(userId, dateKey, hour),
    [userId, dateKey, hour]
  );
  const quote = useMemo(
    () => getHourlyMotivationQuote(userId, dateKey, hour),
    [userId, dateKey, hour]
  );

  const countdown = formatCountdown(msUntilNextHour(now));
  const hourLabel = `${hour.toString().padStart(2, '0')}:00 – ${((hour + 1) % 24).toString().padStart(2, '0')}:00`;

  return (
    <View style={[styles.box, lightBackground && styles.boxSurface]}>
      <View style={styles.topRow}>
        <Ionicons name="flash" size={16} color={lightBackground ? colors.secondary : 'rgba(255,255,255,0.9)'} />
        <Text style={[styles.label, lightBackground && styles.labelSurface]}>Saatlik motivasyon</Text>
        <Text style={[styles.counter, lightBackground && styles.counterSurface]}>
          {quoteIndex + 1}/{MOTIVATION_QUOTE_COUNT}
        </Text>
      </View>
      <Text style={[styles.quote, lightBackground && styles.quoteSurface]}>"{quote}"</Text>
      <View style={styles.footer}>
        <View style={styles.slotBadge}>
          <Ionicons name="time-outline" size={12} color={lightBackground ? colors.textLight : 'rgba(255,255,255,0.7)'} />
          <Text style={[styles.slotText, lightBackground && styles.slotTextSurface]}>{hourLabel}</Text>
        </View>
        <Text style={[styles.hint, lightBackground && styles.hintSurface]}>Yeni cümle: {countdown}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  counter: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  quote: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  slotBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slotText: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  hint: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  boxSurface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  labelSurface: { color: colors.secondary },
  counterSurface: { color: colors.textLight },
  quoteSurface: { color: colors.text, fontStyle: 'italic' },
  slotTextSurface: { color: colors.textSecondary },
  hintSurface: { color: colors.textLight },
});
