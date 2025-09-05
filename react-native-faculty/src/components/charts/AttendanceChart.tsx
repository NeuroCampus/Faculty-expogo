import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AttendanceData {
  name: string;
  present: number;
  absent: number;
}

interface AttendanceChartProps {
  title: string;
  description: string;
  data: AttendanceData[];
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({
  title,
  description,
  data
}) => {
  const maxAttendance = Math.max(...data.map(item => item.present));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const presentPercentage = (item.present / (item.present + item.absent)) * 100;
          const chartHeight = (item.present / maxAttendance) * 120;

          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(chartHeight, 20),
                      backgroundColor: '#2563eb'
                    }
                  ]}
                />
                <View style={styles.percentageContainer}>
                  <Text style={styles.percentageText}>
                    {presentPercentage.toFixed(0)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2563eb' }]} />
          <Text style={styles.legendText}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#e2e8f0' }]} />
          <Text style={styles.legendText}>Absent</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  barWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  bar: {
    width: 32,
    borderRadius: 4,
    minHeight: 20,
  },
  percentageContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  barLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
});
