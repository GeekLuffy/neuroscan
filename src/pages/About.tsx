import React from 'react';
import { GlassNavbar } from '@/components/GlassNavbar';
import { PaperShaderBackground } from '@/components/PaperShaderBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, Github, Twitter } from 'lucide-react';
import { Brain, Heart, Users, Award, Lightbulb, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';  

const About: React.FC = () => {
  const values = [
    {
      icon: Brain,
      title: "Innovation",
      description: "Pushing the boundaries of neurological screening through cutting-edge AI and machine learning technologies."
    },
    {
      icon: Heart,
      title: "Compassion",
      description: "Every line of code we write is driven by our commitment to improving patient outcomes and quality of life."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Working closely with healthcare professionals to create tools that truly make a difference in clinical practice."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Maintaining the highest standards in research, development, and clinical validation of our technologies."
    },
    {
      icon: Lightbulb,
      title: "Research",
      description: "Continuously advancing the field through rigorous scientific research and peer-reviewed publications."
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Building secure, reliable, and validated solutions that healthcare professionals can depend on."
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
              About <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">NeuroScan</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We're a team of students deep diving into neuro fields and healthcare, using AI technologies to revolutionize 
              neurological screening through innovative solutions and compassionate care.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="mb-16">
            <Card className="glass-card">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
                <p className="text-lg text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
                  To democratize access to advanced neurological screening by developing AI-powered tools that enable 
                  early detection, accurate diagnosis, and personalized treatment pathways. We believe that every 
                  individual deserves access to cutting-edge healthcare technology, regardless of their location or 
                  economic circumstances.
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
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 w-fit mb-4">
                        <IconComponent className="w-6 h-6 text-purple-400" />
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
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

          {/* Company Stats */}
          <div className="mb-16">
            <Card className="glass-card">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-12 text-center">Impact & Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-purple-400 mb-2">??</div>
                    <div className="text-gray-300">Screenings Conducted</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-pink-400 mb-2">95%</div>
                    <div className="text-gray-300">Accuracy Rate</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-blue-400 mb-2">??</div>
                    <div className="text-gray-300">Healthcare Partners</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-green-400 mb-2">??</div>
                    <div className="text-gray-300">Research Publications</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="glass-card max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Join Our Mission
                </h3>
                <p className="text-gray-300 mb-6">
                  Whether you're a healthcare professional, researcher, or technology partner, 
                  we invite you to join us in advancing neurological healthcare through innovation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/contact" 
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-center"
                  >
                    Partner With Us
                  </a>
                  <a 
                    href="/work" 
                    className="px-6 py-3 border border-purple-500/50 text-purple-300 rounded-lg font-semibold hover:bg-purple-500/10 transition-all duration-300 text-center"
                  >
                    View Our Work
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Section */}
          <div className="mt-32">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Team</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Owais naeem */}
                <Card className="glass-card">
                  <CardHeader className="text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-purple-400/50">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Owais naeem" />
                      <AvatarFallback>ON</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Owais naeem
                    </CardTitle>
                    <p className="text-xl text-gray-300 mt-2">Founder & Developer</p>
                  </CardHeader>
                  <CardContent className="mt-6 text-lg text-gray-300 space-y-6 text-center">
                    <p>
                      Owais is the co-creator of NeuroScan, focusing on the intersection of web technology and neurological health screening. 
                      He specializes in AI integration and backend development for this innovative healthcare platform.
                    </p>
                    <div className="flex justify-center gap-6 mt-8">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Github className="w-8 h-8" />
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin className="w-8 h-8" />
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Twitter className="w-8 h-8" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Himanshu Rathore */}
                <Card className="glass-card">
                  <CardHeader className="text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-6 border-4 border-pink-400/50">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Himanshu Rathore" />
                      <AvatarFallback>HR</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      Himanshu Rathore
                    </CardTitle>
                    <p className="text-xl text-gray-300 mt-2">Frontend Developer</p>
                  </CardHeader>
                  <CardContent className="mt-6 text-lg text-gray-300 space-y-6 text-center">
                    <p>
                      Himanshu is the co-creator of NeuroScan, specializing in frontend development and user experience design. 
                      He crafts intuitive interfaces that make advanced neurological screening accessible to everyone.
                    </p>
                    <div className="flex justify-center gap-6 mt-8">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Github className="w-8 h-8" />
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin className="w-8 h-8" />
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Twitter className="w-8 h-8" />
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
