import React from 'react';
import { GlassNavbar } from '@/components/GlassNavbar';
import { PaperShaderBackground } from '@/components/PaperShaderBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, Github, Twitter } from 'lucide-react';
import { Brain, Heart, Users, Award, Lightbulb, Shield, Cpu, Smartphone, Zap, Target, Activity, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';  

const About: React.FC = () => {
  const { colors } = useTheme();
  
  const values = [
    {
      icon: Smartphone,
      title: "Hardware Innovation",
      description: "Developing professional-grade medical sensors integrated with Raspberry Pi Zero processing for comprehensive neurological monitoring."
    },
    {
      icon: Stethoscope,
      title: "Medical Precision",
      description: "Every sensor and algorithm is designed with medical accuracy in mind, targeting early detection of neurological conditions."
    },
    {
      icon: Activity,
      title: "Comprehensive Monitoring",
      description: "Six medical-grade sensors working in harmony - Heart Rate Sensor, EMG, motion tracking, temperature, pulse oximetry, and voice analysis."
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "8-10 hour battery life with continuous real-time analysis and intelligent power management for all-day monitoring."
    },
    {
      icon: Target,
      title: "Early Detection Focus",
      description: "Specialized AI algorithms for identifying early-stage indicators of Parkinson's, Alzheimer's, and epilepsy."
    },
    {
      icon: Users,
      title: "Primary Care Integration",
      description: "Designed for seamless integration into primary healthcare workflows with secure data transmission and professional reporting."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <PaperShaderBackground />
      <GlassNavbar />
      
      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className={`bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>NeuroScan</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're pioneering the future of neurological healthcare by developing the <strong className="text-white">NeuraScan device</strong> - 
              a comprehensive medical-grade hardware platform that combines advanced AI with professional sensor technology 
              for early detection and monitoring of neurological conditions.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="mb-16">
            <Card className="glass-card">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
                <p className="text-lg text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
                  To revolutionize neurological healthcare by developing the <strong className="text-white">NeuraScan device</strong> - 
                  a professional-grade, wearable diagnostic platform that bridges the gap between accessible healthcare and medical precision. 
                  Our comprehensive sensor array and AI-powered analysis enable early detection of Parkinson's disease, Alzheimer's disease, 
                  and epilepsy in primary care settings, making advanced neurological screening universally accessible.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card key={index} className="glass-card group hover:scale-105 transition-transform duration-300">
                    <CardHeader>
                  <div className="p-3 rounded-lg bg-gradient-to-br w-fit mb-4" style={{ 
                    background: `linear-gradient(to bottom right, ${colors.primary}20, ${colors.secondary}20)`,
                    border: `1px solid ${colors.primary}30`
                  }}>
                    <IconComponent className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                      <CardTitle className="text-xl text-white transition-colors" style={{ 
                        transition: 'color 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.secondary}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                        {value.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 leading-relaxed">
                        {value.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>



          {/* Team Section */}
          <div className="mt-32">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4 text-center">Our Team</h2>
              <p className="text-lg text-gray-400 mb-12 text-center">Made with ❤️ by Team ORBIT</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Owais Naeem */}
                <Card className="glass-card">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4" style={{ borderColor: `${colors.primary}50` }}>
                      <AvatarImage src="/owais.png" alt="Owais Naeem" />
                      <AvatarFallback>ON</AvatarFallback>
                    </Avatar>
                    <CardTitle className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
                      Owais Naeem
                    </CardTitle>
                    <p className="text-sm text-gray-300 mt-1">Leader, Hardware Integration & AI Developer</p>
                  </CardHeader>
                  <CardContent className="mt-4 text-sm text-gray-300 space-y-4 text-center">
                    <p>
                      Leader & Founder of NeuroScan, leading the entire project vision and development. 
                      Specializes in machine learning algorithms for neurological analysis, backend development, and medical sensor data processing.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <a href="https://github.com/geekluffy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Github className="w-6 h-6" />
                      </a>
                      <a href="https://www.linkedin.com/in/mohammad-owais-naeem/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Himanshu Rathore */}
                <Card className="glass-card">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4" style={{ borderColor: `${colors.secondary}50` }}>
                      <AvatarImage src="/himanshu.png" alt="Himanshu Rathore" />
                      <AvatarFallback>HR</AvatarFallback>
                    </Avatar>
                    <CardTitle className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
                      Himanshu Rathore
                    </CardTitle>
                    <p className="text-sm text-gray-300 mt-1">Frontend, UX & IoT Developer</p>
                  </CardHeader>
                  <CardContent className="mt-4 text-sm text-gray-300 space-y-4 text-center">
                    <p>
                      Co-creator of NeuroScan, leading frontend development and IoT integration. 
                      Specializes in intuitive user interfaces, medical data visualization, and IoT device communication protocols.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <a href="https://github.com/himanshu-2l" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Github className="w-6 h-6" />
                      </a>
                      <a href="https://www.linkedin.com/in/himanshu-rathore21/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Mayank Dindoire */}
                <Card className="glass-card">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4" style={{ borderColor: `${colors.primary}50` }}>
                      <AvatarFallback>MD</AvatarFallback>
                    </Avatar>
                    <CardTitle className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
                      Mayank Dindoire
                    </CardTitle>
                    <p className="text-sm text-gray-300 mt-1">Team Member</p>
                  </CardHeader>
                  <CardContent className="mt-4 text-sm text-gray-300 space-y-4 text-center">
                    <p>
                      Contributing to NeuroScan's development with expertise in software engineering and system integration.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <a href="https://github.com/Mayforhern" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Github className="w-6 h-6" />
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Harsh Gupta */}
                <Card className="glass-card">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4" style={{ borderColor: `${colors.secondary}50` }}>
                      <AvatarFallback>HG</AvatarFallback>
                    </Avatar>
                    <CardTitle className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
                      Harsh Gupta
                    </CardTitle>
                    <p className="text-sm text-gray-300 mt-1">Team Member</p>
                  </CardHeader>
                  <CardContent className="mt-4 text-sm text-gray-300 space-y-4 text-center">
                    <p>
                      Contributing to NeuroScan's development with expertise in software engineering and system integration.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Github className="w-6 h-6" />
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Sonal Dewangan */}
                <Card className="glass-card">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4" style={{ borderColor: `${colors.primary}50` }}>
                      <AvatarFallback>SD</AvatarFallback>
                    </Avatar>
                    <CardTitle className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
                      Sonal Dewangan
                    </CardTitle>
                    <p className="text-sm text-gray-300 mt-1">Team Member</p>
                  </CardHeader>
                  <CardContent className="mt-4 text-sm text-gray-300 space-y-4 text-center">
                    <p>
                      Contributing to NeuroScan's development with expertise in software engineering and system integration.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Github className="w-6 h-6" />
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Om Pranav Jaiswal */}
                <Card className="glass-card">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4" style={{ borderColor: `${colors.secondary}50` }}>
                      <AvatarFallback>OPJ</AvatarFallback>
                    </Avatar>
                    <CardTitle className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
                      Om Pranav Jaiswal
                    </CardTitle>
                    <p className="text-sm text-gray-300 mt-1">Team Member</p>
                  </CardHeader>
                  <CardContent className="mt-4 text-sm text-gray-300 space-y-4 text-center">
                    <p>
                      Contributing to NeuroScan's development with expertise in software engineering and system integration.
                    </p>
                    <div className="flex justify-center gap-4 mt-6">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Github className="w-6 h-6" />
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin className="w-6 h-6" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
