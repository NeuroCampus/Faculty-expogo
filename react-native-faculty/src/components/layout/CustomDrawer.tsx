import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: string[];
}

const navigationItems: NavItem[] = [
  // Faculty Routes (based on current app structure)
  { label: 'Dashboard', route: 'Dashboard', icon: 'home', roles: ['faculty', 'teacher'] },
  { label: 'Take Attendance', route: 'Take Attendance', icon: 'checkbox', roles: ['faculty', 'teacher'] },

  { label: 'Apply Leave', route: 'Apply Leave', icon: 'document-text', roles: ['faculty', 'teacher'] },
  { label: 'Attendance Records', route: 'Attendance Records', icon: 'bar-chart', roles: ['faculty', 'teacher'] },
  { label: 'Announcements', route: 'Announcements', icon: 'megaphone', roles: ['faculty', 'teacher'] },
  { label: 'Proctor Students', route: 'Proctor Students', icon: 'people', roles: ['faculty', 'teacher'] },
  { label: 'Manage Student Leave', route: 'Manage Student Leave', icon: 'file-tray-full', roles: ['faculty', 'teacher'] },
  { label: 'Timetable', route: 'Timetable', icon: 'calendar', roles: ['faculty', 'teacher'] },
  { label: 'Profile', route: 'Profile', icon: 'person', roles: ['faculty', 'teacher'] },
  { label: 'Generate Statistics', route: 'Generate Statistics', icon: 'trending-up', roles: ['faculty', 'teacher'] },

];

interface CustomDrawerProps {
  state: any;
  navigation: any;
  descriptors: any;
}

export const CustomDrawer: React.FC<CustomDrawerProps> = ({ state, navigation, descriptors }) => {
  const { user, role, logoutUser, isAuthenticated } = useAuth();
  const [animations, setAnimations] = React.useState<Animated.Value[]>([]);
  const [userNavItems, setUserNavItems] = React.useState<NavItem[]>([]);

  React.useEffect(() => {
    if (isAuthenticated) {
      // Filter navigation items based on user role
      const filteredItems = navigationItems.filter(item => {
        if (!item.roles || !role) return true; // If no roles specified or no role set, show to all
        return item.roles.some(roleItem => roleItem.toLowerCase() === role.toLowerCase());
      });

      // Initialize animations for filtered items
      const newAnimations = filteredItems.map(() => new Animated.Value(0));
      setAnimations(newAnimations);
      setUserNavItems(filteredItems);

      // Start staggered animation
      const animations = newAnimations.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, animations).start();
    }
  }, [isAuthenticated, role]);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoTitle}>Please log in to continue</Text>
        </View>
      </View>
    );
  }

  // All navigation items are now properly filtered based on authentication and role

  if (userNavItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="school" size={24} color="#2563eb" />
            </View>
            <View style={styles.logoText}>
              <Text style={styles.logoTitle}>NeuroCampus</Text>
              <Text style={styles.logoSubtitle}>AMC College</Text>
            </View>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>No navigation items available</Text>
        </View>
      </View>
    );
  }  const handleNavigation = (routeName: string) => {
    navigation.dispatch(DrawerActions.closeDrawer());
    navigation.navigate(routeName);
  };

  const handleLogout = () => {
    logoutUser();
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const isActive = (routeName: string) => {
    return state.routes[state.index]?.name === routeName;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="school" size={24} color="#2563eb" />
          </View>
          <View style={styles.logoText}>
            <Text style={styles.logoTitle}>NeuroCampus</Text>
            <Text style={styles.logoSubtitle}>AMC College</Text>
          </View>
        </View>
      </View>

      {/* Navigation Items */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {userNavItems.map((item, index) => {
            const active = isActive(item.route);
            const animation = animations[index] || new Animated.Value(1);

            return (
              <Animated.View
                key={item.route}
                style={{
                  opacity: animation,
                  transform: [{
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  style={[styles.menuItem, active && styles.menuItemActive]}
                  onPress={() => handleNavigation(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={active ? '#fff' : '#64748b'}
                      />
                    </View>
                    <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
                      {item.label}
                    </Text>
                  </View>
                  {active && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.userProfile}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color="#64748b" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name || 'Faculty Member'}
            </Text>
            <Text style={styles.userRole}>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={18} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    flex: 1,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuContainer: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: '#2563eb',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
    flex: 1,
  },
  menuItemTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  activeIndicator: {
    width: 4,
    height: 24,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
});
