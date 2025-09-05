
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCheck, Search, AlertTriangle, CheckCircle } from 'lucide-react';

const ProctorsPage: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('all');

  // Mock proctor assignments data
  const proctorAssignments = [
    {
      id: 1,
      faculty: 'Dr. Sarah Johnson',
      mentees: [
        { name: 'Alex Smith', usn: 'CS21001', attendance: 85, marks: 78, status: 'good' },
        { name: 'Emma Wilson', usn: 'CS21002', attendance: 92, marks: 85, status: 'excellent' },
        { name: 'John Davis', usn: 'CS21003', attendance: 65, marks: 72, status: 'warning' },
      ]
    },
    {
      id: 2,
      faculty: 'Prof. Michael Chen',
      mentees: [
        { name: 'Sarah Brown', usn: 'CS21004', attendance: 88, marks: 82, status: 'good' },
        { name: 'David Lee', usn: 'CS21005', attendance: 45, marks: 55, status: 'critical' },
        { name: 'Lisa Wang', usn: 'CS21006', attendance: 90, marks: 88, status: 'excellent' },
      ]
    },
    {
      id: 3,
      faculty: 'Dr. Emily Rodriguez',
      mentees: [
        { name: 'Mike Johnson', usn: 'CS21007', attendance: 78, marks: 75, status: 'good' },
        { name: 'Anna Taylor', usn: 'CS21008', attendance: 95, marks: 92, status: 'excellent' },
      ]
    },
  ];

  const filteredAssignments = proctorAssignments.filter(assignment => {
    const matchesFaculty = selectedFaculty === 'all' || assignment.faculty === selectedFaculty;
    const matchesSearch = searchTerm === '' || 
      assignment.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.mentees.some(mentee => 
        mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentee.usn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFaculty && matchesSearch;
  });

  const handleNewAssignment = () => {
    toast({
      title: "New Assignment",
      description: "New proctor assignment form would open here.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'warning': return 'outline';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
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
              Proctor Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Assign faculty members as student mentors and track progress
            </p>
          </div>
          <Button onClick={handleNewAssignment} className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            New Assignment
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search faculty or students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Faculty</SelectItem>
                  {proctorAssignments.map(assignment => (
                    <SelectItem key={assignment.id} value={assignment.faculty}>
                      {assignment.faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Proctor Assignments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {filteredAssignments.map((assignment, index) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {assignment.faculty}
                </CardTitle>
                <CardDescription>
                  Mentoring {assignment.mentees.length} students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {assignment.mentees.map((mentee, menteeIndex) => (
                    <motion.div
                      key={mentee.usn}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: menteeIndex * 0.1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{mentee.name}</h4>
                          <p className="text-sm text-gray-600">{mentee.usn}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(mentee.status)}
                          <Badge variant={getStatusColor(mentee.status)} className="text-xs">
                            {mentee.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Attendance:</span>
                          <span className={`text-sm font-medium ${
                            mentee.attendance >= 75 ? 'text-green-600' : 
                            mentee.attendance >= 65 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {mentee.attendance}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Marks:</span>
                          <span className={`text-sm font-medium ${
                            mentee.marks >= 80 ? 'text-green-600' : 
                            mentee.marks >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {mentee.marks}%
                          </span>
                        </div>
                        
                        {/* Progress bars */}
                        <div className="space-y-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                mentee.attendance >= 75 ? 'bg-green-500' : 
                                mentee.attendance >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${mentee.attendance}%` }}
                            ></div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                mentee.marks >= 80 ? 'bg-green-500' : 
                                mentee.marks >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${mentee.marks}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                        View Details
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mentees</p>
                <p className="text-2xl font-bold text-blue-600">
                  {proctorAssignments.reduce((total, assignment) => total + assignment.mentees.length, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Excellent</p>
                <p className="text-2xl font-bold text-green-600">
                  {proctorAssignments.reduce((total, assignment) => 
                    total + assignment.mentees.filter(m => m.status === 'excellent').length, 0
                  )}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {proctorAssignments.reduce((total, assignment) => 
                    total + assignment.mentees.filter(m => m.status === 'warning').length, 0
                  )}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {proctorAssignments.reduce((total, assignment) => 
                    total + assignment.mentees.filter(m => m.status === 'critical').length, 0
                  )}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProctorsPage;
