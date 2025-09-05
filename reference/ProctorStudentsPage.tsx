
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, MessageCircle, TrendingUp, TrendingDown, Minus, Phone, Mail } from 'lucide-react';

const ProctorStudentsPage: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock data
  const students = [
    {
      id: 1,
      name: 'John Doe',
      usn: 'CS21001',
      semester: 6,
      status: 'good',
      attendance: 92,
      marks: 85,
      phone: '+91 9876543210',
      email: 'john.doe@college.edu',
      lastContact: '2024-01-20'
    },
    {
      id: 2,
      name: 'Jane Smith',
      usn: 'CS21002',
      semester: 6,
      status: 'at-risk',
      attendance: 68,
      marks: 65,
      phone: '+91 9876543211',
      email: 'jane.smith@college.edu',
      lastContact: '2024-01-18'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      usn: 'CS21003',
      semester: 6,
      status: 'average',
      attendance: 78,
      marks: 72,
      phone: '+91 9876543212',
      email: 'mike.johnson@college.edu',
      lastContact: '2024-01-22'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      usn: 'CS21004',
      semester: 6,
      status: 'good',
      attendance: 95,
      marks: 88,
      phone: '+91 9876543213',
      email: 'sarah.wilson@college.edu',
      lastContact: '2024-01-21'
    },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'good':
        return {
          label: 'Good',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <TrendingUp className="h-4 w-4" />
        };
      case 'average':
        return {
          label: 'Average',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Minus className="h-4 w-4" />
        };
      case 'at-risk':
        return {
          label: 'At Risk',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <TrendingDown className="h-4 w-4" />
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Minus className="h-4 w-4" />
        };
    }
  };

  const handleContact = (student: any, method: 'phone' | 'email') => {
    toast({
      title: "Contact Initiated",
      description: `Contacting ${student.name} via ${method}`,
    });
  };

  const handleScheduleMeeting = (student: any) => {
    toast({
      title: "Meeting Scheduled",
      description: `Meeting scheduled with ${student.name}`,
    });
  };

  const statusCounts = {
    good: students.filter(s => s.status === 'good').length,
    average: students.filter(s => s.status === 'average').length,
    atRisk: students.filter(s => s.status === 'at-risk').length,
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
              Proctor Students
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Monitor and manage your assigned mentee students
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 w-fit">
            <Users className="h-4 w-4" />
            {students.length} Students
          </Badge>
        </div>
      </motion.div>

      {/* Summary Cards */}
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
                <p className="text-sm text-gray-600">Good Performance</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.good}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Performance</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.average}</p>
              </div>
              <Minus className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.atRisk}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
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
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Student Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {filteredStudents.map((student, index) => {
          const statusInfo = getStatusInfo(student.status);
          
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>{student.usn} • Semester {student.semester}</CardDescription>
                    </div>
                    <Badge className={statusInfo.color}>
                      {statusInfo.icon}
                      <span className="ml-1">{statusInfo.label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Attendance</p>
                        <p className="text-xl font-bold text-blue-600">{student.attendance}%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Avg Marks</p>
                        <p className="text-xl font-bold text-purple-600">{student.marks}%</p>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{student.phone}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium truncate">{student.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Contact:</span>
                        <span className="font-medium">{new Date(student.lastContact).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleContact(student, 'phone')}
                        className="flex-1 sm:flex-none"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleContact(student, 'email')}
                        className="flex-1 sm:flex-none"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleScheduleMeeting(student)}
                        className="flex-1 sm:flex-none"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filteredStudents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full"
          >
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No students found</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProctorStudentsPage;
