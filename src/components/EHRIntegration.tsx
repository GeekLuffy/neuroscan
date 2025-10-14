/**
 * EHR Integration Component
 * ABHA ID authentication, medical history display, and settings
 */

import React, { useState } from 'react';
import { useEHR } from '@/contexts/EHRContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Shield,
  Hospital,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  LogOut,
  RefreshCw,
  Link as LinkIcon,
  Settings,
  User,
  Calendar,
  Pill,
  Activity,
} from 'lucide-react';
import { ehrService } from '@/services/ehrService';

export const EHRIntegration: React.FC = () => {
  const { colors } = useTheme();
  const {
    isAuthenticated,
    abhaProfile,
    medicalHistory,
    ehrSettings,
    updateEHRSettings,
    authenticateWithABHA,
    fetchMedicalHistory,
    logout,
    isLoading,
    error,
  } = useEHR();

  const [abhaInput, setAbhaInput] = useState('');
  const [authMode, setAuthMode] = useState<'MOBILE_OTP' | 'AADHAAR_OTP' | 'PASSWORD'>('MOBILE_OTP');
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle ABHA ID input with formatting
  const handleABHAInput = (value: string) => {
    const formatted = ehrService.formatABHAId(value);
    setAbhaInput(formatted);
    setLocalError(null);
  };

  // Handle authentication
  const handleAuthenticate = async () => {
    if (!ehrService.isValidABHAId(abhaInput)) {
      setLocalError('Invalid ABHA ID format. Expected: XX-XXXX-XXXX-XXXX');
      return;
    }

    const success = await authenticateWithABHA(abhaInput, authMode);
    if (success) {
      setAbhaInput('');
    }
  };

  // Render authentication form
  const renderAuthForm = () => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <div className="p-2 rounded-lg bg-gradient-to-br" style={{ 
            background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)`,
            border: `1px solid ${colors.primary}30`
          }}>
            <Shield className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          Connect to ABDM (Ayushman Bharat)
        </CardTitle>
        <CardDescription className="text-gray-400">
          Link your ABHA ID to access your medical records and enable EHR integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="abha-id" className="text-gray-300">ABHA ID</Label>
            <Input
              id="abha-id"
              placeholder="XX-XXXX-XXXX-XXXX"
              value={abhaInput}
              onChange={(e) => handleABHAInput(e.target.value)}
              maxLength={17}
              disabled={isLoading}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
            />
            <p className="text-xs text-gray-400">
              Enter your 14-digit ABHA ID (Ayushman Bharat Health Account)
            </p>
          </div>

          {(localError || error) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{localError || error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleAuthenticate}
            disabled={isLoading || !abhaInput}
            className="w-full glass-button"
            style={{ 
              backgroundColor: colors.primary,
              borderColor: colors.primary,
              color: 'white'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect ABHA ID
              </>
            )}
          </Button>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h4 className="text-sm font-semibold mb-3 text-white">Why Connect Your ABHA ID?</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Access your complete medical history instantly</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Auto-upload test results to your health records</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Share results with doctors seamlessly</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Track your health trends over time</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg" style={{ 
          background: `linear-gradient(to bottom right, ${colors.primary}10, ${colors.secondary}10)`,
          border: `1px solid ${colors.primary}20`
        }}>
          <p className="text-sm text-gray-300">
            <strong className="text-white">Don't have an ABHA ID?</strong> Create one for free at{' '}
            <a
              href="https://abha.abdm.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
              style={{ color: colors.primary }}
            >
              abha.abdm.gov.in
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Render patient profile
  const renderProfile = () => {
    if (!abhaProfile) return null;

    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br" style={{ 
                background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)`,
                border: `1px solid ${colors.primary}30`
              }}>
                <User className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              Patient Profile
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="glass-button"
              style={{ 
                borderColor: colors.primary,
                color: colors.primary
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
          <CardDescription className="text-gray-400">Your ABDM health profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-400">ABHA ID</Label>
              <p className="font-mono font-semibold text-white">{abhaProfile.abhaId}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-400">ABHA Address</Label>
              <p className="font-mono text-gray-300">{abhaProfile.abhaAddress}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Name</Label>
              <p className="font-semibold text-white">{abhaProfile.name}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Gender</Label>
              <p className="text-gray-300">{abhaProfile.gender === 'M' ? 'Male' : abhaProfile.gender === 'F' ? 'Female' : 'Other'}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Date of Birth</Label>
              <p className="text-gray-300">{new Date(abhaProfile.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-400">Mobile</Label>
              <p className="text-gray-300">{abhaProfile.mobile}</p>
            </div>
          </div>

          {abhaProfile.address && (
            <div>
              <Label className="text-xs text-gray-400">Address</Label>
              <p className="text-sm text-gray-300">
                {abhaProfile.address.line}, {abhaProfile.address.district},{' '}
                {abhaProfile.address.state} - {abhaProfile.address.pincode}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Badge 
              variant="outline" 
              className="bg-green-50/10 text-green-400 border-green-400/30"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected to ABDM
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render medical history
  const renderMedicalHistory = () => {
    if (!medicalHistory) {
      return (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br" style={{ 
                background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)`,
                border: `1px solid ${colors.primary}30`
              }}>
                <FileText className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Button 
                onClick={fetchMedicalHistory} 
                disabled={isLoading}
                className="glass-button"
                style={{ 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  color: 'white'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch Medical History
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="p-2 rounded-lg bg-gradient-to-br" style={{ 
                background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)`,
                border: `1px solid ${colors.primary}30`
              }}>
                <FileText className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              Medical History
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMedicalHistory} 
              disabled={isLoading}
              className="glass-button"
              style={{ 
                borderColor: colors.primary,
                color: colors.primary
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <CardDescription className="text-gray-400">
            Last updated: {new Date(medicalHistory.lastUpdated).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="conditions">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="allergies">Allergies</TabsTrigger>
              <TabsTrigger value="vitals">Vitals</TabsTrigger>
            </TabsList>

            <TabsContent value="conditions" className="space-y-3">
              {medicalHistory.conditions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No conditions recorded</p>
              ) : (
                medicalHistory.conditions.map((condition, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{condition.name}</h4>
                        <p className="text-xs text-muted-foreground">Code: {condition.code}</p>
                      </div>
                      <Badge variant={condition.status === 'active' ? 'default' : 'secondary'}>
                        {condition.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(condition.diagnosedDate).toLocaleDateString()}
                      </span>
                      {condition.severity && (
                        <Badge variant="outline" className="text-xs">
                          {condition.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="medications" className="space-y-3">
              {medicalHistory.medications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No medications recorded</p>
              ) : (
                medicalHistory.medications.map((med, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Pill className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{med.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} - {med.frequency}
                        </p>
                        {med.purpose && (
                          <p className="text-xs text-muted-foreground mt-1">Purpose: {med.purpose}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Since {new Date(med.startDate).toLocaleDateString()}</span>
                          {med.prescribedBy && <span>• Prescribed by {med.prescribedBy}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="allergies" className="space-y-3">
              {medicalHistory.allergies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No allergies recorded</p>
              ) : (
                medicalHistory.allergies.map((allergy, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          {allergy.allergen}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">Reaction: {allergy.reaction}</p>
                      </div>
                      <Badge
                        variant={
                          allergy.severity === 'life-threatening'
                            ? 'destructive'
                            : allergy.severity === 'severe'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {allergy.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Verified: {new Date(allergy.verifiedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="vitals" className="space-y-3">
              {medicalHistory.vitals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No vitals recorded</p>
              ) : (
                medicalHistory.vitals.slice(0, 5).map((vital, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Vital Signs
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(vital.recordedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vital.bloodPressure && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Blood Pressure</Label>
                          <p className="font-semibold">
                            {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic} mmHg
                          </p>
                        </div>
                      )}
                      {vital.heartRate && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Heart Rate</Label>
                          <p className="font-semibold">{vital.heartRate} bpm</p>
                        </div>
                      )}
                      {vital.temperature && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Temperature</Label>
                          <p className="font-semibold">{vital.temperature}°F</p>
                        </div>
                      )}
                      {vital.oxygenSaturation && (
                        <div>
                          <Label className="text-xs text-muted-foreground">SpO2</Label>
                          <p className="font-semibold">{vital.oxygenSaturation}%</p>
                        </div>
                      )}
                      {vital.weight && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Weight</Label>
                          <p className="font-semibold">{vital.weight} kg</p>
                        </div>
                      )}
                      {vital.height && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Height</Label>
                          <p className="font-semibold">{vital.height} cm</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  // Render EHR settings
  const renderSettings = () => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <div className="p-2 rounded-lg bg-gradient-to-br" style={{ 
            background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)`,
            border: `1px solid ${colors.primary}30`
          }}>
            <Settings className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          EHR Integration Settings
        </CardTitle>
        <CardDescription className="text-gray-400">Configure how NeuroScan integrates with your health records</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-300">Enable EHR Integration</Label>
            <p className="text-sm text-gray-400">Connect to ABDM health records</p>
          </div>
          <Switch
            checked={ehrSettings.enabled}
            onCheckedChange={(checked) => updateEHRSettings({ enabled: checked })}
            disabled={!isAuthenticated}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-300">Auto-Upload Test Results</Label>
            <p className="text-sm text-gray-400">Automatically save results to your EHR</p>
          </div>
          <Switch
            checked={ehrSettings.autoUpload}
            onCheckedChange={(checked) => updateEHRSettings({ autoUpload: checked })}
            disabled={!ehrSettings.enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-300">Share with Doctors</Label>
            <p className="text-sm text-gray-400">Allow doctors to view your test results</p>
          </div>
          <Switch
            checked={ehrSettings.shareWithDoctors}
            onCheckedChange={(checked) => updateEHRSettings({ shareWithDoctors: checked })}
            disabled={!ehrSettings.enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-300">Longitudinal Tracking</Label>
            <p className="text-sm text-gray-400">Track health trends over time</p>
          </div>
          <Switch
            checked={ehrSettings.longitudinalTracking}
            onCheckedChange={(checked) => updateEHRSettings({ longitudinalTracking: checked })}
            disabled={!ehrSettings.enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-gray-300">Auto-Referral</Label>
            <p className="text-sm text-gray-400">Automatically refer high-risk cases to neurologists</p>
          </div>
          <Switch
            checked={ehrSettings.autoReferral}
            onCheckedChange={(checked) => updateEHRSettings({ autoReferral: checked })}
            disabled={!ehrSettings.enabled}
          />
        </div>

        {ehrSettings.enabled && !ehrSettings.consentGiven && (
          <Alert className="border-white/20 bg-white/5">
            <Shield className="h-4 w-4" style={{ color: colors.primary }} />
            <AlertDescription className="text-gray-300">
              <p className="font-semibold mb-2 text-white">Data Sharing Consent Required</p>
              <p className="text-sm mb-3 text-gray-400">
                By enabling EHR integration, you consent to sharing your test results with healthcare providers
                through the ABDM network.
              </p>
              <Button
                size="sm"
                onClick={() => updateEHRSettings({ consentGiven: true, consentDate: new Date().toISOString() })}
                className="glass-button"
                style={{ 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  color: 'white'
                }}
              >
                I Consent
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {!isAuthenticated ? (
        renderAuthForm()
      ) : (
        <>
          {renderProfile()}
          {renderMedicalHistory()}
          {renderSettings()}
        </>
      )}
    </div>
  );
};

