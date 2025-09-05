
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Clock, Check, X, Eye } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface LeaveApplication {
  id: number;
  studentName: string;
  usn: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  documents: string[];
  rejectionReason?: string;
}

const ManageStudentLeavePage: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Use local storage for persistent data
  const [leaveApplications, setLeaveApplications] = useLocalStorage<LeaveApplication[]>('leaveApplications', [
    {
      id: 1,
      studentName: 'John Doe',
      usn: 'CS21001',
      leaveType: 'Medical',
      startDate: '2024-01-25',
      endDate: '2024-01-27',
      reason: 'Fever and need to rest at home as advised by doctor',
      status: 'pending',
      appliedDate: '2024-01-23',
      documents: ['medical_certificate.pdf']
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      usn: 'CS21002',
      leaveType: 'Personal',
      startDate: '2024-01-30',
      endDate: '2024-01-30',
      reason: 'Family function attendance required',
      status: 'approved',
      appliedDate: '2024-01-20',
      documents: []
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      usn: 'CS21003',
      leaveType: 'Emergency',
      startDate: '2024-01-28',
      endDate: '2024-01-29',
      reason: 'Family emergency - need to travel immediately',
      status: 'rejected',
      appliedDate: '2024-01-27',
      documents: [],
      rejectionReason: 'Insufficient notice period'
    },
    {
      id: 4,
      studentName: 'Sarah Wilson',
      usn: 'CS21004',
      leaveType: 'Medical',
      startDate: '2024-02-01',
      endDate: '2024-02-03',
      reason: 'Surgery scheduled and recovery time needed',
      status: 'pending',
      appliedDate: '2024-01-24',
      documents: ['surgery_appointment.pdf', 'doctor_note.pdf']
    },
  ]);

  const filteredApplications = leaveApplications.filter(app => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.usn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800' };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleApprove = (application: LeaveApplication) => {
    setLeaveApplications(prev => 
      prev.map(app => 
        app.id === application.id 
          ? { ...app, status: 'approved' as const }
          : app
      )
    );
    toast({
      title: "Leave Approved",
      description: `Leave application for ${application.studentName} has been approved.`,
    });
  };

  const handleReject = (application: LeaveApplication) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting the leave application.",
        variant: "destructive"
      });
      return;
    }

    setLeaveApplications(prev => 
      prev.map(app => 
        app.id === application.id 
          ? { ...app, status: 'rejected' as const, rejectionReason }
          : app
      )
    );
    
    toast({
      title: "Leave Rejected",
      description: `Leave application for ${application.studentName} has been rejected.`,
      variant: "destructive"
    });
    
    setRejectionReason('');
    setIsRejectDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleViewDetails = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setIsDetailDialogOpen(true);
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const statusCounts = {
    pending: leaveApplications.filter(app => app.status === 'pending').length,
    approved: leaveApplications.filter(app => app.status === 'approved').length,
    rejected: leaveApplications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 truncate">
                Manage Student Leaves
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                Review and manage student leave applications
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 w-fit flex-shrink-0 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              {statusCounts.pending} Pending
            </Badge>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Approved</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{statusCounts.approved}</p>
                </div>
                <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
                </div>
                <X className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leave Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-3 sm:space-y-4"
        >
          {filteredApplications.map((application, index) => {
            const statusInfo = getStatusInfo(application.status);
            const totalDays = calculateDays(application.startDate, application.endDate);
            
            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{application.studentName}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm truncate">
                          {application.usn} • {application.leaveType} Leave • {totalDays} day{totalDays > 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <Badge className={`${statusInfo.color} text-xs flex-shrink-0`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Leave Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Leave Period</p>
                          <p className="font-medium text-xs sm:text-sm truncate">
                            {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Applied On</p>
                          <p className="font-medium text-xs sm:text-sm">{new Date(application.appliedDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Reason</p>
                        <ScrollArea className="max-h-20">
                          <p className="text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm">{application.reason}</p>
                        </ScrollArea>
                      </div>

                      {/* Documents */}
                      {application.documents.length > 0 && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">Attached Documents</p>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {application.documents.map((doc, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs truncate max-w-[200px]">{doc}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {application.status === 'rejected' && application.rejectionReason && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">Rejection Reason</p>
                          <p className="text-red-700 bg-red-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm">{application.rejectionReason}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(application)}
                          className="flex-1 sm:flex-none text-xs sm:text-sm min-w-0"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">Details</span>
                        </Button>
                        
                        {application.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleApprove(application)}
                              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-xs sm:text-sm min-w-0"
                            >
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">Approve</span>
                            </Button>
                            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => setSelectedApplication(application)}
                                  className="flex-1 sm:flex-none text-xs sm:text-sm min-w-0"
                                >
                                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">Reject</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Leave Application</DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for rejecting {selectedApplication?.studentName}'s leave application.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                    <Textarea
                                      id="rejectionReason"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Enter reason for rejection..."
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => {
                                      setIsRejectDialogOpen(false);
                                      setRejectionReason('');
                                      setSelectedApplication(null);
                                    }}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => selectedApplication && handleReject(selectedApplication)}
                                    >
                                      Reject Application
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {filteredApplications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card>
                <CardContent className="text-center py-6 sm:py-8">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm sm:text-base">No leave applications found</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Application Details</DialogTitle>
            <DialogDescription>
              Complete information about the leave application
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student Name</Label>
                  <p className="font-medium">{selectedApplication.studentName}</p>
                </div>
                <div>
                  <Label>USN</Label>
                  <p className="font-medium">{selectedApplication.usn}</p>
                </div>
                <div>
                  <Label>Leave Type</Label>
                  <p className="font-medium">{selectedApplication.leaveType}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusInfo(selectedApplication.status).color}>
                    {getStatusInfo(selectedApplication.status).label}
                  </Badge>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <p className="font-medium">{new Date(selectedApplication.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>End Date</Label>
                  <p className="font-medium">{new Date(selectedApplication.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Applied Date</Label>
                  <p className="font-medium">{new Date(selectedApplication.appliedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Total Days</Label>
                  <p className="font-medium">{calculateDays(selectedApplication.startDate, selectedApplication.endDate)}</p>
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedApplication.reason}</p>
              </div>
              {selectedApplication.documents.length > 0 && (
                <div>
                  <Label>Documents</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedApplication.documents.map((doc, idx) => (
                      <Badge key={idx} variant="outline">{doc}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedApplication.rejectionReason && (
                <div>
                  <Label>Rejection Reason</Label>
                  <p className="mt-1 p-3 bg-red-50 text-red-700 rounded-md">{selectedApplication.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageStudentLeavePage;
