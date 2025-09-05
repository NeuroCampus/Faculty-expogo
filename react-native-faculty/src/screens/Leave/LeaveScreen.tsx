import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';
import { applyLeave, getFacultyLeaveRequests } from '../../api/faculty';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

interface LeaveRequest {
  id: string;
  branch: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  applied_on: string;
  reviewed_by?: string | null;
}

export default function LeaveScreen() {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('leaveRequests state:', leaveRequests, 'isArray:', Array.isArray(leaveRequests));
  }, [leaveRequests]);

  const loadLeaveRequests = async () => {
    setLoading(true);
    try {
      const response = await getFacultyLeaveRequests();
      console.log('API response:', response);
      if (response.success) {
        console.log('Setting leaveRequests to:', response.data);
        setLeaveRequests((response.data || []) as LeaveRequest[]);
      } else {
        Alert.alert('Error', response.message || 'Failed to load leave requests');
        setLeaveRequests([]);
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      Alert.alert('Error', 'Failed to load leave requests');
      setLeaveRequests([]);
    }
    setLoading(false);
  };

  const submitLeaveRequest = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for leave');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    setSubmitting(true);
    try {
      const result = await applyLeave({
        branch_ids: [], // Empty array as per API
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        reason: reason.trim()
      });

      if (result.success) {
        Alert.alert('Success', 'Leave request submitted successfully');
        setReason('');
        setStartDate(new Date());
        setEndDate(new Date());
        loadLeaveRequests();
      } else {
        Alert.alert('Error', result.message || 'Failed to submit leave request');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit leave request');
    }
    setSubmitting(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return '#059669';
      case 'REJECTED':
        return '#dc2626';
      case 'PENDING':
        return '#d97706';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      case 'PENDING':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const calculateDays = () => {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Apply for Leave</Text>
          <Text style={styles.headerSubtitle}>Submit leave applications and track their status</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Leave Application Form */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="document-text" size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>Leave Application Form</Text>
            </View>
            <Text style={styles.cardDescription}>
              Fill out the form below to submit a leave request
            </Text>
          </View>
          
          <View style={styles.cardContent}>
            {/* Date Selection */}
            <View style={styles.dateGrid}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#2563eb" />
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#2563eb" />
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                  <Ionicons name="chevron-down" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration Display */}
            <View style={styles.durationContainer}>
              <Ionicons name="time" size={20} color="#64748b" />
              <Text style={styles.durationText}>
                Duration: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
              </Text>
            </View>

            {/* Reason Input */}
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Reason for Leave</Text>
              <TouchableOpacity 
                style={styles.reasonButton}
                onPress={() => setShowReasonModal(true)}
              >
                <Ionicons name="document-text" size={20} color="#2563eb" />
                <Text style={[styles.reasonText, { color: reason ? '#1e293b' : '#94a3b8' }]}>
                  {reason || 'Tap to enter reason...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Submit Buttons */}
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.submitButton, (submitting || !reason.trim()) && styles.submitButtonDisabled]}
                onPress={submitLeaveRequest}
                disabled={submitting || !reason.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.draftButton}
                onPress={() => Alert.alert('Draft Saved', 'Leave request saved as draft')}
              >
                <Ionicons name="save-outline" size={20} color="#64748b" />
                <Text style={styles.draftButtonText}>Save as Draft</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="stats-chart" size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>Leave Summary</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>
                  {Array.isArray(leaveRequests) ? leaveRequests.filter(item => item.status.toLowerCase() === 'approved').length : 0}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#f59e0b20' }]}>
                <Ionicons name="time" size={24} color="#f59e0b" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>
                  {Array.isArray(leaveRequests) ? leaveRequests.filter(item => item.status.toLowerCase() === 'pending').length : 0}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#ef444420' }]}>
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>
                  {Array.isArray(leaveRequests) ? leaveRequests.filter(item => item.status.toLowerCase() === 'rejected').length : 0}
                </Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Leave History */}
        <View style={styles.historyCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="time" size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>Leave History</Text>
            </View>
            <Text style={styles.cardDescription}>
              View your previous leave applications and their status
            </Text>
          </View>

          <View style={styles.cardContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading leave requests...</Text>
              </View>
            ) : Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
              leaveRequests.map((item, index) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyItemTitle}>
                      {formatDate(new Date(item.start_date))} - {formatDate(new Date(item.end_date))}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                      <Ionicons 
                        name={getStatusIcon(item.status) as any} 
                        size={16} 
                        color={getStatusColor(item.status)} 
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.historyItemDetails}>
                    <View style={styles.historyItemDate}>
                      <Ionicons name="calendar" size={16} color="#64748b" />
                      <Text style={styles.historyItemDateText}>
                        Applied on {formatDate(new Date(item.applied_on))}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.historyItemReason}>{item.reason}</Text>
                  
                  {item.reviewed_by && (
                    <Text style={styles.reviewedBy}>
                      Reviewed by: {item.reviewed_by}
                    </Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyText}>No leave requests found</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Start Date Picker Modal */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {/* End Date Picker Modal */}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
          minimumDate={startDate}
        />
      )}

      {/* Reason Modal */}
      <Modal
        visible={showReasonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReasonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reason for Leave</Text>
            <TextInput
              style={styles.reasonInput}
              value={reason}
              onChangeText={setReason}
              placeholder="Enter your reason for leave..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowReasonModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={() => setShowReasonModal(false)}
              >
                <Text style={styles.modalSaveText}>Save</Text>
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
  headerContent: {
    flex: 1,
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 16,
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
  dateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  formButtons: {
    flexDirection: 'row',
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
  historyCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  historyItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  historyItemDetails: {
    marginBottom: 8,
  },
  historyItemDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemDateText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  historyItemReason: {
    fontSize: 14,
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
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
    marginBottom: 16,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
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
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  durationText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  reasonContainer: {
    marginBottom: 20,
  },
  reasonLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 50,
  },
  reasonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  leaveList: {
    paddingBottom: 16,
  },
  leaveCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leaveDates: {
    flex: 1,
  },
  leaveDateRange: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
  },
  leaveAppliedOn: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'System',
    marginLeft: 4,
  },
  leaveReason: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  reviewedBy: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
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
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
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
  modalSaveButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'System',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
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
});