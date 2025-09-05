
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Edit, Plus } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

const TimetablePage: React.FC = () => {
  const { toast } = useToast();
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  // Mock timetable data
  const timetableData = [
    { id: 1, day: 'Monday', time: '09:00-10:30', subject: 'Data Structures', faculty: 'Dr. Smith', room: 'CS-101', semester: 3, section: 'A' },
    { id: 2, day: 'Monday', time: '10:45-12:15', subject: 'Computer Networks', faculty: 'Prof. Johnson', room: 'CS-102', semester: 5, section: 'A' },
    { id: 3, day: 'Tuesday', time: '09:00-10:30', subject: 'Database Systems', faculty: 'Dr. Wilson', room: 'CS-103', semester: 4, section: 'B' },
    { id: 4, day: 'Wednesday', time: '14:00-15:30', subject: 'Operating Systems', faculty: 'Prof. Davis', room: 'CS-104', semester: 4, section: 'A' },
    { id: 5, day: 'Thursday', time: '11:00-12:30', subject: 'Software Engineering', faculty: 'Dr. Brown', room: 'CS-105', semester: 6, section: 'A' },
  ];

  const filteredTimetable = timetableData.filter(entry => {
    if (selectedSemester !== 'all' && entry.semester.toString() !== selectedSemester) return false;
    if (selectedSection !== 'all' && entry.section !== selectedSection) return false;
    return true;
  });

  const handleScheduleClass = () => {
    toast({
      title: "Schedule Class",
      description: "New class scheduling form would open here.",
    });
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['09:00-10:30', '10:45-12:15', '13:15-14:45', '14:00-15:30', '15:45-17:15'];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight text-gray-900 truncate">
                Timetable Management
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
                Manage class schedules with clash detection
              </p>
            </div>
            <Button onClick={handleScheduleClass} className="flex items-center gap-2 w-fit text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Schedule Class
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
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timetable Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Weekly Timetable
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View and manage class schedules across the week
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <ScrollArea className="w-full">
                  <div className="min-w-[900px] p-4">
                    {/* Header Row */}
                    <div className="grid grid-cols-6 gap-2 mb-4 sticky top-0 bg-white z-10">
                      <div className="font-semibold text-center p-3 text-sm bg-gray-100 rounded border">
                        Time
                      </div>
                      {days.map(day => (
                        <div key={day} className="font-semibold text-center p-3 bg-blue-50 rounded border text-sm">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Time Slots */}
                    <div className="space-y-2">
                      {timeSlots.map(timeSlot => (
                        <div key={timeSlot} className="grid grid-cols-6 gap-2">
                          <div className="font-medium text-sm p-3 bg-gray-50 rounded border text-center flex items-center justify-center min-h-[100px]">
                            <span className="transform -rotate-90 sm:rotate-0 whitespace-nowrap">
                              {timeSlot}
                            </span>
                          </div>
                          {days.map(day => {
                            const classForSlot = filteredTimetable.find(
                              entry => entry.day === day && entry.time === timeSlot
                            );
                            return (
                              <div key={`${day}-${timeSlot}`} className="min-h-[100px] border rounded p-3 bg-white hover:bg-gray-50 transition-colors">
                                {classForSlot ? (
                                  <div className="space-y-2 h-full flex flex-col">
                                    <div className="font-medium text-sm text-blue-600 line-clamp-2">
                                      {classForSlot.subject}
                                    </div>
                                    <div className="text-xs text-gray-600 line-clamp-1">
                                      {classForSlot.faculty}
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                      {classForSlot.room}
                                    </div>
                                    <div className="mt-auto">
                                      <Badge variant="outline" className="text-xs">
                                        Sem {classForSlot.semester}-{classForSlot.section}
                                      </Badge>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center">
                                    <Button variant="ghost" size="sm" className="text-xs h-8 w-8 p-0 hover:bg-blue-50">
                                      <Plus className="h-4 w-4 text-gray-400" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Changes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Recent Schedule Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTimetable.slice(0, 3).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{entry.subject}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {entry.day}, {entry.time} • {entry.faculty} • {entry.room}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2 flex-shrink-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TimetablePage;
