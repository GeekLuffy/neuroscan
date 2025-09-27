import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Battery, 
  Wifi, 
  Bluetooth, 
  Download, 
  AlertTriangle, 
  Heart, 
  Zap, 
  Thermometer,
  Gauge,
  Power,
  WifiOff,
  BluetoothOff,
  CheckCircle,
  XCircle,
  FileText,
  BarChart3,
  TrendingUp,
  Clock
} from 'lucide-react';

// Types for sensor data
interface SensorData {
  timestamp: number;
  value: number;
}

interface DeviceStatus {
  isConnected: boolean;
  batteryLevel: number;
  powerConsumption: number;
  wifiStrength: number;
  bluetoothConnected: boolean;
  sensors: {
    ecg: boolean;
    emg: boolean;
    accelerometer: boolean;
    temperature: boolean;
  };
}

interface AlertData {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  sensor: string;
}

export const HardwareDataDisplay: React.FC = () => {
  // State for real-time data
  const [ecgData, setEcgData] = useState<SensorData[]>([]);
  const [emgData, setEmgData] = useState<SensorData[]>([]);
  const [accelData, setAccelData] = useState<{ x: SensorData[]; y: SensorData[]; z: SensorData[] }>({ x: [], y: [], z: [] });
  const [tempData, setTempData] = useState<SensorData[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    isConnected: false,
    batteryLevel: 0,
    powerConsumption: 0,
    wifiStrength: 0,
    bluetoothConnected: false,
    sensors: {
      ecg: false,
      emg: false,
      accelerometer: false,
      temperature: false
    }
  });
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Canvas refs for real-time charts
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  const emgCanvasRef = useRef<HTMLCanvasElement>(null);
  const accelCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate real-time data generation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Simulate Heart Rate Sensor AD8232 data (heart rate pattern)
      const ecgValue = Math.sin(now / 100) * 50 + Math.random() * 10 + 60;
      setEcgData(prev => [...prev.slice(-100), { timestamp: now, value: ecgValue }]);
      
      // Simulate EMG data (muscle activity)
      const emgValue = Math.abs(Math.sin(now / 200)) * 100 + Math.random() * 20;
      setEmgData(prev => [...prev.slice(-100), { timestamp: now, value: emgValue }]);
      
      // Simulate accelerometer data (3-axis)
      const accelX = Math.sin(now / 300) * 2 + Math.random() * 0.5;
      const accelY = Math.cos(now / 400) * 1.5 + Math.random() * 0.3;
      const accelZ = Math.sin(now / 500) * 1 + Math.random() * 0.2 + 9.8;
      setAccelData(prev => ({
        x: [...prev.x.slice(-100), { timestamp: now, value: accelX }],
        y: [...prev.y.slice(-100), { timestamp: now, value: accelY }],
        z: [...prev.z.slice(-100), { timestamp: now, value: accelZ }]
      }));
      
      // Simulate temperature data
      const tempValue = 36.5 + Math.sin(now / 1000) * 0.5 + Math.random() * 0.2;
      setTempData(prev => [...prev.slice(-100), { timestamp: now, value: tempValue }]);
      
      // Randomly update device status
      if (Math.random() < 0.1) {
        setDeviceStatus(prev => ({
          ...prev,
          batteryLevel: Math.max(0, prev.batteryLevel - 0.1),
          powerConsumption: 12 + Math.random() * 8,
          wifiStrength: 70 + Math.random() * 30
        }));
      }
      
      // Generate alerts for abnormal readings
      if (ecgValue > 120 && Math.random() < 0.1) {
        const newAlert: AlertData = {
          id: `alert-${now}`,
          type: 'warning',
          message: 'High heart rate detected',
          timestamp: now,
          sensor: 'Heart Rate Sensor AD8232'
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Draw real-time charts
  useEffect(() => {
    drawChart(ecgCanvasRef.current, ecgData, '#8b5cf6', 'Heart Rate Sensor AD8232');
  }, [ecgData]);

  useEffect(() => {
    drawChart(emgCanvasRef.current, emgData, '#06b6d4', 'EMG');
  }, [emgData]);

  useEffect(() => {
    drawAccelChart(accelCanvasRef.current, accelData);
  }, [accelData]);

  useEffect(() => {
    drawChart(tempCanvasRef.current, tempData, '#f59e0b', 'Temperature');
  }, [tempData]);

  const drawChart = (canvas: HTMLCanvasElement | null, data: SensorData[], color: string, label: string) => {
    if (!canvas || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw data line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.value - Math.min(...data.map(d => d.value))) / 
        (Math.max(...data.map(d => d.value)) - Math.min(...data.map(d => d.value)))) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  };

  const drawAccelChart = (canvas: HTMLCanvasElement | null, data: { x: SensorData[]; y: SensorData[]; z: SensorData[] }) => {
    if (!canvas || data.x.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw X, Y, Z axes
    const colors = ['#ef4444', '#22c55e', '#3b82f6'];
    const axes = [data.x, data.y, data.z];
    
    axes.forEach((axisData, axisIndex) => {
      ctx.strokeStyle = colors[axisIndex];
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      axisData.forEach((point, index) => {
        const x = (index / (axisData.length - 1)) * width;
        const y = height / 2 + (point.value / 20) * height / 2;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    });
  };

  const exportData = (format: 'json' | 'csv' | 'pdf') => {
    const data = {
      ecg: ecgData,
      emg: emgData,
      accelerometer: accelData,
      temperature: tempData,
      timestamp: new Date().toISOString()
    };
    
    let content: string;
    let fileName: string;
    let mimeType: string;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        fileName = `neuroscan-data-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        const csvHeader = 'Timestamp,Heart_Rate_Sensor_AD8232,EMG,AccelX,AccelY,AccelZ,Temperature\n';
        const csvRows = ecgData.map((_, index) => {
          return [
            ecgData[index]?.timestamp || '',
            ecgData[index]?.value || '',
            emgData[index]?.value || '',
            accelData.x[index]?.value || '',
            accelData.y[index]?.value || '',
            accelData.z[index]?.value || '',
            tempData[index]?.value || ''
          ].join(',');
        }).join('\n');
        content = csvHeader + csvRows;
        fileName = `neuroscan-data-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'pdf':
        // For PDF, we'll create a simple text representation
        content = `NeuroScan Hardware Data Report\n\nGenerated: ${new Date().toISOString()}\n\nHeart Rate Sensor AD8232 Data Points: ${ecgData.length}\nEMG Data Points: ${emgData.length}\nAccelerometer Data Points: ${accelData.x.length}\nTemperature Data Points: ${tempData.length}`;
        fileName = `neuroscan-report-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
      default:
        return;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (isOnline: boolean) => isOnline ? 'text-green-400' : 'text-red-400';
  const getStatusIcon = (isOnline: boolean) => isOnline ? CheckCircle : XCircle;

  return (
    <div className="space-y-6 p-6">
      {/* Development Status Banner */}
      <Alert className="border-orange-500 bg-orange-500/10">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <AlertDescription className="text-orange-200">
          <div className="space-y-2">
            <p className="font-semibold">Early Development Stage - Demo Data Only</p>
            <p className="text-sm">
              This hardware integration interface is currently in early development. All displayed data is simulated for demonstration purposes. 
              Real sensor data will be available once the NeuroScan waistband device is connected and configured.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Device Connection Status */}
      <Card className="glass-card border-red-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <XCircle className="w-5 h-5" />
            Device Not Connected
          </CardTitle>
          <CardDescription className="text-gray-300">
            NeuroScan waistband device is not currently connected. Please connect your device to view real-time sensor data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex items-center gap-2" disabled>
              <Bluetooth className="w-4 h-4" />
              Connect Device
            </Button>
            <Badge variant="destructive">Offline</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Hardware Data Display</h1>
          <p className="text-gray-400">Demo Interface - Simulated neurological sensor data</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsRecording(!isRecording)}
            variant={isRecording ? "destructive" : "default"}
            className="flex items-center gap-2"
            disabled={!deviceStatus.isConnected}
          >
            {isRecording ? <XCircle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
            {isRecording ? 'Stop Demo' : 'Start Demo'}
          </Button>
        </div>
      </div>

      {/* Device Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Battery Status */}
        <Card className="glass-card opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Battery className="w-4 h-4 text-gray-500" />
              Battery Level
              <Badge variant="outline" className="text-xs">Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold text-gray-500">--</span>
                <Badge variant="secondary">
                  No Device
                </Badge>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-gray-500">Power: -- W</p>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="glass-card opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <WifiOff className="w-4 h-4 text-gray-500" />
              Connectivity
              <Badge variant="outline" className="text-xs">Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">WiFi</span>
                <div className="flex items-center gap-1">
                  <WifiOff className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">--</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Bluetooth</span>
                <div className="flex items-center gap-1">
                  <BluetoothOff className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">Disconnected</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensor Status */}
        <Card className="glass-card opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Gauge className="w-4 h-4 text-gray-500" />
              Sensors
              <Badge variant="outline" className="text-xs">Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(deviceStatus.sensors).map(([sensor, status]) => {
                const StatusIcon = getStatusIcon(status);
                return (
                  <div key={sensor} className="flex items-center gap-1">
                    <StatusIcon className="w-3 h-3 text-gray-500" />
                    <span className="text-xs capitalize text-gray-400">{sensor}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card className="glass-card opacity-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Download className="w-4 h-4 text-gray-500" />
              Export Data
              <Badge variant="outline" className="text-xs">Demo</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportData('json')}
                className="w-full text-xs"
                disabled={!deviceStatus.isConnected}
              >
                <FileText className="w-3 h-3 mr-1" />
                JSON
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportData('csv')}
                className="w-full text-xs"
                disabled={!deviceStatus.isConnected}
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Active Alerts
          </h3>
          {alerts.map((alert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.type === 'error' ? 'border-red-500' : 
              alert.type === 'warning' ? 'border-yellow-500' : 'border-blue-500'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <strong>{alert.sensor}:</strong> {alert.message}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Real-time Charts */}
      <Tabs defaultValue="ecg" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ecg" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Heart Rate Sensor AD8232
          </TabsTrigger>
          <TabsTrigger value="emg" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            EMG
          </TabsTrigger>
          <TabsTrigger value="accel" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Accelerometer
          </TabsTrigger>
          <TabsTrigger value="temp" className="flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Temperature
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ecg">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Heart Rate Sensor AD8232 - Single-lead heart rate monitoring
                <Badge variant="outline" className="text-xs">Demo Data</Badge>
              </CardTitle>
              <CardDescription>Simulated heart electrical activity monitoring - Device not connected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Current BPM: <span className="text-white font-semibold">
                      {ecgData.length > 0 ? Math.round(ecgData[ecgData.length - 1].value) : '--'}
                    </span>
                  </div>
                  <Badge variant={ecgData.length > 0 && ecgData[ecgData.length - 1].value > 100 ? "destructive" : "default"}>
                    {ecgData.length > 0 && ecgData[ecgData.length - 1].value > 100 ? 'Elevated' : 'Normal'}
                  </Badge>
                </div>
                <canvas 
                  ref={ecgCanvasRef} 
                  width={800} 
                  height={200} 
                  className="w-full h-48 bg-gray-900 rounded border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emg">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                EMG - Electromyography
                <Badge variant="outline" className="text-xs">Demo Data</Badge>
              </CardTitle>
              <CardDescription>Simulated muscle electrical activity monitoring - Device not connected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Current Activity: <span className="text-white font-semibold">
                      {emgData.length > 0 ? `${Math.round(emgData[emgData.length - 1].value)}%` : '--'}
                    </span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <canvas 
                  ref={emgCanvasRef} 
                  width={800} 
                  height={200} 
                  className="w-full h-48 bg-gray-900 rounded border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accel">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Accelerometer - Motion Tracking
                <Badge variant="outline" className="text-xs">Demo Data</Badge>
              </CardTitle>
              <CardDescription>Simulated 3-axis acceleration and movement monitoring - Device not connected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-red-400">X-Axis</div>
                    <div className="text-lg font-semibold text-white">
                      {accelData.x.length > 0 ? accelData.x[accelData.x.length - 1].value.toFixed(2) : '--'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-green-400">Y-Axis</div>
                    <div className="text-lg font-semibold text-white">
                      {accelData.y.length > 0 ? accelData.y[accelData.y.length - 1].value.toFixed(2) : '--'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-blue-400">Z-Axis</div>
                    <div className="text-lg font-semibold text-white">
                      {accelData.z.length > 0 ? accelData.z[accelData.z.length - 1].value.toFixed(2) : '--'}
                    </div>
                  </div>
                </div>
                <canvas 
                  ref={accelCanvasRef} 
                  width={800} 
                  height={200} 
                  className="w-full h-48 bg-gray-900 rounded border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temp">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                Temperature Monitoring
                <Badge variant="outline" className="text-xs">Demo Data</Badge>
              </CardTitle>
              <CardDescription>Simulated body temperature tracking - Device not connected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    Current Temp: <span className="text-white font-semibold">
                      {tempData.length > 0 ? `${tempData[tempData.length - 1].value.toFixed(1)}°C` : '--'}
                    </span>
                  </div>
                  <Badge variant="default">Normal</Badge>
                </div>
                <canvas 
                  ref={tempCanvasRef} 
                  width={800} 
                  height={200} 
                  className="w-full h-48 bg-gray-900 rounded border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Historical Data Section */}
      <Card className="glass-card opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Historical Data & Trends
            <Badge variant="outline" className="text-xs">Demo Data</Badge>
          </CardTitle>
          <CardDescription>Simulated data analysis and historical comparison - Device not connected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <div className="text-sm text-gray-500">Session Duration</div>
              <div className="text-xl font-bold text-gray-500">
                --:--
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <div className="text-sm text-gray-500">Data Points</div>
              <div className="text-xl font-bold text-gray-500">
                {ecgData.length + emgData.length + accelData.x.length + tempData.length} (Demo)
              </div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Activity className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <div className="text-sm text-gray-500">Data Rate</div>
              <div className="text-xl font-bold text-gray-500">-- Hz</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HardwareDataDisplay;
