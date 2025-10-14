# 🧠 NeuroScan - AI-Powered Neurological Health Platform

<div align="center">

![NeuroScan Logo](https://img.shields.io/badge/NeuroScan-AI%20Powered%20Neurological%20Health-blue?style=for-the-badge&logo=brain)

**Revolutionizing neurological healthcare through advanced AI and comprehensive sensor technology**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

## 🌟 Overview

NeuroScan is a cutting-edge web-based platform that combines advanced AI algorithms with comprehensive neurological testing to enable early detection and monitoring of neurological conditions. Our platform integrates seamlessly with India's national health infrastructure (ABDM) and provides professional-grade medical screening capabilities.

### 🎯 Key Features

- **🔬 Multi-Modal Testing Labs**: Voice, Motor, Eye movement, Memory, and Cognitive assessments
- **🤖 AI-Powered Analysis**: Advanced algorithms for Parkinson's, Alzheimer's, and Epilepsy detection
- **🏥 EHR Integration**: Seamless connection with ABDM (Ayushman Bharat Digital Mission)
- **📊 Real-Time Monitoring**: Live data visualization and trend analysis
- **🔒 Secure & Compliant**: FHIR-compliant data formats and secure health record management
- **📱 Responsive Design**: Modern glass-morphism UI with accessibility features

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with camera/microphone access

### Installation

```bash
# Clone the repository
git clone https://github.com/GeekLuffy/neuroscan.git
cd neuroscan

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🧪 Testing Labs

### 1. **Voice & Speech Lab**
- **Purpose**: Analyze vocal patterns for neurological conditions
- **Features**: 
  - Real-time pitch analysis
  - Jitter detection
  - Voice quality assessment
  - Speech pattern recognition
- **Conditions Detected**: Parkinson's disease, voice disorders

### 2. **Motor & Tremor Lab**
- **Purpose**: Assess movement patterns and motor control
- **Features**:
  - Finger tapping analysis
  - Tremor frequency measurement
  - Movement speed assessment
  - Coordination evaluation
- **Conditions Detected**: Parkinson's disease, essential tremor

### 3. **Eye Movement Lab**
- **Purpose**: Evaluate cognitive function and attention
- **Features**:
  - Saccade reaction time
  - Stroop test for attention
  - Digit span memory test
  - Word list recall assessment
- **Conditions Detected**: Alzheimer's disease, cognitive impairment

## 🏥 EHR Integration

NeuroScan integrates with India's national health infrastructure through ABDM (Ayushman Bharat Digital Mission):

### Features
- **ABHA ID Authentication**: Connect using your 14-digit ABHA ID
- **Medical History Access**: View existing health records
- **Test Results Upload**: Automatically save results to your EHR
- **FHIR Compliance**: Standardized medical data formats
- **Doctor Sharing**: Seamlessly share results with healthcare providers

### Sandbox Mode (Default)
- ✅ No credentials required for testing
- ✅ Demo patient data included
- ✅ Simulated authentication flow
- ✅ Test uploads logged to console

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript 5.8.3** - Type-safe development
- **Vite 5.4.19** - Fast build tool
- **Tailwind CSS 3.4.17** - Utility-first styling
- **Radix UI** - Accessible component primitives

### AI & Machine Learning
- **MediaPipe** - Real-time hand tracking and pose estimation
- **Web Audio API** - Voice analysis and processing
- **Custom Algorithms** - Neurological condition detection

### Data & Storage
- **FHIR** - Healthcare data standards
- **Local Storage** - Client-side data persistence
- **ABDM APIs** - National health infrastructure integration

## 📁 Project Structure

```
neuroscan/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── labs/           # Testing lab components
│   │   ├── ui/             # Shadcn UI components
│   │   └── ...
│   ├── contexts/           # React context providers
│   ├── pages/              # Route components
│   ├── services/           # API and external services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── docs/                  # Documentation
└── ...
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Gemini AI API Key (for ChatBot)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# ABDM Configuration (Optional - Sandbox mode works without these)
VITE_ABDM_BASE_URL=https://dev.abdm.gov.in/gateway
VITE_ABDM_CLIENT_ID=your_abdm_client_id_here
VITE_ABDM_CLIENT_SECRET=your_abdm_client_secret_here
VITE_ABDM_SANDBOX=true
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎨 UI/UX Features

### Design System
- **Glass Morphism**: Modern translucent design
- **Dark Theme**: Optimized for medical environments
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG compliant with high contrast options

### Theme Customization
- Dynamic color schemes
- High contrast mode
- Large text options
- Reduced motion preferences

## 🔒 Security & Privacy

- **Data Encryption**: All health data encrypted in transit and at rest
- **FHIR Compliance**: Standardized medical data formats
- **ABDM Integration**: Government-approved health infrastructure
- **Local Processing**: Sensitive data processed locally when possible
- **Consent Management**: Granular privacy controls

## 📊 Clinical Validation

NeuroScan implements clinically validated assessment protocols:

- **Digit Span Test**: Standardized memory assessment
- **Word List Recall**: Gold standard for Alzheimer's screening
- **Stroop Test**: Attention and executive function evaluation
- **Finger Tapping**: Motor control assessment
- **Voice Analysis**: Speech pattern evaluation

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

### **Owais Naeem** - Hardware Integration & AI Developer
- Machine learning algorithms for neurological analysis
- Backend API development
- Medical sensor data processing
- Hardware-AI integration

### **Himanshu Rathore** - Frontend, UX & IoT Developer
- Intuitive user interfaces
- Medical data visualization
- IoT device communication protocols
- Real-time monitoring systems

## 📞 Support

- **Documentation**: [docs/SETUP.md](docs/SETUP.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/neuroscan/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/neuroscan/discussions)

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Other Platforms
The app is a standard React SPA and can be deployed to any static hosting service.

---

<div align="center">

**Made with ❤️ for advancing neurological healthcare by Team ORBIT**

[![GitHub stars](https://img.shields.io/github/stars/GeekLuffy/neuroscan?style=social)](https://github.com/GeekLuffy/neuroscan)
[![GitHub forks](https://img.shields.io/github/forks/GeekLuffy/neuroscan?style=social)](https://github.com/GeekLuffy/neuroscan)

</div>