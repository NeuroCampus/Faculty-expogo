import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export const AppHeader: React.FC<{ title: string; onMenu?: () => void }> = ({ title, onMenu }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <View style={{
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: width < 640 ? 56 : 64,
        paddingHorizontal: 12,
        paddingVertical: 8
      }}>
        {/* Mobile menu trigger */}
        {onMenu && (
          <TouchableOpacity
            onPress={onMenu}
            style={{
              marginRight: 8,
              height: width < 640 ? 32 : 36,
              width: width < 640 ? 32 : 36,
              borderRadius: 6,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="menu" size={20} color="#374151" />
          </TouchableOpacity>
        )}

        {/* Brand */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View>
            <Text style={{
              fontSize: width < 640 ? 14 : 16,
              fontFamily: 'System',
              fontWeight: '600',
              color: '#111827'
            }}>
              NeuroCampus
            </Text>
            {width >= 768 && (
              <Text style={{
                fontSize: 12,
                color: '#6b7280',
                marginTop: 2
              }}>
                AMC College
              </Text>
            )}
          </View>
        </View>

        {/* Live Clock & Actions */}
        <View style={{
          marginLeft: 'auto',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8
        }}>
          {/* Live Clock */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: '#f9fafb',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#e5e7eb'
          }}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={{
              fontSize: 14,
              fontFamily: 'System',
              fontWeight: '500',
              color: '#374151',
              minWidth: 72,
              textAlign: 'center'
            }}>
              {formatTime(currentTime)}
            </Text>
          </View>

          {/* Notifications */}
          <TouchableOpacity
            style={{
              height: width < 640 ? 32 : 36,
              width: width < 640 ? 32 : 36,
              borderRadius: 6,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name="notifications-outline" size={18} color="#374151" />
          </TouchableOpacity>

          {/* User info - hidden on small screens */}
          {width >= 1024 && (
            <Text style={{
              fontSize: 14,
              fontFamily: 'System',
              fontWeight: '500',
              color: '#374151',
              maxWidth: 120
            }} numberOfLines={1}>
              {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || 'User'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
