import React from 'react';
import { GlassNavbar } from '@/components/GlassNavbar';
import { PaperShaderBackground } from '@/components/PaperShaderBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, Cpu, Lightbulb, Smartphone, Heart, Activity, Zap, Target, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const Purpose = () => {
  const { colors } = useTheme();
  
  return (
    <div className="min-h-screen">
      <PaperShaderBackground />
      <GlassNavbar />
      <main className="container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto">
          <Card className="paper-module">
            <CardHeader className="text-center pb-8">
              <Lightbulb className="w-16 h-16 mx-auto mb-6" style={{ color: colors.primary }} />
              <CardTitle className={`text-4xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
                The Purpose of NeuroScan
              </CardTitle>
              <p className="text-xl text-gray-300 mt-4">
                Revolutionizing Neurological Screening Through Advanced Hardware & AI Integration
              </p>
            </CardHeader>
            <CardContent className="text-lg text-gray-300 space-y-6">
              <p>
                NeuroScan represents the evolution from concept to reality—combining our innovative web-based AI platform with the revolutionary <strong className="text-white">NeuraScan hardware device</strong>. What began as leveraging existing technology has transformed into creating purpose-built, medical-grade hardware for comprehensive neurological screening.
              </p>
              <p>
                Our mission has expanded to bridge the gap between accessible healthcare and professional-grade diagnostics. The NeuraScan device integrates multiple medical sensors with our AI-powered web platform, enabling early detection of neurological conditions like Parkinson's disease, Alzheimer's disease, and epilepsy in primary healthcare settings.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Smartphone className="w-10 h-10 text-purple-400" />
                  <h3 className="font-bold text-white">NeuraScan Device</h3>
                  <p className="text-sm text-gray-400">Professional-grade wearable with 6+ medical sensors and Raspberry Pi Zero processing.</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Heart className="w-10 h-10 text-red-400" />
                  <h3 className="font-bold text-white">Medical-Grade Sensors</h3>
                  <p className="text-sm text-gray-400">Heart Rate Sensor AD8232, EMG, motion tracking, temperature, pulse oximetry, and voice analysis capabilities.</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Brain className="w-10 h-10 text-pink-400" />
                  <h3 className="font-bold text-white">AI-Powered Analysis</h3>
                  <p className="text-sm text-gray-400">Real-time neurological screening using advanced machine learning algorithms.</p>
                </div>
              </div>

              {/* New Hardware Features Section */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 mt-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">Revolutionary Hardware Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-semibold">Comprehensive Monitoring</span>
                    </div>
                    <p className="text-sm text-gray-300 ml-8">
                      Simultaneous tracking of cardiac rhythm, muscle activity, tremor patterns, and vocal biomarkers for holistic neurological assessment.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-semibold">8-10 Hour Battery Life</span>
                    </div>
                    <p className="text-sm text-gray-300 ml-8">
                      Extended continuous operation with USB-C fast charging and intelligent power management for all-day monitoring.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-green-400" />
                      <span className="text-white font-semibold">Early Detection Focus</span>
                    </div>
                    <p className="text-sm text-gray-300 ml-8">
                      Specialized algorithms for identifying early-stage Parkinson's, Alzheimer's, and epilepsy indicators through sensor fusion.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-semibold">Primary Care Integration</span>
                    </div>
                    <p className="text-sm text-gray-300 ml-8">
                      Designed for seamless integration into primary healthcare workflows with secure data transmission and reporting.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-8">
                <p className="text-center text-gray-300">
                  <strong className="text-blue-400">Important:</strong> The NeuraScan device is currently in development as a proof-of-concept for advanced neurological screening. 
                  It represents our vision for the future of accessible, technology-driven healthcare solutions that empower both patients and healthcare providers.
                </p>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-gray-300 mb-4">
                  Experience our current web-based screening capabilities while we develop the full hardware solution.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/labs" 
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-center"
                  >
                    Try Web Labs
                  </a>
                  <a 
                    href="/device-model" 
                    className="px-6 py-3 border border-purple-500/50 text-purple-300 rounded-lg font-semibold hover:bg-purple-500/10 transition-all duration-300 text-center"
                  >
                    View Device Specs
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Purpose;
