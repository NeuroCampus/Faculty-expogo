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
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { getProctorStudents, scheduleMentoring } from '../../api/faculty';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface ProctorStudent {
  name: string;
  usn: string;
  branch: string | null;
  branch_id: number | null;
  semester: number | null;
  semester_id: number | null;
  section: string | null;
  section_id: number | null;
  attendance: number | string;
  marks: Array<{
    subject: string;
    subject_code: string | null;
    test_number: number;
    mark: number;
    max_mark: number;
  }>;
  certificates: Array<{
    title: string;
    file: string | null;
    uploaded_at: string;
  }>;
  latest_leave_request: {
    id: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
  } | null;
  user_info: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    mobile_number: string | null;
    address: string | null;
    bio: string | null;
  } | null;
  face_encodings: unknown;
  proctor: {
    id: number | null;
    name: string | null;
    email: string | null;
  } | null;
  leave_requests?: Array<{
    id: string;
    student_name: string;
    usn: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }>;
}

export default function ProctorScreen() {
  const navigation = useNavigation();
  const [students, setStudents] = useState<ProctorStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'good' | 'poor'>('all');
  const [showMentoringModal, setShowMentoringModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<ProctorStudent | null>(null);
  const [mentoringDate, setMentoringDate] = useState(new Date());
  const [mentoringPurpose, setMentoringPurpose] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const result = await getProctorStudents();
      if (result.success) {
        // Ensure data is an array
        const studentsData = Array.isArray(result.data) ? result.data : [];
        setStudents(studentsData);
      } else {
        Alert.alert('Error', result.message || 'Failed to load students');
        setStudents([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
      setStudents([]); // Set empty array on error
    }
    setLoading(false);
  };

  const getAttendanceStatus = (attendance: number | string) => {
    const percentage = typeof attendance === 'number' ? attendance : parseFloat(attendance.toString()) || 0;
    if (percentage >= 75) return { status: 'Good', color: '#059669', icon: 'checkmark-circle' };
    if (percentage >= 50) return { status: 'Average', color: '#d97706', icon: 'warning' };
    return { status: 'Poor', color: '#dc2626', icon: 'close-circle' };
  };

  const getAverageMarks = (marks: ProctorStudent['marks']) => {
    if (!marks || marks.length === 0) return 0;
    const total = marks.reduce((sum, mark) => sum + mark.mark, 0);
    return (total / marks.length).toFixed(1);
  };

  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.usn.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const attendanceStatus = getAttendanceStatus(student.attendance);
    if (filterStatus === 'good') return matchesSearch && attendanceStatus.status === 'Good';
    if (filterStatus === 'poor') return matchesSearch && attendanceStatus.status === 'Poor';
    
    return matchesSearch;
  }) : [];

  const scheduleMentoringSession = async () => {
    if (!selectedStudent || !mentoringPurpose.trim()) {
      Alert.alert('Error', 'Please provide a purpose for the mentoring session');
      return;
    }

    try {
      const result = await scheduleMentoring({
        student_id: selectedStudent.usn, // Using USN as student ID
        date: mentoringDate.toISOString().split('T')[0],
        purpose: mentoringPurpose.trim()
      });

      if (result.success) {
        Alert.alert('Success', 'Mentoring session scheduled successfully');
        setShowMentoringModal(false);
        setSelectedStudent(null);
        setMentoringPurpose('');
      } else {
        Alert.alert('Error', result.message || 'Failed to schedule mentoring session');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule mentoring session');
    }
  };

  const calculateStats = () => {
    const totalStudents = students.length;
    const goodAttendance = students.filter(s => {
      const status = getAttendanceStatus(s.attendance);
      return status.status === 'Good';
    }).length;
    const pendingLeaves = students.reduce((count, s) => {
      return count + (s.leave_requests?.filter(l => l.status === 'PENDING').length || 0);
    }, 0);

    return { totalStudents, goodAttendance, pendingLeaves };
  };

  const stats = calculateStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Proctor Students</Text>
        <Text style={styles.headerSubtitle}>Manage your proctor students</Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.goodAttendance}</Text>
          <Text style={styles.statLabel}>Good Attendance</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pendingLeaves}</Text>
          <Text style={styles.statLabel}>Pending Leaves</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          {[
            { key: 'all', label: 'All' },
            { key: 'good', label: 'Good' },
            { key: 'poor', label: 'Poor' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                filterStatus === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus(filter.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === filter.key && styles.filterButtonTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Students List */}
      <View style={styles.section}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : filteredStudents.length > 0 ? (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.usn}
            renderItem={({ item }) => {
              const attendanceStatus = getAttendanceStatus(item.attendance);
              const averageMarks = getAverageMarks(item.marks);
              
              return (
                <TouchableOpacity
                  style={styles.studentCard}
                  onPress={() => navigation.navigate('Proctor Student Detail', { student: item })}
                >
                  <View style={styles.studentHeader}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{item.name}</Text>
                      <Text style={styles.studentUSN}>{item.usn}</Text>
                      <Text style={styles.studentDetails}>
                        {item.branch} • Sem {item.semester} • {item.section}
                      </Text>
                    </View>
                    <View style={styles.studentActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          setSelectedStudent(item);
                          setShowMentoringModal(true);
                        }}
                      >
                        <Ionicons name="calendar" size={16} color="#2563eb" />
                      </TouchableOpacity>
                      <Ionicons name="chevron-forward" size={20} color="#64748b" />
                    </View>
                  </View>

                  <View style={styles.studentStats}>
                    <View style={styles.statItem}>
                      <Ionicons 
                        name={attendanceStatus.icon as any} 
                        size={16} 
                        color={attendanceStatus.color} 
                      />
                      <Text style={[styles.statText, { color: attendanceStatus.color }]}>
                        {typeof item.attendance === 'number' ? item.attendance : parseFloat(item.attendance.toString()) || 0}%
                      </Text>
                      <Text style={styles.statLabel}>Attendance</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Ionicons name="school" size={16} color="#7c3aed" />
                      <Text style={styles.statText}>{averageMarks}</Text>
                      <Text style={styles.statLabel}>Avg Marks</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Ionicons name="document" size={16} color="#059669" />
                      <Text style={styles.statText}>{item.certificates?.length || 0}</Text>
                      <Text style={styles.statLabel}>Certificates</Text>
                    </View>
                  </View>

                  {item.latest_leave_request && (
                    <View style={styles.leaveRequest}>
                      <Ionicons name="calendar-outline" size={14} color="#d97706" />
                      <Text style={styles.leaveRequestText}>
                        Leave: {item.latest_leave_request.start_date} - {item.latest_leave_request.end_date}
                      </Text>
                      <Text style={[
                        styles.leaveStatus,
                        { color: item.latest_leave_request.status === 'PENDING' ? '#d97706' : 
                                 item.latest_leave_request.status === 'APPROVED' ? '#059669' : '#dc2626' }
                      ]}>
                        {item.latest_leave_request.status}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.studentsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No students found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No proctor students assigned'}
            </Text>
          </View>
        )}
      </View>

      {/* Mentoring Modal */}
      <Modal
        visible={showMentoringModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMentoringModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Mentoring</Text>
            
            {selectedStudent && (
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{selectedStudent.name}</Text>
                <Text style={styles.studentUSN}>{selectedStudent.usn}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity style={styles.dateButton}>
                <Ionicons name="calendar" size={20} color="#2563eb" />
                <Text style={styles.dateText}>
                  {mentoringDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Purpose</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={mentoringPurpose}
                onChangeText={setMentoringPurpose}
                placeholder="Enter the purpose of this mentoring session"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowMentoringModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  !mentoringPurpose.trim() && styles.modalSubmitButtonDisabled
                ]}
                onPress={scheduleMentoringSession}
                disabled={!mentoringPurpose.trim()}
              >
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={styles.modalSubmitText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginHorizontal: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontFamily: 'System',
  },
  section: {
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
  studentsList: {
    paddingBottom: 16,
  },
  studentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
  },
  studentUSN: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  studentDetails: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  studentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  leaveRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  leaveRequestText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    marginLeft: 6,
  },
  leaveStatus: {
    fontSize: 10,
    fontFamily: 'System',
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
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  studentInfo: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
  },
  studentUSN: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontFamily: 'System',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalSubmitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  modalSubmitText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'System',
    marginLeft: 8,
  },
});