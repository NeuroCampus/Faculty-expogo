import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import LoginScreen from '../screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import AttendanceScreen from '../screens/Attendance/AttendanceScreen';
import AnnouncementsScreen from '../screens/Announcements/AnnouncementsScreen';
import ProctorScreen from '../screens/Proctor/ProctorScreen';
import ProctorStudentDetailScreen from '../screens/Proctor/ProctorStudentDetailScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import UploadMarksScreen from '../screens/Marks/UploadMarksScreen';
import LeaveScreen from '../screens/Leave/LeaveScreen';
import TimetableScreen from '../screens/Timetable/TimetableScreen';
import AttendanceRecordsScreen from '../screens/Attendance/AttendanceRecordsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationCenterScreen from '../screens/Notifications/NotificationCenterScreen';
import FacultyStatsScreen from '../screens/Faculty/FacultyStatsScreen';
import GenerateStatisticsScreen from '../screens/Faculty/GenerateStatisticsScreen';
import ManageStudentLeaveScreen from '../screens/Leave/ManageStudentLeaveScreen';
import AssignmentsScreen from '../screens/Assignments/AssignmentsScreen';
import ExamsScreen from '../screens/Exams/ExamsScreen';
import ReportsScreen from '../screens/Reports/ReportsScreen';
import { AppHeader } from '../components/layout/AppHeader';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function TabNavigator() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }} />
      <Tabs.Screen name="Attendance" component={AttendanceScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" color={color} size={size} /> }} />
      <Tabs.Screen name="Announcements" component={AnnouncementsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} /> }} />
      <Tabs.Screen name="Proctor" component={ProctorScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} /> }} />
      <Tabs.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }} />
    </Tabs.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={({ navigation, route }: any) => ({ header: () => <AppHeader title={route.name} onMenu={() => navigation.openDrawer()} /> })}>
  <Drawer.Screen name="Home" component={TabNavigator} />
  <Drawer.Screen name="Upload Marks" component={UploadMarksScreen} />
      <Drawer.Screen name="Leave" component={LeaveScreen} />
      <Drawer.Screen name="Timetable" component={TimetableScreen} />
  <Drawer.Screen name="Attendance Records" component={AttendanceRecordsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Notification Center" component={NotificationCenterScreen} />
      <Drawer.Screen name="Faculty Stats" component={FacultyStatsScreen} />
      <Drawer.Screen name="Generate Statistics" component={GenerateStatisticsScreen} />
      <Drawer.Screen name="Manage Student Leave" component={ManageStudentLeaveScreen} />
  <Drawer.Screen name="Assignments" component={AssignmentsScreen} />
  <Drawer.Screen name="Exams" component={ExamsScreen} />
  <Drawer.Screen name="Reports" component={ReportsScreen} />
      <Drawer.Screen name="Proctor Student Detail" component={ProctorStudentDetailScreen} options={{ drawerItemStyle: { height: 0 } as any }} />
    </Drawer.Navigator>
  );
}

export default function RootNavigator() {
  const { loading, isAuthenticated, otpRequired } = useAuth();

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator />
        <View style={{ marginTop:8 }}>
          <Ionicons name="cloud-outline" size={20} color="#64748b" />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : otpRequired ? (
          <>
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
