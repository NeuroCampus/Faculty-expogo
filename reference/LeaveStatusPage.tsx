
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LeaveStatusPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for leave requests
  const leaveRequests = [
    {
      id: 1,
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      type: 'Medical Leave',
      reason: 'Fever and cold symptoms',
      status: 'approved',
      appliedDate: '2024-01-18',
      approvedBy: 'Dr. Smith',
      approvedDate: '2024-01-19',
      days: 3
    },
    {
      id: 2,
      startDate: '2024-01-25',
      endDate: '2024-01-25',
      type: 'Personal Leave',
      reason: 'Family function attendance',
      status: 'pending',
      appliedDate: '2024-01-23',
      approvedBy: null,
      approvedDate: null,
      days: 1
    },
    {
      id: 3,
      startDate: '2024-01-15',
      endDate: '2024-01-16',
      type: 'Educational Purpose',
      reason: 'Technical symposium at sister college',
      status: 'approved',
      appliedDate: '2024-01-12',
      approvedBy: 'Prof. Johnson',
      approvedDate: '2024-01-13',
      days: 2
    },
    {
      id: 4,
      startDate: '2024-01-10',
      endDate: '2024-01-11',
      type: 'Family Emergency',
      reason: 'Grandfather hospitalization',
      status: 'rejected',
      appliedDate: '2024-01-09',
      approvedBy: 'Dr. Wilson',
      approvedDate: '2024-01-10',
      rejectionReason: 'Insufficient documentation provided',
      days: 2
    },
  ];

  const filteredRequests = leaveRequests.filter(request =>
    request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Approved',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-4 w-4" />
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-4 w-4" />
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="h-4 w-4" />
        };
    }
  };

  const statusCounts = {
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6 max-w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
              Leave Status
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Track the status of your leave applications
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 w-fit">
            <CheckSquare className="h-4 w-4" />
            {leaveRequests.length} Total Requests
          </Badge>
        </div>
      </motion.div>

      {/* Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search leave requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leave Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        {filteredRequests.map((request, index) => {
          const statusInfo = getStatusInfo(request.status);
          
          return (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{request.type}</CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()} ({request.days} day{request.days > 1 ? 's' : ''})
                      </CardDescription>
                    </div>
                    <Badge className={statusInfo.color}>
                      {statusInfo.icon}
                      <span className="ml-1">{statusInfo.label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Reason:</h4>
                      <p className="text-sm text-gray-600">{request.reason}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Applied: {new Date(request.appliedDate).toLocaleDateString()}</span>
                      </div>
                      
                      {request.status === 'approved' && request.approvedBy && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">Approved by: {request.approvedBy}</span>
                        </div>
                      )}
                      
                      {request.status === 'rejected' && request.approvedBy && (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-gray-600">Rejected by: {request.approvedBy}</span>
                        </div>
                      )}
                    </div>
                    
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <h4 className="font-medium text-sm text-red-800 mb-1">Rejection Reason:</h4>
                        <p className="text-sm text-red-700">{request.rejectionReason}</p>
                      </div>
                    )}
                    
                    {request.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-700">
                          Your leave request is under review. You will be notified once a decision is made.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filteredRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card>
              <CardContent className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No leave requests found</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LeaveStatusPage;
