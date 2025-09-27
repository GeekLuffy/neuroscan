import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import LabsPage from "./pages/Labs";
import MotorLab from "./components/labs/MotorLab";
import { VoiceLab } from "./components/labs/VoiceLab";
import { EyeLab } from "./components/labs/EyeLab";
import Purpose from "./pages/Purpose";
import About from "./pages/About";
import HardwareIntegration from "./pages/HardwareIntegration";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const AppContent = () => {

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/labs" element={<LabsPage />}>
          <Route path="motor" element={<MotorLab />} />
          <Route path="voice" element={<VoiceLab />} />
          <Route path="eye" element={<EyeLab />} />
        </Route>
        <Route path="/purpose" element={<Purpose />} />
        <Route path="/about" element={<About />} />
        <Route path="/hardware-integration" element={<HardwareIntegration />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};


const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner />
        <Router>
          <AppContent />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
