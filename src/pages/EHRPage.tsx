/**
 * EHR Integration Page
 * Displays EHR integration, medical history, and health data management
 */

import React from 'react';
import { GlassNavbar } from '@/components/GlassNavbar';
import { PaperShaderBackground } from '@/components/PaperShaderBackground';
import { EHRIntegration } from '@/components/EHRIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, Shield, TrendingUp, Users, FileText, Activity, Heart } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const EHRPage: React.FC = () => {
  const { colors } = useTheme();

  const benefits = [
    {
      icon: Hospital,
      title: "ABDM Integration",
      description: "Connect to India's national health infrastructure",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description: "Your health data is encrypted and stored securely",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      title: "Track Trends",
      description: "Monitor your health metrics over time",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Share with Doctors",
      description: "Seamlessly share results with healthcare providers",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PaperShaderBackground />
      <GlassNavbar />
      
      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Electronic <span className={`bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>Health Records</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect your ABHA ID to access your medical history and enable seamless health data sharing 
              with healthcare providers through India's national health infrastructure.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="glass-card group hover:scale-105 transition-transform duration-300">
                  <CardHeader className="pb-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br w-fit mb-4" style={{ 
                      background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)`,
                      border: `1px solid ${colors.primary}30`
                    }}>
                      <IconComponent className={`w-6 h-6 ${benefit.color}`} />
                    </div>
                    <CardTitle className="text-lg text-white transition-colors" style={{ 
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = colors.secondary}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main EHR Integration Component */}
          <EHRIntegration />
        </div>
      </div>
    </div>
  );
};

