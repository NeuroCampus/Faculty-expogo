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
import { getFacultyAssignments, createAnnouncement, getFacultySentNotifications } from '../../api/faculty';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: string;
  created_at: string;
  branch: string;
  section: string;
  subject: string;
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

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Assignment | null>(null);
  
  // Form data
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'student' | 'faculty' | 'both'>('student');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

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
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const result = await getFacultySentNotifications();
      if (result.success) {
        setAnnouncements(result.data?.data || []);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
    setLoading(false);
  };

  const submitAnnouncement = async () => {
    if (!title.trim() || !content.trim() || !selectedClass) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAnnouncement({
        branch_id: String(selectedClass.branch_id),
        semester_id: String(selectedClass.semester_id),
        section_id: String(selectedClass.section_id),
        title: title.trim(),
        content: content.trim(),
        target,
        student_usns: target === 'student' ? selectedStudents : undefined
      });

      if (result.success) {
        Alert.alert('Success', 'Announcement created successfully');
        setTitle('');
        setContent('');
        setSelectedClass(null);
        setTarget('student');
        setSelectedStudents([]);
        setShowCreateModal(false);
        loadAnnouncements();
      } else {
        Alert.alert('Error', result.message || 'Failed to create announcement');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create announcement');
    }
    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'student':
        return 'school';
      case 'faculty':
        return 'people';
      case 'both':
        return 'globe';
      default:
        return 'megaphone';
    }
  };

  const getTargetColor = (target: string) => {
    switch (target) {
      case 'student':
        return '#2563eb';
      case 'faculty':
        return '#059669';
      case 'both':
        return '#7c3aed';
      default:
        return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Announcements</Text>
        <Text style={styles.headerSubtitle}>Create and manage announcements</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create Announcement</Text>
        </TouchableOpacity>
      </View>

      {/* Announcements List */}
      <View style={styles.section}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading announcements...</Text>
          </View>
        ) : announcements.length > 0 ? (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.announcementCard}>
                <View style={styles.announcementHeader}>
                  <View style={styles.announcementInfo}>
                    <Text style={styles.announcementTitle}>{item.title}</Text>
                    <Text style={styles.announcementDate}>
                      {formatDate(item.created_at)}
                    </Text>
                  </View>
                  <View style={[
                    styles.targetBadge, 
                    { backgroundColor: getTargetColor(item.target) + '20' }
                  ]}>
                    <Ionicons 
                      name={getTargetIcon(item.target) as any} 
                      size={16} 
                      color={getTargetColor(item.target)} 
                    />
                    <Text style={[
                      styles.targetText, 
                      { color: getTargetColor(item.target) }
                    ]}>
                      {item.target.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.announcementContent} numberOfLines={3}>
                  {item.content}
                </Text>
                
                <View style={styles.announcementFooter}>
                  <Text style={styles.announcementClass}>
                    {item.branch} • {item.section} • {item.subject}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.announcementsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No announcements found</Text>
            <Text style={styles.emptySubtext}>Create your first announcement to get started</Text>
          </View>
        )}
      </View>

      {/* Create Announcement Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Announcement</Text>
            
            <ScrollView style={styles.modalScrollView}>
              {/* Class Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Class *</Text>
                <TouchableOpacity 
                  onPress={() => setShowClassModal(true)}
                  style={styles.selectorButton}
                >
                  <View style={styles.selectorContent}>
                    <Ionicons name="book" size={20} color="#2563eb" />
                    <View style={styles.selectorText}>
                      {selectedClass ? (
                        <>
                          <Text style={styles.selectorTitle}>{selectedClass.subject_name}</Text>
                          <Text style={styles.selectorSubtitle}>
                            {selectedClass.branch} • Sem {selectedClass.semester} • {selectedClass.section}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.selectorPlaceholder}>Select a class</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-down" size={20} color="#64748b" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Title Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter announcement title"
                  maxLength={100}
                />
              </View>

              {/* Content Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Content *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={content}
                  onChangeText={setContent}
                  placeholder="Enter announcement content"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.characterCount}>
                  {content.length}/500 characters
                </Text>
              </View>

              {/* Target Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Audience</Text>
                <View style={styles.targetOptions}>
                  {[
                    { value: 'student', label: 'Students', icon: 'school' },
                    { value: 'faculty', label: 'Faculty', icon: 'people' },
                    { value: 'both', label: 'Everyone', icon: 'globe' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.targetOption,
                        target === option.value && styles.targetOptionSelected
                      ]}
                      onPress={() => setTarget(option.value as any)}
                    >
                      <Ionicons 
                        name={option.icon as any} 
                        size={20} 
                        color={target === option.value ? '#fff' : '#64748b'} 
                      />
                      <Text style={[
                        styles.targetOptionText,
                        target === option.value && styles.targetOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (!title.trim() || !content.trim() || !selectedClass || submitting) && 
                  styles.modalSubmitButtonDisabled
                ]}
                onPress={submitAnnouncement}
                disabled={!title.trim() || !content.trim() || !selectedClass || submitting}
              >
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.modalSubmitText}>
                  {submitting ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                      setSelectedClass(assignment);
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
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'System',
    marginLeft: 8,
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
  announcementsList: {
    paddingBottom: 16,
  },
  announcementCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    color: '#64748b',
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  targetText: {
    fontSize: 10,
    fontFamily: 'System',
    marginLeft: 4,
  },
  announcementContent: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  announcementFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  announcementClass: {
    fontSize: 12,
    color: '#64748b',
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
    width: width * 0.95,
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontFamily: 'System',
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
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: 4,
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
    padding: 12,
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
  targetOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  targetOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  targetOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  targetOptionText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  targetOptionTextSelected: {
    color: '#fff',
    fontFamily: 'System',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
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
});