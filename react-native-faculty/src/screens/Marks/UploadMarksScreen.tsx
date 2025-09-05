import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';
import { getFacultyAssignments, getStudentsForClass, uploadInternalMarks, getInternalMarksForClass } from '../../api/faculty';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

interface Student {
  id: number;
  name: string;
  usn: string;
  mark: string;
  max_mark: number;
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

export default function UploadMarksScreen() {
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testNumber, setTestNumber] = useState<number | null>(null);
  const [maxMark, setMaxMark] = useState('100');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const qc = useQueryClient();

  const tests = [1, 2, 3, 4, 5];

  useEffect(() => {
    const fetchAssignments = async () => {
      setAssignmentsLoading(true);
      try {
        const result = await getFacultyAssignments();
        setAssignments(result.data || []);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        setAssignments([]);
      }
      setAssignmentsLoading(false);
    };
    fetchAssignments();
  }, []);

  const loadStudents = async () => {
    if (!selected || !testNumber) return;
    setLoading(true);
    try {
      const studentsResponse = await getStudentsForClass({
        branch_id: selected.branch_id,
        semester_id: selected.semester_id,
        section_id: selected.section_id,
        subject_id: selected.subject_id
      });
      const studentsData = studentsResponse.data?.data || [];
      
      // Try to load existing marks
      try {
        const existingMarksResponse = await getInternalMarksForClass({
          branch_id: selected.branch_id,
          semester_id: selected.semester_id,
          section_id: selected.section_id,
          subject_id: selected.subject_id,
          test_number: testNumber
        });
        const existingMarks = existingMarksResponse.data?.data || [];
        
        const markMap: Record<string, string> = {};
        existingMarks.forEach(st => {
          if (st.mark !== '' && st.mark != null) {
            markMap[String(st.id)] = String(st.mark);
          }
        });
        
        setStudents(studentsData.map((s: any) => ({
          ...s,
          mark: markMap[String(s.id)] || '',
          max_mark: parseInt(maxMark) || 100
        })));
      } catch {
        // If no existing marks, initialize with empty marks
        setStudents(studentsData.map((s: any) => ({
          ...s,
          mark: '',
          max_mark: parseInt(maxMark) || 100
        })));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load students');
    }
    setLoading(false);
  };

  const submitMarks = async () => {
    if (!selected || !testNumber) return;
    
    const validStudents = students.filter(s => s.mark !== '');
    if (validStudents.length === 0) {
      Alert.alert('Error', 'Please enter marks for at least one student');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        branch_id: String(selected.branch_id),
        semester_id: String(selected.semester_id),
        section_id: String(selected.section_id),
        subject_id: String(selected.subject_id),
        test_number: testNumber,
        marks: validStudents.map(s => ({
          student_id: String(s.id),
          mark: parseInt(s.mark) || 0
        }))
      };

      const result = await uploadInternalMarks(payload);
      if (result.success) {
        Alert.alert('Success', 'Marks uploaded successfully');
        qc.invalidateQueries({ queryKey: ['internal-marks'] });
        setStudents([]);
        setSelected(null);
        setTestNumber(null);
      } else {
        Alert.alert('Error', result.message || 'Failed to upload marks');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload marks');
    }
    setSaving(false);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const updateStudentMark = (index: number, mark: string) => {
    const numericMark = mark.replace(/[^0-9]/g, '');
    setStudents(prev => 
      prev.map((s, i) => 
        i === index ? { ...s, mark: numericMark } : s
      )
    );
  };

  const updateMaxMark = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setMaxMark(numericValue);
    setStudents(prev => 
      prev.map(s => ({ ...s, max_mark: parseInt(numericValue) || 100 }))
    );
  };

  const calculateStats = () => {
    const validMarks = students.filter(s => s.mark !== '').map(s => parseInt(s.mark) || 0);
    if (validMarks.length === 0) return { average: 0, highest: 0, lowest: 0 };
    
    const sum = validMarks.reduce((a, b) => a + b, 0);
    const average = sum / validMarks.length;
    const highest = Math.max(...validMarks);
    const lowest = Math.min(...validMarks);
    
    return { average: average.toFixed(1), highest, lowest };
  };

  const stats = calculateStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Marks</Text>
        <Text style={styles.headerSubtitle}>Upload internal test marks for students</Text>
      </View>

      {/* Class Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Class</Text>
        <TouchableOpacity 
          onPress={() => setShowClassModal(true)}
          style={styles.selectorButton}
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

      {/* Test Selection */}
      {selected && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Test</Text>
          <TouchableOpacity 
            onPress={() => setShowTestModal(true)}
            style={styles.selectorButton}
          >
            <View style={styles.selectorContent}>
              <Ionicons name="document-text" size={20} color="#2563eb" />
              <View style={styles.selectorText}>
                <Text style={styles.selectorTitle}>
                  {testNumber ? `Test ${testNumber}` : 'Select test number'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Max Mark Input */}
      {selected && testNumber && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Marks</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={maxMark}
              onChangeText={updateMaxMark}
              placeholder="Enter maximum marks"
              keyboardType="numeric"
            />
            <Text style={styles.inputLabel}>marks</Text>
          </View>
        </View>
      )}

      {/* Load Students Button */}
      {selected && testNumber && (
        <TouchableOpacity 
          onPress={loadStudents} 
          style={styles.loadButton}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.loadButtonText}>Load Students</Text>
        </TouchableOpacity>
      )}

