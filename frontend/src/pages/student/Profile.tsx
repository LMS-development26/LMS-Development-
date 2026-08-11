import { useState } from 'react';
import { User, Mail, Calendar, GraduationCap, Edit, Save, X, Building, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { studentApi } from '@/services/api';
import { useAsync } from '@/hooks/useAsync';
import { Card, CardBody, Button, LoadingState, EmptyState } from '@/components/ui';
import { formatDate } from '@/utils/helpers';

export function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone_number: '',
    qualification: '',
    college_name: '',
    current_year: ''
  });

  const { data: profile, loading, refetch } = useAsync(
    () => studentApi.getMyProfile(),
    []
  );

  const handleEdit = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone_number: profile.phone_number || '',
        qualification: profile.qualification || '',
        college_name: profile.college_name || '',
        current_year: profile.current_year?.toString() || ''
      });
    }
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      await studentApi.updateMyProfile({
        full_name: formData.full_name || undefined,
        bio: formData.bio || undefined,
        phone_number: formData.phone_number || undefined,
        qualification: formData.qualification || undefined,
        college_name: formData.college_name || undefined,
        current_year: formData.current_year ? parseInt(formData.current_year) : undefined
      });

      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!profile) {
    return (
      <Card>
        <EmptyState
          icon={<User className="h-12 w-12" />}
          title="Profile not found"
          message="Your profile information could not be loaded."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your personal information</p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4 md:w-1/3">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-purple-100 text-4xl font-bold text-purple-600">
                {profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('') : 'ST'}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{profile.full_name || 'Student'}</h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  {saveError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {saveError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="e.g., B.Tech, M.Sc, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">College/University</label>
                    <input
                      type="text"
                      value={formData.college_name}
                      onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Your institution name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
                    <input
                      type="number"
                      value={formData.current_year}
                      onChange={(e) => setFormData({ ...formData, current_year: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="e.g., 1, 2, 3, 4"
                      min="1"
                      max="6"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Saving...' : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-gray-900">{profile.full_name || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{profile.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p className="text-gray-900">{profile.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="text-gray-900">{formatDate(profile.created_at)}</p>
                    </div>
                  </div>
                  
                  {profile.bio && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Bio</p>
                        <p className="text-gray-900">{profile.bio}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile.phone_number && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="text-gray-900">{profile.phone_number}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile.qualification && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Qualification</p>
                        <p className="text-gray-900">{profile.qualification}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile.college_name && (
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">College/University</p>
                        <p className="text-gray-900">{profile.college_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile.current_year && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Current Year</p>
                        <p className="text-gray-900">{profile.current_year}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}