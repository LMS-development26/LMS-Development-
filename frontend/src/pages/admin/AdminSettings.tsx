import { Save, Globe, Shield, Bell } from 'lucide-react';
import { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Select } from '@/components/ui';

export function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'LMS Platform',
    defaultLanguage: 'English',
    maxUploadSize: '500',
    enableEmailNotifications: true,
    enableLiveClasses: true,
    enableCertificates: true,
    enrollmentMode: 'approval',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure platform-wide settings and preferences.</p>
      </div>

      <Card>
        <CardHeader title="General Settings" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Platform Name" value={settings.platformName} onChange={(e) => setSettings({ ...settings, platformName: e.target.value })} />
            <Select label="Default Language" value={settings.defaultLanguage} onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Storage Settings" subtitle="Amazon S3 configuration" />
        <CardBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Max Upload Size (MB)" type="number" value={settings.maxUploadSize} onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })} />
            <Select label="Enrollment Mode" value={settings.enrollmentMode} onChange={(e) => setSettings({ ...settings, enrollmentMode: e.target.value })}>
              <option value="approval">Instructor Approval Required</option>
              <option value="open">Open Enrollment</option>
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Feature Toggles" />
        <CardBody>
          <div className="space-y-3">
            {[
              { key: 'enableEmailNotifications', label: 'Email Notifications', icon: <Bell className="h-5 w-5" />, desc: 'Send email notifications to users' },
              { key: 'enableLiveClasses', label: 'Live Classes', icon: <Globe className="h-5 w-5" />, desc: 'Enable Google Meet integration' },
              { key: 'enableCertificates', label: 'Certificates', icon: <Shield className="h-5 w-5" />, desc: 'Allow certificate generation on course completion' },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{toggle.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{toggle.label}</p>
                    <p className="text-xs text-gray-500">{toggle.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, [toggle.key]: !settings[toggle.key as keyof typeof settings] })}
                  className={`relative h-6 w-11 rounded-full transition-colors ${settings[toggle.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${settings[toggle.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button><Save className="h-4 w-4" /> Save Settings</Button>
      </div>
    </div>
  );
}
