import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  TextInput
} from 'react-native';
import { getFacultyAssignments } from '../../api/faculty';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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

interface SubjectPerformance {
  subject: string;
  attendance: number;
  marks: number;
  students: number;
}

interface AttendanceTrend {
  month: string;
  attendance: number;
}

interface GradeDistribution {
  grade: string;
  count: number;
  color: string;
}

export default function GenerateStatisticsScreen() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedClass, setSelectedClass] = useState<Assignment | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // Mock data for charts
  const subjects = ['Computer Networks', 'Database Systems', 'Operating Systems', 'Software Engineering'];

  const subjectPerformanceData: SubjectPerformance[] = [
    { subject: 'Computer Networks', attendance: 88, marks: 85, students: 45 },
    { subject: 'Database Systems', attendance: 90, marks: 82, students: 42 },
    { subject: 'Operating Systems', attendance: 87, marks: 78, students: 48 },
    { subject: 'Software Engineering', attendance: 92, marks: 88, students: 40 },
  ];

  const attendanceTrendData: AttendanceTrend[] = [
    { month: 'Jan', attendance: 85 },
    { month: 'Feb', attendance: 88 },
    { month: 'Mar', attendance: 92 },
    { month: 'Apr', attendance: 87 },
    { month: 'May', attendance: 90 },
    { month: 'Jun', attendance: 89 },
  ];

  const gradeDistributionData: GradeDistribution[] = [
    { grade: 'A+', count: 12, color: '#22c55e' },
    { grade: 'A', count: 18, color: '#3b82f6' },
    { grade: 'B+', count: 15, color: '#f59e0b' },
    { grade: 'B', count: 8, color: '#ef4444' },
    { grade: 'C', count: 3, color: '#6b7280' },
  ];

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

  const handleExport = (format: 'pdf' | 'excel') => {
    Alert.alert('Export Started', `Statistics are being exported to ${format.toUpperCase()}.`);
  };

  const handleGenerateReport = () => {
    if (!selectedSubject && !selectedSemester) {
      Alert.alert('Generate Report', 'Generating comprehensive statistics report for all subjects.');
    } else {
      Alert.alert('Generate Report', `Generating report for ${selectedSubject || 'all subjects'} ${selectedSemester ? `(Semester ${selectedSemester})` : ''}`);
    }
  };

  const filteredData = selectedSubject
    ? subjectPerformanceData.filter(item => item.subject === selectedSubject)
    : subjectPerformanceData;

  const renderBarChart = (data: SubjectPerformance[], maxValue: number) => {
    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barGroup}>
            <Text style={styles.barLabel}>{item.subject.split(' ')[0]}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${(item.attendance / maxValue) * 100}%`,
                    backgroundColor: '#3b82f6'
                  }
                ]}
              />
              <Text style={styles.barValue}>{item.attendance}%</Text>
            </View>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${(item.marks / maxValue) * 100}%`,
                    backgroundColor: '#10b981'
                  }
                ]}
              />
              <Text style={styles.barValue}>{item.marks}%</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderLineChart = (data: AttendanceTrend[]) => {
    const maxAttendance = Math.max(...data.map(d => d.attendance));
    const minAttendance = Math.min(...data.map(d => d.attendance));

    return (
      <View style={styles.lineChartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.linePoint}>
            <Text style={styles.lineLabel}>{item.month}</Text>
            <View style={styles.lineBar}>
              <View
                style={[
                  styles.lineFill,
                  {
                    height: `${((item.attendance - minAttendance) / (maxAttendance - minAttendance)) * 100}%`,
                    backgroundColor: '#3b82f6'
                  }
                ]}
              />
            </View>
            <Text style={styles.lineValue}>{item.attendance}%</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPieChart = (data: GradeDistribution[]) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            return (
              <View key={index} style={styles.pieSegment}>
                <View
                  style={[
                    styles.pieSlice,
                    {
                      backgroundColor: item.color,
                      width: `${percentage}%`
                    }
                  ]}
                />
                <Text style={styles.pieLabel}>{item.grade}: {item.count}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.pieLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.grade}: {item.count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Generate Statistics</Text>
          <Text style={styles.headerSubtitle}>View and export detailed performance statistics</Text>
        </View>
        <View style={styles.headerBadge}>
          <Ionicons name="bar-chart" size={16} color="#2563eb" />
          <Text style={styles.headerBadgeText}>Academic Analytics</Text>
        </View>
      </View>

      {/* Filters and Export */}
      <View style={styles.filtersCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="filter" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Filters & Export</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.filtersGrid}>
            <TouchableOpacity
              style={styles.filterSelector}
              onPress={() => setShowSubjectModal(true)}
            >
              <Ionicons name="book" size={20} color="#2563eb" />
              <View style={styles.filterText}>
                <Text style={styles.filterLabel}>Subject</Text>
                <Text style={styles.filterValue}>
                  {selectedSubject || 'All Subjects'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterSelector}
              onPress={() => setShowSemesterModal(true)}
            >
              <Ionicons name="school" size={20} color="#2563eb" />
              <View style={styles.filterText}>
                <Text style={styles.filterLabel}>Semester</Text>
                <Text style={styles.filterValue}>
                  {selectedSemester ? `Semester ${selectedSemester}` : 'All Semesters'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateReport}
            >
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text style={styles.generateButtonText}>Generate Report</Text>
            </TouchableOpacity>

            <View style={styles.exportButtons}>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExport('pdf')}
              >
                <Ionicons name="download" size={16} color="#fff" />
                <Text style={styles.exportButtonText}>PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExport('excel')}
              >
                <Ionicons name="download" size={16} color="#fff" />
                <Text style={styles.exportButtonText}>Excel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Subject Performance Chart */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="bar-chart" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Subject Performance Overview</Text>
          </View>
          <Text style={styles.cardDescription}>
            Comparison of attendance and marks across subjects
          </Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.legendText}>Attendance %</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Average Marks %</Text>
            </View>
          </View>
          {renderBarChart(filteredData, 100)}
        </View>
      </View>

      {/* Attendance Trend Chart */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="trending-up" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Attendance Trend</Text>
          </View>
          <Text style={styles.cardDescription}>
            Monthly attendance percentage trend
          </Text>
        </View>

        <View style={styles.cardContent}>
          {renderLineChart(attendanceTrendData)}
        </View>
      </View>

      {/* Grade Distribution Chart */}
      <View style={styles.chartCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="pie-chart" size={20} color="#2563eb" />
            <Text style={styles.cardTitle}>Grade Distribution</Text>
          </View>
          <Text style={styles.cardDescription}>
            Overall grade distribution across all subjects
          </Text>
        </View>

        <View style={styles.cardContent}>
          {renderPieChart(gradeDistributionData)}
        </View>
      </View>

      {/* Summary Statistics */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#10b98120' }]}>
            <Ionicons name="trending-up" size={24} color="#10b981" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>89.2%</Text>
            <Text style={styles.statLabel}>Average Attendance</Text>
            <Text style={styles.statChange}>↑ 2.3% from last month</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#3b82f620' }]}>
            <Ionicons name="school" size={24} color="#3b82f6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>83.2%</Text>
            <Text style={styles.statLabel}>Average Marks</Text>
            <Text style={styles.statChange}>↑ 1.8% from last month</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#8b5cf620' }]}>
            <Ionicons name="people" size={24} color="#8b5cf6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>175</Text>
            <Text style={styles.statLabel}>Total Students</Text>
            <Text style={styles.statChange}>Active students</Text>
          </View>
        </View>
      </View>

      {/* Modals */}
      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subject</Text>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedSubject('');
                  setShowSubjectModal(false);
                }}
              >
                <Text style={styles.modalItemText}>All Subjects</Text>
                {!selectedSubject && <Ionicons name="checkmark" size={24} color="#2563eb" />}
              </TouchableOpacity>
              {subjects.map(subject => (
                <TouchableOpacity
                  key={subject}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSubject(subject);
                    setShowSubjectModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{subject}</Text>
                  {selectedSubject === subject && <Ionicons name="checkmark" size={24} color="#2563eb" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSubjectModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Semester Selection Modal */}
      <Modal
        visible={showSemesterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSemesterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Semester</Text>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedSemester('');
                  setShowSemesterModal(false);
                }}
              >
                <Text style={styles.modalItemText}>All Semesters</Text>
                {!selectedSemester && <Ionicons name="checkmark" size={24} color="#2563eb" />}
              </TouchableOpacity>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <TouchableOpacity
                  key={sem}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedSemester(sem.toString());
                    setShowSemesterModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>Semester {sem}</Text>
                  {selectedSemester === sem.toString() && <Ionicons name="checkmark" size={24} color="#2563eb" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSemesterModal(false)}
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
  chartCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
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
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  filterText: {
    flex: 1,
    marginLeft: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  filterValue: {
    fontSize: 16,
    color: '#1e293b',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    padding: 10,
    borderRadius: 6,
    gap: 4,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 16,
  },
  barGroup: {
    marginBottom: 16,
  },
  barLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bar: {
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  barValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
    minWidth: 35,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#64748b',
  },
  lineChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingVertical: 20,
  },
  linePoint: {
    alignItems: 'center',
    flex: 1,
  },
  lineLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  lineBar: {
    height: 120,
    width: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    justifyContent: 'flex-end',
  },
  lineFill: {
    borderRadius: 2,
  },
  lineValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
    marginTop: 8,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
    overflow: 'hidden',
  },
  pieSegment: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pieSlice: {
    height: '100%',
  },
  pieLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  pieLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
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
  statChange: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
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
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1e293b',
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
});
