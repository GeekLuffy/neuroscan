import React from 'react';
import { GlassNavbar } from '@/components/GlassNavbar';
import { PaperShaderBackground } from '@/components/PaperShaderBackground';
import HardwareDataDisplay from '@/components/HardwareDataDisplay';

const HardwareIntegration: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <PaperShaderBackground />
      <GlassNavbar />
      
      <div className="relative z-10 pt-24">
        <HardwareDataDisplay />
      </div>
    </div>
  );
};

export default HardwareIntegration;
