import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
  Image
} from 'react-native';
import { getFacultyProfile, manageProfile } from '../../api/faculty';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface FacultyProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  department?: string;
  role?: string;
  mobile_number?: string;
  address?: string;
  bio?: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    address: '',
    bio: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await getFacultyProfile();
      if (result.success && result.data) {
        const profileData = result.data?.data || result.data;
        setProfile(profileData);
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || '',
          mobile_number: profileData.mobile_number || '',
          address: profileData.address || '',
          bio: profileData.bio || ''
        });
        setProfileImage(profileData.profile_picture);
      } else {
        Alert.alert('Error', result.message || 'Failed to load profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
    setLoading(false);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const result = await manageProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        profile_picture: profileImage ? { uri: profileImage } as any : undefined
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setShowEditModal(false);
        setEditingField(null);
        loadProfile();
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
    setSaving(false);
  };

  const openEditField = (field: string) => {
    setEditingField(field);
    setShowEditModal(true);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account information</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.section}>
          <View style={styles.profilePictureContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Text style={styles.profilePictureText}>
                  {profile ? getInitials(profile.first_name, profile.last_name) : 'FP'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editPictureButton} onPress={pickImage}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.profileName}>
            {profile?.first_name} {profile?.last_name}
          </Text>
          <Text style={styles.profileRole}>{profile?.role || 'Faculty'}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Ionicons name="person" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>First Name</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoValue}
              onPress={() => openEditField('first_name')}
            >
              <Text style={styles.infoText}>{profile?.first_name || 'Not set'}</Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Ionicons name="person" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Last Name</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoValue}
              onPress={() => openEditField('last_name')}
            >
              <Text style={styles.infoText}>{profile?.last_name || 'Not set'}</Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Ionicons name="mail" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoValue}
              onPress={() => openEditField('email')}
            >
              <Text style={styles.infoText}>{profile?.email || 'Not set'}</Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Ionicons name="call" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Mobile Number</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoValue}
              onPress={() => openEditField('mobile_number')}
            >
              <Text style={styles.infoText}>{profile?.mobile_number || 'Not set'}</Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Ionicons name="location" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Address</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoValue}
              onPress={() => openEditField('address')}
            >
              <Text style={styles.infoText} numberOfLines={1}>
                {profile?.address || 'Not set'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Ionicons name="business" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Department</Text>
            </View>
            <Text style={styles.infoText}>{profile?.department || 'Not specified'}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Ionicons name="school" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Role</Text>
            </View>
            <Text style={styles.infoText}>{profile?.role || 'Faculty'}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Ionicons name="person-circle" size={20} color="#64748b" />
              <Text style={styles.infoLabel}>Username</Text>
            </View>
            <Text style={styles.infoText}>{profile?.username || 'Not set'}</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.bioContainer}>
            <Ionicons name="document-text" size={20} color="#64748b" />
            <Text style={styles.bioText}>
              {profile?.bio || 'No bio available. Tap to add one.'}
            </Text>
            <TouchableOpacity 
              style={styles.editBioButton}
              onPress={() => openEditField('bio')}
            >
              <Ionicons name="create" size={16} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowEditModal(true)}
          >
            <Ionicons name="create" size={20} color="#2563eb" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: () => {
                    // Handle logout
                  }}
                ]
              );
            }}
          >
            <Ionicons name="log-out" size={20} color="#dc2626" />
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editingField?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={formData[editingField as keyof typeof formData] || ''}
              onChangeText={(text) => updateFormData(editingField!, text)}
              placeholder={`Enter ${editingField?.replace('_', ' ')}`}
              multiline={editingField === 'bio' || editingField === 'address'}
              numberOfLines={editingField === 'bio' ? 4 : 1}
              textAlignVertical={editingField === 'bio' ? 'top' : 'center'}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  saving && styles.modalSaveButtonDisabled
                ]}
                onPress={saveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.modalSaveText}>Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'System',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureText: {
    fontSize: 32,
    fontFamily: 'System',
    color: '#fff',
  },
  editPictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'System',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  infoValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  bioText: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    lineHeight: 20,
  },
  editBioButton: {
    padding: 4,
  },
  actionSection: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
    fontFamily: 'System',
  },
  logoutButtonText: {
    color: '#dc2626',
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
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalSaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  modalSaveButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'System',
    marginLeft: 8,
  },
});