
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';

const AIAttendance: React.FC = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState(0);

  const handleStartCamera = () => {
    setCameraActive(true);
  };

  const handleTakeAttendance = () => {
    setProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setProcessing(false);
      setAttendanceCount(Math.floor(Math.random() * 30) + 15); // Random between 15-45
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">AI-Powered Attendance</h3>
        <div className="flex items-center space-x-2">
          {!cameraActive ? (
            <Button onClick={handleStartCamera}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Start Camera
            </Button>
          ) : (
            <Button onClick={handleTakeAttendance} disabled={processing}>
              {processing ? 'Processing...' : 'Take Attendance'}
            </Button>
          )}
        </div>
      </div>

      <Card className="border-2 border-dashed">
        <CardContent className="p-6">
          {!cameraActive ? (
            <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px]">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-center">
                Click "Start Camera" to begin face recognition attendance
              </p>
              <p className="text-xs text-gray-400 mt-2 max-w-md text-center">
                Our AI system will automatically detect and mark students present in the classroom
              </p>
            </div>
          ) : processing ? (
            <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px]">
              <div className="h-16 w-16 rounded-full neurocampus-gradient animate-pulse-soft flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Processing Attendance</p>
              <p className="text-xs text-gray-500 mt-2">Recognizing faces and marking attendance...</p>
            </div>
          ) : attendanceCount > 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px]">
              <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700 font-medium">Attendance Completed</p>
              <p className="text-lg text-green-600 font-bold mt-1">{attendanceCount} Students Present</p>
              <Button variant="outline" className="mt-4" onClick={() => setCameraActive(false)}>
                Reset Camera
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px]">
              <div className="bg-gray-800 h-full w-full max-w-md mx-auto relative rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white">Camera feed would display here</p>
                </div>
                <div className="absolute bottom-3 left-3 bg-red-500 h-3 w-3 rounded-full animate-pulse"></div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-white">
                  AI Mode Active
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {attendanceCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Students</span>
                <span>{attendanceCount + Math.floor(Math.random() * 10)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Present</span>
                <span className="text-green-600">{attendanceCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Absent</span>
                <span className="text-red-600">{Math.floor(Math.random() * 10)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Attendance Rate</span>
                <span className="text-blue-600">{Math.floor(80 + Math.random() * 15)}%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button variant="outline" className="mr-2">Download Report</Button>
            <Button>Save Attendance</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

const ManualAttendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<Array<{ id: number, name: string, present: boolean }>>([]);
  
  // Populate sample student data when class is selected
  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    
    if (classId) {
      // Generate sample student data
      const sampleStudents = Array(20).fill(0).map((_, idx) => ({
        id: idx + 1,
        name: `Student ${idx + 1}`,
        present: false
      }));
      setStudents(sampleStudents);
    } else {
      setStudents([]);
    }
  };
  
  // Toggle student attendance status
  const toggleAttendance = (id: number) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, present: !student.present } : student
    ));
  };
  
  // Mark all students as present
  const markAllPresent = () => {
    setStudents(students.map(student => ({ ...student, present: true })));
  };
  
  // Mark all students as absent
  const markAllAbsent = () => {
    setStudents(students.map(student => ({ ...student, present: false })));
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Manual Attendance</h3>
        
        <div className="flex items-center space-x-2">
          <select 
            value={selectedClass}
            onChange={handleClassChange}
            className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select a class...</option>
            <option value="cs101">CS101: Introduction to Programming</option>
            <option value="cs202">CS202: Data Structures</option>
            <option value="cs305">CS305: Algorithms</option>
            <option value="cs341">CS341: AI and Machine Learning</option>
          </select>
        </div>
      </div>
      
      {selectedClass ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Student Attendance Sheet</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={markAllPresent}>Mark All Present</Button>
              <Button size="sm" variant="outline" onClick={markAllAbsent}>Mark All Absent</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-sm">ID</th>
                    <th className="text-left py-2 font-medium text-sm">Name</th>
                    <th className="text-center py-2 font-medium text-sm">Present</th>
                    <th className="text-center py-2 font-medium text-sm">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 text-sm">{student.id}</td>
                      <td className="py-2 text-sm">{student.name}</td>
                      <td className="py-2 text-center">
                        <input 
                          type="radio"
                          name={`attendance-${student.id}`}
                          checked={student.present}
                          onChange={() => toggleAttendance(student.id)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                      </td>
                      <td className="py-2 text-center">
                        <input 
                          type="radio"
                          name={`attendance-${student.id}`}
                          checked={!student.present}
                          onChange={() => toggleAttendance(student.id)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm">
              {students.filter(s => s.present).length} of {students.length} students present
              ({Math.round((students.filter(s => s.present).length / students.length) * 100)}%)
            </div>
            <Button>Save Attendance</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center h-[300px]">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-center">
              Please select a class to take attendance
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AttendanceReports: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Attendance Reports</h3>
        <div className="flex items-center space-x-2">
          <Input 
            type="date" 
            className="text-sm h-9"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Monthly attendance rates across all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500">Attendance Trend Chart</p>
                <p className="text-xs text-gray-400 mt-1">Data visualization will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>
              Course attendance statistics for this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { course: 'CS101: Introduction to Programming', attendance: '95.2%', sessions: 12, trend: 'up' },
                { course: 'CS202: Data Structures', attendance: '87.8%', sessions: 10, trend: 'down' },
                { course: 'CS305: Algorithms', attendance: '92.1%', sessions: 8, trend: 'up' },
                { course: 'CS341: AI and Machine Learning', attendance: '89.5%', sessions: 6, trend: 'stable' },
              ].map((course, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{course.course}</p>
                    <p className="text-xs text-gray-500">{course.sessions} sessions</p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-sm">{course.attendance}</span>
                    <div className="ml-2">
                      {course.trend === 'up' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      ) : course.trend === 'down' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'faculty' || user?.role === 'admin' || user?.role === 'hod';
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Attendance Management</h1>
        <div className="mt-2 md:mt-0">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      <Tabs defaultValue={isTeacher ? "manual" : "reports"}>
        <TabsList className="grid w-full grid-cols-3">
          {isTeacher && <TabsTrigger value="ai">AI Attendance</TabsTrigger>}
          {isTeacher && <TabsTrigger value="manual">Manual Attendance</TabsTrigger>}
          <TabsTrigger value="reports" className={isTeacher ? "" : "col-span-3"}>Reports</TabsTrigger>
        </TabsList>
        {isTeacher && (
          <TabsContent value="ai" className="mt-4">
            <AIAttendance />
          </TabsContent>
        )}
        {isTeacher && (
          <TabsContent value="manual" className="mt-4">
            <ManualAttendance />
          </TabsContent>
        )}
        <TabsContent value="reports" className="mt-4">
          <AttendanceReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendancePage;
