import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceLab } from '@/components/labs/VoiceLab';
import MotorLab from '@/components/labs/MotorLab';
import { EyeLab } from '@/components/labs/EyeLab';
import { Timeline } from '@/components/Timeline';
import { GlassNavbar } from '@/components/GlassNavbar';
import { PaperShaderBackground } from '@/components/PaperShaderBackground';
import { 
  Activity, 
  Brain, 
  Eye, 
  Mic, 
  Timer, 
  TrendingUp,
  Sparkles,
  Shield,
  Cpu,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  const labs = [
    {
      id: 'motor',
      title: 'Motor & Tremor Lab', 
      description: 'Measure movement patterns, tremor frequency, and motor control',
      icon: Activity,
      status: 'ready',
      features: ['Finger Tapping', 'Tremor Analysis', 'Movement Speed', 'Coordination'],
      color: 'accent'
    },
    {
      id: 'voice',
      title: 'Voice & Speech Lab',
      description: 'Analyze vocal patterns, pitch stability, and speech characteristics',
      icon: Mic,
      status: 'ready',
      features: ['Pitch Analysis', 'Jitter Detection', 'Voice Quality', 'Speech Patterns'],
      color: 'primary'
    },
    {
      id: 'eye',
      title: 'Eye & Cognition Lab',
      description: 'Test reaction times, visual attention, and cognitive processing',
      icon: Eye,
      status: 'ready', 
      features: ['Saccade Tests', 'Reaction Time', 'Stroop Test', 'Visual Attention'],
      color: 'neural'
    }
  ];

  return (
    <div className="min-h-screen">
      <PaperShaderBackground />
      <GlassNavbar />
      
      <main className="container mx-auto px-6 py-24">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="glass-pill grid w-full grid-cols-2 lg:grid-cols-4 mb-12 justify-center">
            <TabsTrigger value="overview" className="flex items-center justify-center h-full data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-300">Overview</TabsTrigger>
            <TabsTrigger value="labs" className="flex items-center justify-center h-full data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-300">Labs</TabsTrigger>
            <TabsTrigger value="timeline"   className="flex items-center justify-center h-full data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-300">Timeline</TabsTrigger>
            <TabsTrigger value="reports"  className="flex items-center justify-center h-full data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-300">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-12 space-y-16">
            {/* Hero Section */}
            <div className="paper-elevated text-center py-16 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Brain className="w-12 h-12 text-purple-400" />
                  <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    NeuraLab
                  </h1>
                </div>
                <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Privacy-first browser lab bench for early neurological and health screening. 
                  All processing happens securely on your device.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500/10 text-purple-300 border-purple-500/20">
                  <Shield className="w-4 h-4" />
                  Privacy-First
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500/10 text-purple-300 border-purple-500/20">
                  <Cpu className="w-4 h-4" />
                  On-Device Processing
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500/10 text-purple-300 border-purple-500/20">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Insights
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="paper-module hover:scale-105 transition-transform duration-300">
                <CardHeader className="text-center pb-8">
                  <Timer className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <CardTitle className="metric-value text-4xl text-white">3</CardTitle>
                  <CardDescription className="text-lg text-gray-300">Active Labs</CardDescription>
                </CardHeader>
              </Card>
              <Card className="paper-module hover:scale-105 transition-transform duration-300">
                <CardHeader className="text-center pb-8">
                  <TrendingUp className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                  <CardTitle className="metric-value text-4xl text-white">??</CardTitle>
                  <CardDescription className="text-lg text-gray-300">Sessions Completed</CardDescription>
                </CardHeader>
              </Card>
              <Card className="paper-module hover:scale-105 transition-transform duration-300">
                <CardHeader className="text-center pb-8">
                  <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <CardTitle className="metric-value text-4xl text-white">Ready</CardTitle>
                  <CardDescription className="text-lg text-gray-300">System Status</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Featured Lab */}
            <Card className="paper-module hover:scale-105 transition-transform duration-300">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl text-white">
                  <Mic className="w-8 h-8 text-purple-400" />
                  Featured: Voice & Speech Lab
                </CardTitle>
                <CardDescription className="text-lg leading-relaxed text-gray-300">
                  Start with our most advanced lab - analyze vocal patterns and speech characteristics using cutting-edge signal processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/labs">
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    size="xl"
                  >
                    Begin Voice Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="labs" className="mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {labs.map((lab) => {
                const IconComponent = lab.icon;
                return (
                  <Link to={`/labs/${lab.id}`} key={lab.id}> {/* ✅ dynamic route */}
                    <Card className="paper-module group cursor-pointer hover:scale-105 transition-transform duration-300">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/20">
                            <IconComponent className="w-10 h-10 text-purple-400" />
                          </div>
                          <Badge 
                            className="bg-green-500/10 text-green-400 border-green-500/20 text-sm px-3 py-1"
                          >
                            {lab.status}
                          </Badge>
                        </div>
                        <CardTitle className="group-hover:text-purple-400 transition-colors text-2xl text-white">
                          {lab.title}
                        </CardTitle>
                        <CardDescription className="text-lg leading-relaxed text-gray-300">
                          {lab.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {lab.features.map((feature) => (
                              <Badge
                                key={feature}
                                variant="outline"
                                className="text-sm px-3 py-1 border-gray-600 text-gray-300"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                          <Button 
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            size="lg"
                          >
                            Launch Lab
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-12">
            <div className="paper-module">
              <Timeline />
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-12">
            <Card className="paper-module">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl text-white">Clinical Reports</CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  AI-generated summaries and clinician-ready reports with comprehensive analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-gray-400">
                  <Brain className="w-16 h-16 mx-auto mb-6 opacity-50 text-purple-400" />
                  <p className="text-xl text-gray-300">Complete lab sessions to generate detailed reports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;