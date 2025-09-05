import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Dimensions,
  ScrollView
} from 'react-native';
import { getTimetable } from '../../api/faculty';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface TimetableEntry {
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  section: string;
  semester: number;
  branch: string;
  faculty_name: string;
  room: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetableScreen() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const result = await getTimetable();
      if (result.success) {
        setTimetable(result.data?.data || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to load timetable');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load timetable');
    }
    setLoading(false);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayTimetable = (day: string) => {
    return timetable.filter(entry => entry.day.toLowerCase() === day.toLowerCase());
  };

  const getCurrentDay = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return today;
  };

  const getTimeSlotColor = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 9) return '#fef3c7'; // Early morning
    if (hour < 12) return '#dbeafe'; // Morning
    if (hour < 14) return '#f0fdf4'; // Afternoon
    if (hour < 17) return '#fef2f2'; // Late afternoon
    return '#f3f4f6'; // Evening
  };

  const getTimeSlotBorderColor = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 9) return '#f59e0b';
    if (hour < 12) return '#2563eb';
    if (hour < 14) return '#059669';
    if (hour < 17) return '#dc2626';
    return '#6b7280';
  };

  const renderTimeSlot = (entry: TimetableEntry, index: number) => (
    <View key={index} style={[
      styles.timeSlot,
      { 
        backgroundColor: getTimeSlotColor(entry.start_time),
        borderLeftColor: getTimeSlotBorderColor(entry.start_time)
      }
    ]}>
      <View style={styles.timeSlotHeader}>
        <Text style={styles.timeText}>
          {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
        </Text>
        <View style={styles.roomBadge}>
          <Ionicons name="location" size={12} color="#64748b" />
          <Text style={styles.roomText}>{entry.room}</Text>
        </View>
      </View>
      
      <Text style={styles.subjectText}>{entry.subject}</Text>
      <Text style={styles.classText}>
        {entry.branch} • Sem {entry.semester} • {entry.section}
      </Text>
    </View>
  );

  const renderDayView = (day: string) => {
    const dayTimetable = getDayTimetable(day);
    
    return (
      <View style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{day}</Text>
          <Text style={styles.daySubtitle}>
            {dayTimetable.length} class{dayTimetable.length !== 1 ? 'es' : ''}
          </Text>
        </View>
        
        {dayTimetable.length > 0 ? (
          <View style={styles.timeSlotsContainer}>
            {dayTimetable
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((entry, index) => renderTimeSlot(entry, index))}
          </View>
        ) : (
          <View style={styles.emptyDay}>
            <Ionicons name="calendar-outline" size={32} color="#94a3b8" />
            <Text style={styles.emptyDayText}>No classes scheduled</Text>
          </View>
        )}
      </View>
    );
  };

  const renderWeekView = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.weekContainer}>
          {DAYS.map((day) => (
            <View key={day} style={styles.dayColumn}>
              <View style={[
                styles.dayHeader,
                day === getCurrentDay() && styles.currentDayHeader
              ]}>
                <Text style={[
                  styles.dayTitle,
                  day === getCurrentDay() && styles.currentDayTitle
                ]}>
                  {day}
                </Text>
                <Text style={[
                  styles.daySubtitle,
                  day === getCurrentDay() && styles.currentDaySubtitle
                ]}>
                  {getDayTimetable(day).length}
                </Text>
              </View>
              
              <ScrollView style={styles.dayColumnContent}>
                {getDayTimetable(day)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((entry, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.weekTimeSlot,
                        { 
                          backgroundColor: getTimeSlotColor(entry.start_time),
                          borderLeftColor: getTimeSlotBorderColor(entry.start_time)
                        }
                      ]}
                    >
                      <Text style={styles.weekTimeText}>
                        {formatTime(entry.start_time)}
                      </Text>
                      <Text style={styles.weekSubjectText} numberOfLines={2}>
                        {entry.subject}
                      </Text>
                      <Text style={styles.weekClassText} numberOfLines={1}>
                        {entry.section}
                      </Text>
                      <Text style={styles.weekRoomText} numberOfLines={1}>
                        {entry.room}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const calculateStats = () => {
    const totalClasses = timetable.length;
    const todayClasses = getDayTimetable(getCurrentDay()).length;
    const uniqueSubjects = new Set(timetable.map(entry => entry.subject)).size;
    const uniqueSections = new Set(timetable.map(entry => entry.section)).size;

    return { totalClasses, todayClasses, uniqueSubjects, uniqueSections };
  };

  const stats = calculateStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timetable</Text>
        <Text style={styles.headerSubtitle}>Your class schedule</Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalClasses}</Text>
          <Text style={styles.statLabel}>Total Classes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.todayClasses}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.uniqueSubjects}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.uniqueSections}</Text>
          <Text style={styles.statLabel}>Sections</Text>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'week' && styles.viewModeButtonActive
          ]}
          onPress={() => setViewMode('week')}
        >
          <Ionicons 
            name="calendar" 
            size={20} 
            color={viewMode === 'week' ? '#fff' : '#64748b'} 
          />
          <Text style={[
            styles.viewModeText,
            viewMode === 'week' && styles.viewModeTextActive
          ]}>
            Week View
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'day' && styles.viewModeButtonActive
          ]}
          onPress={() => setViewMode('day')}
        >
          <Ionicons 
            name="today" 
            size={20} 
            color={viewMode === 'day' ? '#fff' : '#64748b'} 
          />
          <Text style={[
            styles.viewModeText,
            viewMode === 'day' && styles.viewModeTextActive
          ]}>
            Day View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day Selector for Day View */}
      {viewMode === 'day' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.daySelector}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.daySelectorButton,
                  selectedDay === day && styles.daySelectorButtonActive,
                  day === getCurrentDay() && !selectedDay && styles.currentDayButton
                ]}
                onPress={() => setSelectedDay(selectedDay === day ? null : day)}
              >
                <Text style={[
                  styles.daySelectorText,
                  selectedDay === day && styles.daySelectorTextActive,
                  day === getCurrentDay() && !selectedDay && styles.currentDayText
                ]}>
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Timetable Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading timetable...</Text>
          </View>
        ) : timetable.length > 0 ? (
          viewMode === 'week' ? renderWeekView() : (
            selectedDay ? renderDayView(selectedDay) : (
              <View style={styles.selectDayContainer}>
                <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
                <Text style={styles.selectDayText}>Select a day to view schedule</Text>
              </View>
            )
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No timetable found</Text>
            <Text style={styles.emptySubtext}>Your class schedule will appear here</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'System',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    padding: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  viewModeButtonActive: {
    backgroundColor: '#2563eb',
  },
  viewModeText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  viewModeTextActive: {
    color: '#fff',
    fontFamily: 'System',
  },
  daySelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  daySelectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  daySelectorButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  currentDayButton: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  daySelectorText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'System',
  },
  daySelectorTextActive: {
    color: '#fff',
  },
  currentDayText: {
    color: '#f59e0b',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  weekContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dayColumn: {
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  dayHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  currentDayHeader: {
    backgroundColor: '#fef3c7',
  },
  dayTitle: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#1e293b',
    textAlign: 'center',
  },
  currentDayTitle: {
    color: '#f59e0b',
  },
  daySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  currentDaySubtitle: {
    color: '#f59e0b',
  },
  dayColumnContent: {
    maxHeight: 400,
  },
  weekTimeSlot: {
    margin: 4,
    padding: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  weekTimeText: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'System',
  },
  weekSubjectText: {
    fontSize: 11,
    color: '#1e293b',
    fontFamily: 'System',
    marginTop: 2,
  },
  weekClassText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  weekRoomText: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 1,
  },
  dayContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  timeSlotsContainer: {
    padding: 16,
  },
  timeSlot: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#1e293b',
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  subjectText: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 4,
  },
  classText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyDay: {
    padding: 32,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  selectDayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  selectDayText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 12,
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});