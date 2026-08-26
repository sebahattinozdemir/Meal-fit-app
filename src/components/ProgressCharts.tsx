import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';
import { ChartPoint } from '../types/progress';
import { colors, spacing, borderRadius } from '../constants/theme';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: string;
}

export function ChartCard({ title, subtitle, children, footer }: ChartCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

interface BarChartProps {
  points: ChartPoint[];
  color?: string;
  height?: number;
  unit?: string;
}

export function BarChart({ points, color = colors.primary, height = 140, unit = '' }: BarChartProps) {
  if (points.length === 0) {
    return <Text style={styles.empty}>Henüz veri yok</Text>;
  }

  const max = Math.max(...points.map((p) => p.value), 1);
  const barWidth = Math.max(18, Math.min(36, 240 / points.length));
  const gap = 8;
  const chartWidth = points.length * (barWidth + gap);

  return (
    <View style={styles.chartWrap}>
      <Svg width={chartWidth} height={height}>
        {points.map((p, i) => {
          const barH = Math.max(4, (p.value / max) * (height - 36));
          const x = i * (barWidth + gap);
          const y = height - 28 - barH;
          return (
            <React.Fragment key={`${p.label}-${i}`}>
              <Rect x={x} y={y} width={barWidth} height={barH} rx={6} fill={color} opacity={0.9} />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={[styles.labelsRow, { width: chartWidth }]}>
        {points.map((p, i) => (
          <View key={`${p.label}-lbl-${i}`} style={{ width: barWidth + gap, alignItems: 'center' }}>
            <Text style={styles.valueLabel} numberOfLines={1}>
              {p.value}{unit}
            </Text>
            <Text style={styles.axisLabel} numberOfLines={1}>
              {p.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

interface LineChartProps {
  points: ChartPoint[];
  color?: string;
  height?: number;
  unit?: string;
}

export function LineChart({ points, color = colors.secondary, height = 150, unit = ' kg' }: LineChartProps) {
  if (points.length === 0) {
    return <Text style={styles.empty}>Henüz ölçüm yok — kilo ekle</Text>;
  }

  if (points.length === 1) {
    return (
      <View style={styles.singlePoint}>
        <Text style={styles.singleValue}>{points[0].value}{unit}</Text>
        <Text style={styles.singleLabel}>{points[0].label}</Text>
      </View>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.15 || 1;
  const yMin = min - padding;
  const yMax = max + padding;
  const range = yMax - yMin || 1;

  const width = Math.max(260, points.length * 44);
  const topPad = 16;
  const bottomPad = 28;
  const innerH = height - topPad - bottomPad;

  const coords = points.map((p, i) => {
    const x = 16 + (i / (points.length - 1)) * (width - 32);
    const y = topPad + innerH - ((p.value - yMin) / range) * innerH;
    return { x, y, p };
  });

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(' ');

  return (
    <View style={styles.chartWrap}>
      <Svg width={width} height={height}>
        {[0, 0.5, 1].map((t) => {
          const y = topPad + innerH * t;
          return (
            <Line
              key={t}
              x1={12}
              y1={y}
              x2={width - 12}
              y2={y}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}
        <Polyline points={polyline} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={5} fill={colors.surface} stroke={color} strokeWidth={2.5} />
        ))}
      </Svg>
      <View style={[styles.labelsRow, { width }]}>
        {coords.map((c, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: c.x - 22,
              width: 44,
              alignItems: 'center',
            }}
          >
            <Text style={styles.axisLabel} numberOfLines={1}>
              {c.p.label}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>Min {min.toFixed(1)}{unit}</Text>
        <Text style={styles.rangeText}>Max {max.toFixed(1)}{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm },
  footer: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm },
  chartWrap: { marginTop: spacing.sm, overflow: 'hidden' },
  labelsRow: { flexDirection: 'row', marginTop: 4, position: 'relative', minHeight: 34 },
  axisLabel: { fontSize: 10, color: colors.textLight, fontWeight: '600' },
  valueLabel: { fontSize: 11, color: colors.text, fontWeight: '700', marginBottom: 2 },
  empty: { fontSize: 13, color: colors.textLight, marginVertical: spacing.lg, textAlign: 'center' },
  singlePoint: { alignItems: 'center', paddingVertical: spacing.lg },
  singleValue: { fontSize: 32, fontWeight: '800', color: colors.secondary },
  singleLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  rangeText: { fontSize: 11, color: colors.textLight, fontWeight: '600' },
});
