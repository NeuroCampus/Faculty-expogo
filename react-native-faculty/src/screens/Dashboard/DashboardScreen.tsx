import React from 'react';
import { View, Text, RefreshControl, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, Animated } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview, getFacultyAssignments, getProctorStudents } from '../../api/faculty';
import { usePushRegistration } from '../../services/notifications/usePushRegistration';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AttendanceChart } from '../../components/charts/AttendanceChart';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// Animated Card Component
function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    }).start();
  }, [animation, delay]);

  return (
    <Animated.View
      style={{
        opacity: animation,
        transform: [{
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// Stats Card Component with Gradient
function StatsCard({
  label,
  value,
  icon,
  color,
  bgColor,
  delay
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
  delay: number;
}) {
  return (
    <AnimatedCard delay={delay}>
      <View style={[styles.statsCard, { backgroundColor: bgColor }]}>
        <View style={styles.statsGradient}>
          <View style={styles.statsHeader}>
            <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={20} color={color} />
            </View>
            <Text style={[styles.statsLabel, { color: color }]}>{label}</Text>
          </View>
          <Text style={[styles.statsValue, { color: color }]}>{value}</Text>
        </View>
      </View>
    </AnimatedCard>
  );
}

// Quick Action Button Component
function QuickActionButton({
  title,
  icon,
  color,
  onPress,
  delay
}: {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  delay: number;
}) {
  const [scaleAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedCard delay={delay}>
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: color }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons name={icon as any} size={24} color="#fff" />
          <Text style={styles.quickActionText}>{title}</Text>
        </Animated.View>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

// Class Schedule Card
function ClassCard({ classInfo, delay }: { classInfo: any; delay: number }) {
  return (
    <AnimatedCard delay={delay}>
      <View style={styles.classCard}>
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <Text style={styles.classCourse}>{classInfo.course}</Text>
            <View style={styles.classMeta}>
              <View style={styles.classMetaItem}>
                <Ionicons name="time" size={14} color="#64748b" />
                <Text style={styles.classMetaText}>{classInfo.time}</Text>
              </View>
              <View style={styles.classMetaItem}>
                <Ionicons name="location" size={14} color="#64748b" />
                <Text style={styles.classMetaText}>{classInfo.room}</Text>
              </View>
            </View>
          </View>
          <View style={styles.classActions}>
            <Text style={styles.studentCount}>{classInfo.studentsCount} Students</Text>
            <TouchableOpacity style={styles.takeAttendanceBtn}>
              <Text style={styles.takeAttendanceText}>Take Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  usePushRegistration();
  const navigation: any = useNavigation();

  React.useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      navigation.navigate('Notification Center');
    });
    return () => sub.remove();
  }, [navigation]);

  const dashboardQ = useQuery({
    queryKey:['dashboard'],
    queryFn: async () => {
      const r = await getDashboardOverview();
      if(!r.success) throw new Error(r.message);
      return r;
    }
  });

  const assignmentsQ = useQuery({
    queryKey:['assignments'],
    queryFn: async () => {
      const r = await getFacultyAssignments();
      if(!r.success) throw new Error(r.message);
      return r;
    }
  });

  const proctorQ = useQuery({
    queryKey:['proctor-students'],
    queryFn: async () => {
      const r = await getProctorStudents();
      if(!r.success) throw new Error(r.message);
      return r;
    }
  });

  const refreshing = dashboardQ.isFetching || assignmentsQ.isFetching || proctorQ.isFetching;
  const overview = dashboardQ.data?.data || {} as any;
  const subjects = Array.isArray(assignmentsQ.data?.data) ? assignmentsQ.data.data : [];
  const proctorStudents = Array.isArray(proctorQ.data?.data) ? proctorQ.data.data : [];

  const handleRefresh = () => {
    dashboardQ.refetch();
    assignmentsQ.refetch();
    proctorQ.refetch();
  };

  // Mock data for today's classes (adapt to real data)
  const todaysClasses = [
    { course: 'CS301: Operating Systems', time: '10:00 AM', room: 'Room 301', studentsCount: 40 },
    { course: 'CS401: Artificial Intelligence', time: '01:30 PM', room: 'Room 401', studentsCount: 32 },
    { course: 'CS501: Advanced Databases', time: '03:00 PM', room: 'Lab 202', studentsCount: 28 },
  ];

  // Mock attendance data
  const attendanceData = [
    { name: 'OS', present: 88, absent: 12 },
    { name: 'AI', present: 85, absent: 15 },
    { name: 'DB', present: 92, absent: 8 },
    { name: 'Web', present: 90, absent: 10 },
  ];

  if (dashboardQ.isLoading || assignmentsQ.isLoading || proctorQ.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <AnimatedCard>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Faculty Dashboard</Text>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaText}>Computer Science Department</Text>
            <Text style={styles.headerMetaDivider}>|</Text>
            <Text style={styles.headerMetaText}>Spring Semester 2025</Text>
          </View>
        </View>
      </AnimatedCard>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatsCard
          label="Today's Classes"
          value={todaysClasses.length}
          icon="time"
          color="#059669"
          bgColor="#f0fdf4"
          delay={100}
        />
        <StatsCard
          label="Total Students"
          value={proctorStudents.length}
          icon="people"
          color="#2563eb"
          bgColor="#eff6ff"
          delay={200}
        />
        <StatsCard
          label="Pending Tasks"
          value="8"
          icon="document-text"
          color="#f59e0b"
          bgColor="#fefce8"
          delay={300}
        />
        <StatsCard
          label="Announcements"
          value="3"
          icon="megaphone"
          color="#7c3aed"
          bgColor="#faf5ff"
          delay={400}
        />
      </View>

      {/* Quick Actions */}
      <AnimatedCard delay={500}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionDescription}>Common tasks for today</Text>
          <View style={styles.quickActionsContainer}>
            <QuickActionButton
              title="Take Attendance"
              icon="checkmark-circle"
              color="#059669"
              onPress={() => navigation.navigate('Take Attendance')}
              delay={600}
            />
            <QuickActionButton
              title="Apply Leave"
              icon="calendar"
              color="#f59e0b"
              onPress={() => navigation.navigate('Apply Leave')}
              delay={700}
            />
            <QuickActionButton
              title="Upload Marks"
              icon="cloud-upload"
              color="#2563eb"
              onPress={() => navigation.navigate('Upload Marks')}
              delay={800}
            />
          </View>
        </View>
      </AnimatedCard>

      {/* Today's Schedule */}
      <AnimatedCard delay={900}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <Text style={styles.sectionDescription}>Your classes for today, September 5, 2025</Text>
          <View style={styles.classesContainer}>
            {todaysClasses.map((classInfo, index) => (
              <ClassCard
                key={index}
                classInfo={classInfo}
                delay={1000 + (index * 100)}
              />
            ))}
          </View>
        </View>
      </AnimatedCard>

      {/* Attendance Chart */}
      <AnimatedCard delay={1300}>
        <AttendanceChart
          title="Course Attendance Statistics"
          description="Attendance breakdown by course"
          data={attendanceData}
        />
      </AnimatedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  headerMetaText: {
    fontSize: 14,
    color: '#64748b',
  },
  headerMetaDivider: {
    marginHorizontal: 8,
    color: '#cbd5e1',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statsCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGradient: {
    flex: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  classesContainer: {
    gap: 12,
  },
  classCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  classInfo: {
    flex: 1,
  },
  classCourse: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  classMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  classMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classMetaText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  classActions: {
    alignItems: 'flex-end',
  },
  studentCount: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  takeAttendanceBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  takeAttendanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});