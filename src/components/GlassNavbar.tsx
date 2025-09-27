import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, MessageCircle, HelpCircle, Settings, Menu, X, Home, Cpu, Palette } from 'lucide-react';
import { ChatBot } from './ChatBot';
import { FAQModal } from './FAQModal';
import { SettingsModal } from './SettingsModal';
import { ThemeSelector } from './ThemeSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';

interface GlassNavbarProps {
  showBack?: boolean;
  onBackClick?: () => void;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({ showBack, onBackClick }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { colors } = useTheme();

  const navItems = [
    { label: 'Purpose', href: '/purpose' },
    { label: 'About', href: '/about' },
    { label: 'Hardware', href: '/hardware-integration', icon: Cpu },
  ];

  return (
    <>
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="glass-pill px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Brain className="w-8 h-8" style={{ color: colors.primary }} />
              <span className={`text-xl font-bold bg-gradient-to-r ${colors.textGradient} bg-clip-text text-transparent`}>
                NeuroScan
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium relative group"
              >
                <span>Home</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" style={{ backgroundColor: colors.primary }}></span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium relative group flex items-center gap-1"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" style={{ backgroundColor: colors.primary }}></span>
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(true)}
                className="glass-button hover:opacity-80"
                style={{ color: colors.primary }}
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFAQOpen(true)}
                className="glass-button hover:opacity-80"
                style={{ color: colors.primary }}
              >
                <HelpCircle className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsThemeSelectorOpen(true)}
                className="glass-button hover:opacity-80"
                style={{ color: colors.primary }}
              >
                <Palette className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                className="glass-button hover:opacity-80"
                style={{ color: colors.primary }}
              >
                <Settings className="w-5 h-5" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden glass-button hover:opacity-80"
                style={{ color: colors.primary }}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2 flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-300 font-medium py-2 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modals */}
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ThemeSelector isOpen={isThemeSelectorOpen} onClose={() => setIsThemeSelectorOpen(false)} />
    </>
  );
};