      {/* File Upload Option */}
      {selected && testNumber && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Excel File (Optional)</Text>
          <TouchableOpacity onPress={pickFile} style={styles.fileButton}>
            <Ionicons name="document-outline" size={20} color="#2563eb" />
            <Text style={styles.fileButtonText}>
              {selectedFile ? selectedFile.name : 'Choose Excel File'}
            </Text>
            <Ionicons name="cloud-upload" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}

      {/* Students List */}
      {students.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Enter Marks</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statText}>Avg: {stats.average}</Text>
              <Text style={styles.statText}>High: {stats.highest}</Text>
              <Text style={styles.statText}>Low: {stats.lowest}</Text>
            </View>
          </View>
          
          <FlatList
            data={students}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }) => (
              <View style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentUSN}>{item.usn}</Text>
                </View>
                <View style={styles.markInputContainer}>
                  <TextInput
                    value={item.mark}
                    onChangeText={(text) => updateStudentMark(index, text)}
                    placeholder="0"
                    keyboardType="numeric"
                    style={styles.markInput}
                  />
                  <Text style={styles.maxMarkText}>/ {item.max_mark}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.studentsList}
          />
        </View>
      )}

      {/* Submit Button */}
      {students.length > 0 && (
        <TouchableOpacity 
          disabled={saving} 
          onPress={submitMarks} 
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {saving ? 'Uploading...' : 'Upload Marks'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      )}

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
            <ScrollView style={styles.modalList}>
              {assignmentsLoading ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                assignments.map((assignment: Assignment) => (
                  <TouchableOpacity
                    key={`${assignment.subject_id}-${assignment.section_id}`}
                    style={styles.modalOption}
                    onPress={() => {
                      setSelected(assignment);
                      setShowClassModal(false);
                    }}
                  >
                    <View style={styles.modalOptionContent}>
                      <Text style={styles.modalOptionTitle}>{assignment.subject_name}</Text>
                      <Text style={styles.modalOptionSubtitle}>
                        {assignment.branch} • Sem {assignment.semester} • {assignment.section}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowClassModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Test Selection Modal */}
      <Modal
        visible={showTestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Test</Text>
            <View style={styles.testGrid}>
              {tests.map((test) => (
                <TouchableOpacity
                  key={test}
                  style={[
                    styles.testOption,
                    testNumber === test && styles.testOptionSelected
                  ]}
                  onPress={() => {
                    setTestNumber(test);
                    setShowTestModal(false);
                  }}
                >
                  <Text style={[
                    styles.testOptionText,
                    testNumber === test && styles.testOptionTextSelected
                  ]}>
                    Test {test}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowTestModal(false)}
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
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 12,
  },
  selectorButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  selectorText: {
    flex: 1,
    marginLeft: 12,
  },
  selectorTitle: {
    fontSize: 16,
    fontFamily: 'System',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  inputLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748b',
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  loadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'System',
    marginLeft: 8,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 14,
    color: '#64748b',
  },
  studentsList: {
    paddingBottom: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
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
  markInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markInput: {
    width: 60,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
    textAlign: 'center',
    fontSize: 16,
    color: '#1e293b',
  },
  maxMarkText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'System',
    marginLeft: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
  },
  modalOptionSubtitle: {
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
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  testOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  testOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  testOptionText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  testOptionTextSelected: {
    color: '#2563eb',
    fontFamily: 'System',
  },
});