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
import { getProctorStudents, manageStudentLeave } from '../../api/faculty';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface LeaveRequest {
  id: string;
  student_name: string;
  usn: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  applied_on?: string;
}

export default function ManageStudentLeaveScreen() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    setLoading(true);
    try {
      const result = await getProctorStudents();
      if (result.success) {
        const allRequests: LeaveRequest[] = [];
        (result.data || []).forEach((student: any) => {
          if (student.leave_requests && Array.isArray(student.leave_requests)) {
            student.leave_requests.forEach((request: any) => {
              allRequests.push({
                ...request,
                student_name: student.name,
                usn: student.usn
              });
            });
          }
        });
        setLeaveRequests(allRequests);
      } else {
        Alert.alert('Error', result.message || 'Failed to load leave requests');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load leave requests');
    }
    setLoading(false);
  };

  const handleLeaveAction = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(requestId);
    try {
      const result = await manageStudentLeave({
        leave_id: requestId,
        action
      });

      if (result.success) {
        Alert.alert(
          'Success', 
          `Leave request ${action.toLowerCase()}d successfully`
        );
        loadLeaveRequests();
        setShowDetailsModal(false);
        setSelectedRequest(null);
      } else {
        Alert.alert('Error', result.message || `Failed to ${action.toLowerCase()} leave request`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to ${action.toLowerCase()} leave request`);
    }
    setActionLoading(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (status) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && request.status === filterStatus.toUpperCase();
  });

  const calculateStats = () => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(r => r.status === 'PENDING').length;
    const approved = leaveRequests.filter(r => r.status === 'APPROVED').length;
    const rejected = leaveRequests.filter(r => r.status === 'REJECTED').length;

    return { total, pending, approved, rejected };
  };

  const stats = calculateStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Student Leave</Text>
        <Text style={styles.headerSubtitle}>Approve or reject student leave requests</Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#d97706' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student name, USN, or reason..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'approved', label: 'Approved' },
              { key: 'rejected', label: 'Rejected' }
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
        </ScrollView>
      </View>

      {/* Leave Requests List */}
      <View style={styles.section}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading leave requests...</Text>
          </View>
        ) : filteredRequests.length > 0 ? (
          <FlatList
            data={filteredRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.leaveCard}
                onPress={() => {
                  setSelectedRequest(item);
                  setShowDetailsModal(true);
                }}
              >
                <View style={styles.leaveHeader}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.student_name}</Text>
                    <Text style={styles.studentUSN}>{item.usn}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(item.status) + '20' }
                  ]}>
                    <Ionicons 
                      name={getStatusIcon(item.status) as any} 
                      size={16} 
                      color={getStatusColor(item.status)} 
                    />
                    <Text style={[
                      styles.statusText, 
                      { color: getStatusColor(item.status) }
                    ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.leaveDetails}>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar" size={16} color="#64748b" />
                    <Text style={styles.dateText}>
                      {formatDate(item.start_date)} - {formatDate(item.end_date)}
                    </Text>
                    <Text style={styles.daysText}>
                      ({calculateDays(item.start_date, item.end_date)} days)
                    </Text>
                  </View>
                  
                  <Text style={styles.reasonText} numberOfLines={2}>
                    {item.reason}
                  </Text>
                </View>

                {item.status === 'PENDING' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleLeaveAction(item.id, 'APPROVE')}
                      disabled={actionLoading === item.id}
                    >
                      {actionLoading === item.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleLeaveAction(item.id, 'REJECT')}
                      disabled={actionLoading === item.id}
                    >
                      {actionLoading === item.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="close" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>Reject</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.leaveList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No leave requests found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No student leave requests available'}
            </Text>
          </View>
        )}
      </View>

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Leave Request Details</Text>
            
            {selectedRequest && (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Student Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.student_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>USN:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.usn}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Leave Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Start Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedRequest.start_date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>End Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedRequest.end_date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Duration:</Text>
                    <Text style={styles.detailValue}>
                      {calculateDays(selectedRequest.start_date, selectedRequest.end_date)} days
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Status:</Text>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: getStatusColor(selectedRequest.status) + '20' }
                    ]}>
                      <Ionicons 
                        name={getStatusIcon(selectedRequest.status) as any} 
                        size={16} 
                        color={getStatusColor(selectedRequest.status)} 
                      />
                      <Text style={[
                        styles.statusText, 
                        { color: getStatusColor(selectedRequest.status) }
                      ]}>
                        {selectedRequest.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Reason</Text>
                  <Text style={styles.reasonDetail}>{selectedRequest.reason}</Text>
                </View>
              </ScrollView>
            )}

            {selectedRequest?.status === 'PENDING' && (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalApproveButton]}
                  onPress={() => handleLeaveAction(selectedRequest.id, 'APPROVE')}
                  disabled={actionLoading === selectedRequest.id}
                >
                  {actionLoading === selectedRequest.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.modalActionButtonText}>Approve</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalRejectButton]}
                  onPress={() => handleLeaveAction(selectedRequest.id, 'REJECT')}
                  disabled={actionLoading === selectedRequest.id}
                >
                  {actionLoading === selectedRequest.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="close" size={20} color="#fff" />
                      <Text style={styles.modalActionButtonText}>Reject</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.modalCancelText}>Close</Text>
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
  leaveList: {
    paddingBottom: 16,
  },
  leaveCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  leaveHeader: {
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
  leaveDetails: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 6,
  },
  daysText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  reasonText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#059669',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'System',
    marginLeft: 6,
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
    maxHeight: '80%',
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
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 14,
    color: '#64748b',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  reasonDetail: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  modalApproveButton: {
    backgroundColor: '#059669',
  },
  modalRejectButton: {
    backgroundColor: '#dc2626',
  },
  modalActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'System',
    marginLeft: 8,
  },
  modalCancel: {
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
});