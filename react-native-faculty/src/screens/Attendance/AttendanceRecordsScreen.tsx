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
  Modal,
  ScrollView,
  TextInput
} from 'react-native';
import { getFacultyAssignments, viewAttendanceRecords, getAttendanceRecordsList } from '../../api/faculty';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AttendanceRecord {
  student: string;
  usn: string;
  total_sessions: number;
  present: number;
  percentage: number;
}

interface AttendanceSession {
  id: number;
  date: string;
  subject: string;
  section: string;
  total_students: number;
  present_count: number;
}

interface Assignment {
  subject_name: string;
  subject_code: string;
  subject_id: number;
  section: string;
  section_id: number;
  semester: number;
  semester_id: number;
  branch: string;
  branch_id: number;
}

export default function AttendanceRecordsScreen() {
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      setAssignmentsLoading(true);
      try {
        const result = await getFacultyAssignments();
        setAssignments(result.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        setAssignments([]);
      }
      setAssignmentsLoading(false);
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selected) {
      loadAttendanceRecords();
    }
  }, [selected]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const result = await getAttendanceRecordsList();
      if (result.success) {
        setSessions(result.data?.data || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
    setLoadingSessions(false);
  };

  const loadAttendanceRecords = async () => {
    if (!selected) return;
    
    setLoading(true);
    try {
      const result = await viewAttendanceRecords({
        branch_id: String(selected.branch_id),
        semester_id: String(selected.semester_id),
        section_id: String(selected.section_id),
        subject_id: String(selected.subject_id)
      });
      
      if (result.success) {
        setRecords(result.data || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to load attendance records');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load attendance records');
    }
    setLoading(false);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return '#10b981';
    if (percentage >= 75) return '#f59e0b';
    return '#ef4444';
  };

  const filteredRecords = records.filter(record =>
    record.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.usn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = selectedSemester === '' || session.subject.includes(`Sem ${selectedSemester}`);
    return matchesSearch && matchesSemester;
  });

  const calculateStats = () => {
    if (records.length === 0) return { average: 0, totalStudents: 0, goodAttendance: 0 };
    
    const totalPercentage = records.reduce((sum, record) => sum + record.percentage, 0);
    const average = totalPercentage / records.length;
    const goodAttendance = records.filter(record => record.percentage >= 75).length;
    
    return {
      average: average.toFixed(1),
      totalStudents: records.length,
      goodAttendance
    };
  };

  const stats = calculateStats();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Attendance Records</Text>
          <Text style={styles.headerSubtitle}>View detailed attendance records for all subjects</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="calendar" size={16} color="#2563eb" />
          <Text style={styles.headerBadgeText}>2024-25</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="filter" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Filters</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.filtersGrid}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search subjects..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity 
              style={styles.semesterSelector}
              onPress={() => {
                // Show semester selection modal or picker
                Alert.alert('Semester Filter', 'Select semester to filter records');
              }}
            >
              <Ionicons name="school" size={20} color="#2563eb" />
              <Text style={styles.semesterText}>
                {selectedSemester ? `Semester ${selectedSemester}` : 'All Semesters'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Class Selection */}
      <View style={styles.selectionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="book" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Select Class</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <TouchableOpacity 
            onPress={() => setShowClassModal(true)}
            style={styles.classSelector}
          >
            <View style={styles.selectorContent}>
              <Ionicons name="book" size={20} color="#2563eb" />
              <View style={styles.selectorText}>
                {selected ? (
                  <>
                    <Text style={styles.selectorTitle}>{selected.subject_name}</Text>
                    <Text style={styles.selectorSubtitle}>
                      {selected.branch} • Sem {selected.semester} • {selected.section}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.selectorPlaceholder}>Select a subject</Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subject-wise Attendance */}
      <View style={styles.attendanceCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="bar-chart" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Subject-wise Attendance</Text>
          </View>
          <Text style={styles.cardDescription}>
            Detailed attendance breakdown for each subject
          </Text>
        </View>

        <View style={styles.cardContent}>
          {loadingSessions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading attendance data...</Text>
            </View>
          ) : filteredSessions.length > 0 ? (
            <View style={styles.attendanceList}>
              {filteredSessions.map((session, index) => (
                <TouchableOpacity
                  key={session.id}
                  style={styles.attendanceItem}
                  onPress={() => setSelectedSession(session)}
                >
                  <View style={styles.attendanceItemHeader}>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{session.subject}</Text>
                      <View style={styles.subjectMeta}>
                        <Text style={styles.subjectDate}>
                          {new Date(session.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.subjectSection}>{session.section}</Text>
                      </View>
                    </View>

                    <View style={styles.attendanceStats}>
                      <Text style={styles.attendancePercentage}>
                        {((session.present_count / session.total_students) * 100).toFixed(1)}%
                      </Text>
                      <Text style={styles.attendanceCount}>
                        {session.present_count}/{session.total_students}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${(session.present_count / session.total_students) * 100}%`,
                          backgroundColor: getProgressColor((session.present_count / session.total_students) * 100)
                        }
                      ]} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No attendance records found</Text>
            </View>
          )}
        </View>
      </View>

      {/* Statistics */}
      {selected && records.length > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="stats-chart" size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>Statistics</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#10b98120' }]}>
                  <Ionicons name="trending-up" size={24} color="#10b981" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.average}%</Text>
                  <Text style={styles.statLabel}>Average</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#f59e0b20' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#f59e0b" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.goodAttendance}</Text>
                  <Text style={styles.statLabel}>Good (≥75%)</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: '#2563eb20' }]}>
                  <Ionicons name="people" size={24} color="#2563eb" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{stats.totalStudents}</Text>
                  <Text style={styles.statLabel}>Total Students</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Student Records */}
      {selected && records.length > 0 && (
        <View style={styles.recordsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="people" size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>Student Records</Text>
            </View>
            <Text style={styles.cardDescription}>
              Individual student attendance details
            </Text>
          </View>

          <View style={styles.cardContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading student records...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredRecords}
                keyExtractor={(item) => item.usn}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.studentCard}>
                    <View style={styles.studentHeader}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.student}</Text>
                        <Text style={styles.studentUSN}>{item.usn}</Text>
                      </View>
                      <View style={styles.percentageContainer}>
                        <Ionicons 
                          name="checkmark-circle" 
                          size={20} 
                          color={getPercentageColor(item.percentage)} 
                        />
                        <Text style={[
                          styles.percentage, 
                          { color: getPercentageColor(item.percentage) }
                        ]}>
                          {item.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.studentStats}>
                      <View style={styles.statGrid}>
                        <View style={styles.miniStat}>
                          <Text style={styles.miniStatLabel}>Total Classes</Text>
                          <Text style={styles.miniStatValue}>{item.total_sessions}</Text>
                        </View>
                        <View style={styles.miniStat}>
                          <Text style={styles.miniStatLabel}>Attended</Text>
                          <Text style={styles.miniStatValue}>{item.present}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <View 
                        style={[
                          styles.progressBar, 
                          { 
                            width: `${item.percentage}%`,
                            backgroundColor: getPercentageColor(item.percentage)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={48} color="#94a3b8" />
                    <Text style={styles.emptyText}>No students found</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      )}

      {/* Modals */}
      {/* Class Selection Modal */}
      <Modal
        visible={showClassModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClassModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Class</Text>
            {assignmentsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading classes...</Text>
              </View>
            ) : (
              <FlatList
                data={assignments}
                keyExtractor={(item) => item.subject_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelected(item);
                      setShowClassModal(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemTitle}>{item.subject_name}</Text>
                      <Text style={styles.modalItemSubtitle}>
                        {item.branch} • Sem {item.semester} • {item.section}
                      </Text>
                    </View>
                    {selected?.subject_id === item.subject_id && (
                      <Ionicons name="checkmark" size={24} color="#2563eb" />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No classes available</Text>
                }
              />
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowClassModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Session Details Modal */}
      <Modal
        visible={showSessionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Sessions</Text>
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.sessionModalItem}
                  onPress={() => {
                    setSelectedSession(item);
                    setShowSessionModal(false);
                  }}
                >
                  <View style={styles.sessionModalContent}>
                    <Text style={styles.sessionModalSubject}>{item.subject}</Text>
                    <Text style={styles.sessionModalDate}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.sessionModalStats}>
                      {item.present_count}/{item.total_students} present
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No sessions available</Text>
              }
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSessionModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  filtersCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  selectionCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  recordsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  cardContent: {
    gap: 16,
  },
  filtersGrid: {
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  semesterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    height: 48,
  },
  semesterText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  classSelector: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorText: {
    flex: 1,
    marginLeft: 12,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectorSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
  attendanceList: {
    gap: 12,
  },
  attendanceItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attendanceItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  subjectMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  subjectDate: {
    fontSize: 14,
    color: '#64748b',
  },
  subjectSection: {
    fontSize: 14,
    color: '#64748b',
  },
  attendanceStats: {
    alignItems: 'flex-end',
  },
  attendancePercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  attendanceCount: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  studentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  studentUSN: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentStats: {
    marginBottom: 12,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  miniStat: {
    flex: 1,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
  },
  sessionModalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sessionModalContent: {
    gap: 4,
  },
  sessionModalSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  sessionModalDate: {
    fontSize: 14,
    color: '#64748b',
  },
  sessionModalStats: {
    fontSize: 14,
    color: '#64748b',
  },
});