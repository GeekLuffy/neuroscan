import React from 'react';
import { GlassNavbar } from '@/components/GlassNavbar';
import { PaperShaderBackground } from '@/components/PaperShaderBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, Cpu, Lightbulb } from 'lucide-react';

const Purpose = () => {
  return (
    <div className="min-h-screen">
      <PaperShaderBackground />
      <GlassNavbar />
      <main className="container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto">
          <Card className="paper-module">
            <CardHeader className="text-center pb-8">
              <Lightbulb className="w-16 h-16 mx-auto mb-6 text-purple-400" />
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                The Purpose of NeuroScan
              </CardTitle>
              <p className="text-xl text-gray-300 mt-4">
                Exploring the Future of Accessible Neurological Screening
              </p>
            </CardHeader>
            <CardContent className="text-lg text-gray-300 space-y-6">
              <p>
                NeuroScan was born from a simple yet powerful idea: what if we could leverage the technology already in our hands—our computers and smartphones—to create accessible, preliminary tools for neurological health screening? This project is a hackathon-born exploration into that very question.
              </p>
              <p>
                The core mission is to demonstrate the potential of web-based technologies to provide valuable health insights. By using on-device machine learning, we can analyze motor skills, vocal patterns, and cognitive functions in a way that is both innovative and respects user privacy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="w-10 h-10 text-green-400" />
                  <h3 className="font-bold text-white">Privacy First</h3>
                  <p className="text-sm text-gray-400">All data is processed on your device. Nothing is ever sent to a server.</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Cpu className="w-10 h-10 text-blue-400" />
                  <h3 className="font-bold text-white">On-Device AI</h3>
                  <p className="text-sm text-gray-400">Utilizing modern browser capabilities for powerful, real-time analysis.</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Brain className="w-10 h-10 text-pink-400" />
                  <h3 className="font-bold text-white">Health Awareness</h3>
                  <p className="text-sm text-gray-400">Aiming to raise awareness and provide tools for personal health monitoring.</p>
                </div>
              </div>
              <p className="pt-4">
                This is not a medical device, but a proof-of-concept. It's a step towards a future where technology can empower individuals to take a more active role in their health and well-being.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Purpose;
