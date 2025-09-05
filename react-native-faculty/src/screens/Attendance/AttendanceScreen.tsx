import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
  StyleSheet,
  Dimensions,
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getFacultyAssignments, getStudentsForClass, takeAttendance } from '../../api/faculty';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

interface Student {
  id: number;
  name: string;
  usn: string;
  present: boolean;
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

export default function AttendanceScreen() {
  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({ 
    queryKey: ['assignments'], 
    queryFn: async (): Promise<Assignment[]> => { 
      const r = await getFacultyAssignments(); 
      if (!r.success) throw new Error(r.message); 
      return (r.data || []) as Assignment[]; 
    } 
  });
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showMethodModal, setShowMethodModal] = useState(false);

  useEffect(() => {
    if (!selected) return;
    loadStudents();
  }, [selected]);

  const loadStudents = async () => {
    if (!selected) return;
    setLoadingStudents(true);
    try {
      const studentsData = await getStudentsForClass({
        branch_id: selected.branch_id,
        semester_id: selected.semester_id,
        section_id: selected.section_id,
        subject_id: selected.subject_id
      });
      if (studentsData.success) {
        const studentList = (studentsData as any).data || [];
        setStudents(studentList.map((s: any) => ({ ...s, present: true })));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load students');
    }
    setLoadingStudents(false);
  };

  const submitAttendance = async () => {
    if (!selected) return;
    
    const payload = {
      branch_id: String(selected.branch_id),
      semester_id: String(selected.semester_id),
      section_id: String(selected.section_id),
      subject_id: String(selected.subject_id),
      method: mode,
      attendance: students.map(s => ({ student_id: String(s.id), status: s.present }))
    };

    Alert.alert(
      'Confirm Attendance', 
      `Submit attendance for ${students.filter(s => s.present).length}/${students.length} students?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const res = await takeAttendance(payload);
              if (res.success) {
                Alert.alert('Success', 'Attendance submitted successfully');
                setSelected(null);
                setStudents([]);
              } else {
                Alert.alert('Error', res.message || 'Failed to submit attendance');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to submit attendance');
            }
          }
        }
      ]
    );
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.usn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = students.filter(s => s.present).length;
  const absentCount = students.length - presentCount;

  if (!selected) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Take Attendance</Text>
            <Text style={styles.headerSubtitle}>Mark student attendance for today's classes</Text>
          </View>
          <View style={styles.dateBadge}>
            <Ionicons name="calendar" size={16} color="#2563eb" />
            <Text style={styles.dateBadgeText}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading subjects...</Text>
          </View>
        ) : (
          <View style={styles.classDetailsCard}>
            <Text style={styles.cardTitle}>Class Details</Text>
            <View style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => {/* TODO: Show date picker */}}
                >
                  <Ionicons name="calendar-outline" size={20} color="#64748b" />
                  <Text style={styles.dateInputText}>
                    {selectedDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TouchableOpacity 
                  style={styles.subjectSelector}
                  onPress={() => {/* TODO: Show subject picker */}}
                >
                  <Text style={styles.subjectSelectorText}>
                    Select Subject
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setSelected(null)} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{selected.subject_name}</Text>
          <Text style={styles.headerSubtitle}>
            {selected.branch} • Sem {selected.semester} • {selected.section}
          </Text>
        </View>
      </View>

      {/* Method Selection */}
      <View style={styles.methodContainer}>
        <TouchableOpacity 
          onPress={() => setShowMethodModal(true)}
          style={styles.methodButton}
        >
          <Ionicons 
            name={mode === 'manual' ? 'hand-left' : 'camera'} 
            size={20} 
            color="#2563eb" 
          />
          <Text style={styles.methodText}>
            {mode === 'manual' ? 'Manual Entry' : 'AI Camera'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryValue}>{presentCount}</Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
          <View style={styles.summaryIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
          </View>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryValue}>{absentCount}</Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
          <View style={styles.summaryIcon}>
            <Ionicons name="close-circle" size={24} color="#dc2626" />
          </View>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardContent}>
            <Text style={styles.summaryValue}>{students.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryIcon}>
            <Ionicons name="people" size={24} color="#2563eb" />
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Students List */}
      <View style={styles.studentsContainer}>
        {loadingStudents ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : mode === 'manual' ? (
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }) => (
              <View style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentUSN}>{item.usn}</Text>
                </View>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.present && styles.statusButtonPresent
                    ]}
                    onPress={() => setStudents(prev => 
                      prev.map((s, i) => 
                        i === index ? { ...s, present: true } : s
                      )
                    )}
                  >
                    <Ionicons 
                      name="checkmark" 
                      size={16} 
                      color={item.present ? '#fff' : '#059669'} 
                    />
                    <Text style={[
                      styles.statusButtonText,
                      item.present && styles.statusButtonTextActive
                    ]}>
                      Present
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      !item.present && styles.statusButtonAbsent
                    ]}
                    onPress={() => setStudents(prev => 
                      prev.map((s, i) => 
                        i === index ? { ...s, present: false } : s
                      )
                    )}
                  >
                    <Ionicons 
                      name="close" 
                      size={16} 
                      color={!item.present ? '#fff' : '#dc2626'} 
                    />
                    <Text style={[
                      styles.statusButtonText,
                      !item.present && styles.statusButtonTextActive
                    ]}>
                      Absent
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.studentsList}
          />
        ) : (
          <View style={styles.cameraContainer}>
            {permission?.granted ? (
              <View style={styles.cameraWrapper}>
                <CameraView style={styles.camera} facing="front" />
                <View style={styles.cameraOverlay}>
                  <Text style={styles.cameraText}>Position students within the frame</Text>
                </View>
              </View>
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Ionicons name="camera-outline" size={48} color="#94a3b8" />
                <Text style={styles.cameraPlaceholderText}>Camera permission required</Text>
                <TouchableOpacity 
                  onPress={requestPermission}
                  style={styles.permissionButton}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {mode === 'manual' && students.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => setStudents(prev => prev.map(s => ({ ...s, present: true })))}
            style={styles.actionButton}
          >
            <Ionicons name="checkmark-circle" size={20} color="#059669" />
            <Text style={styles.actionButtonText}>Mark All Present</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setStudents(prev => prev.map(s => ({ ...s, present: false })))}
            style={styles.actionButton}
          >
            <Ionicons name="close-circle" size={20} color="#dc2626" />
            <Text style={styles.actionButtonText}>Mark All Absent</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Submit Buttons */}
      {students.length > 0 && (
        <View style={styles.submitButtonsContainer}>
          <TouchableOpacity 
            onPress={submitAttendance} 
            style={styles.submitButton}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Submit Attendance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => Alert.alert('Draft Saved', 'Attendance saved as draft')}
            style={styles.draftButton}
          >
            <Ionicons name="save-outline" size={20} color="#64748b" />
            <Text style={styles.draftButtonText}>Save as Draft</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Method Selection Modal */}
      <Modal
        visible={showMethodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Method</Text>
            
            <TouchableOpacity
              style={[styles.modalOption, mode === 'manual' && styles.modalOptionSelected]}
              onPress={() => {
                setMode('manual');
                setShowMethodModal(false);
              }}
            >
              <Ionicons name="hand-left" size={24} color="#2563eb" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Manual Entry</Text>
                <Text style={styles.modalOptionDescription}>Manually mark each student</Text>
              </View>
              {mode === 'manual' && <Ionicons name="checkmark" size={20} color="#2563eb" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, mode === 'ai' && styles.modalOptionSelected]}
              onPress={() => {
                setMode('ai');
                setShowMethodModal(false);
              }}
            >
              <Ionicons name="camera" size={24} color="#2563eb" />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>AI Camera</Text>
                <Text style={styles.modalOptionDescription}>Use camera for face recognition</Text>
              </View>
              {mode === 'ai' && <Ionicons name="checkmark" size={20} color="#2563eb" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowMethodModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  dateBadgeText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  classDetailsCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  cardContent: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateInputText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  subjectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subjectSelectorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  summaryCardContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  statusButtonPresent: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  statusButtonAbsent: {
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  submitButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  draftButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
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
  assignmentsList: {
    padding: 16,
  },
  assignmentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  assignmentTitle: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
    flex: 1,
  },
  assignmentCode: {
    fontSize: 14,
    color: '#64748b',
  },
  assignmentDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  assignmentFooter: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  methodContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  methodText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'System',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1e293b',
  },
  studentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  studentsList: {
    paddingBottom: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    alignItems: 'center',
  },
  cameraText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  cameraPlaceholderText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  modalOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
  },
  modalOptionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  modalCancel: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
});