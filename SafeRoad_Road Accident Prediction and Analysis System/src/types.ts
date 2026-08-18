export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  roadTypeHint?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string; // Clear, Rainy, Foggy, Snowy, Overcast, Stormy
  visibilityKm: number;
  humidity: number;
  windSpeedKmh: number;
  isRaining: boolean;
  rainIntensity: 'none' | 'light' | 'moderate' | 'heavy';
}

export interface PredictionInput {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  vehicleType: 'Car' | 'Motorcycle' | 'Bus' | 'Truck' | 'Bicycle' | 'Other';
  speedLimit: number;
  roadType: 'Highway' | 'Urban Street' | 'Rural Road' | 'Intersection' | 'Expressway';
  trafficDensity: 'Low' | 'Moderate' | 'Heavy' | 'Congested';
  weatherCondition: string;
  visibilityKm: number;
  isRaining: boolean;
  timeOfDay: string; // e.g., '14:30'
  isNight: boolean;
  location: LocationData;
}

export interface RiskFactor {
  name: string;
  impact: 'High' | 'Medium' | 'Low';
  contributionPct: number;
  description: string;
}

export interface PredictionResult {
  id: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  severity: 'Slight' | 'Severe' | 'Fatal';
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number; // 0 to 100
  confidenceScore: number; // e.g. 88.5
  probabilities: {
    slight: number;
    severe: number;
    fatal: number;
  };
  keyFactors: RiskFactor[];
  recommendations: string[];
  input: PredictionInput;
  aiInsight?: string;
}

export interface Alert {
  id: string;
  predictionId?: string;
  userId?: string;
  userName?: string;
  alertMessage: string;
  recipient?: string;
  type: 'whatsapp' | 'sms' | 'email' | 'copy';
  status: 'Sent' | 'Pending' | 'Copied';
  sentAt: string;
  severity: string;
  location: {
    city: string;
    latitude: number;
    longitude: number;
  };
}

export interface Hotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  severity: 'Slight' | 'Severe' | 'Fatal';
  riskScore: number; // 0-100
  accidentCount: number;
  roadType: string;
  primaryCause: string;
  description: string;
  createdAt: string;
}

export interface AnalyticsData {
  totalPredictions: number;
  highRiskCount: number;
  fatalCount: number;
  severeCount: number;
  slightCount: number;
  avgConfidence: number;
  severityByVehicle: { vehicle: string; slight: number; severe: number; fatal: number }[];
  riskByRoadType: { roadType: string; avgRiskScore: number; count: number }[];
  severityByWeather: { weather: string; count: number }[];
  hourlyRiskTrend: { hour: string; avgRisk: number }[];
}

export interface GeofenceAlertNotification {
  id: string;
  hotspot: Hotspot;
  distanceKm: number;
  timestamp: string;
  isRead?: boolean;
}

// --- AI CAMERA & DRIVER SAFETY TYPES ---

export type DriverStatus = 'Safe' | 'Attention Required' | 'High Risk' | 'Critical Risk';

export interface DriverSafetyMetrics {
  fatigueScore: number; // 0 - 100
  alertnessScore: number; // 0 - 100
  distractionScore: number; // 0 - 100
  focusScore: number; // 0 - 100
  eyeAspectRatio: number; // EAR value e.g. 0.28
  mouthAspectRatio: number; // MAR value e.g. 0.15
  headPose: 'Centered' | 'Looking Left' | 'Looking Right' | 'Looking Down' | 'Face Missing';
  isYawning: boolean;
  isEyeClosed: boolean;
  isMicrosleep: boolean;
  isPhoneUsageDetected: boolean;
  driverStatus: DriverStatus;
  updatedAt: string;
}

export interface CameraSession {
  id: string;
  userId?: string;
  userName?: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  totalEventsCount: number;
  maxFatigueScore: number;
  avgFocusScore: number;
  status: 'Active' | 'Completed' | 'Interrupted';
}

export interface DriverEvent {
  id: string;
  sessionId: string;
  userId?: string;
  eventType: 'drowsiness' | 'yawn' | 'microsleep' | 'distraction' | 'phone_usage' | 'head_pose' | 'emergency';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  fatigueScore: number;
  focusScore: number;
  description: string;
  timestamp: string;
  snapshotUrl?: string;
}

export interface EmergencyEvent {
  id: string;
  userId?: string;
  userName?: string;
  sessionId?: string;
  timestamp: string;
  fatigueScore: number;
  accidentRiskScore: number;
  alertLevel: 'High Risk' | 'Critical Risk';
  location: LocationData;
  weather: WeatherData;
  snapshotUrl?: string;
  status: 'Logged' | 'Alert Sent' | 'Resolved';
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  category: 'Auth' | 'Prediction' | 'Camera' | 'Alert' | 'Admin';
  timestamp: string;
  ipAddress?: string;
  details: string;
}

export type InventoryCategory = 'Vehicle' | 'Camera' | 'Safety Equipment' | 'GPS Device' | 'Stock' | 'Other';
export type InventoryStatus = 'Operational' | 'In Maintenance' | 'Deployed' | 'Low Stock' | 'Decommissioned';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  sku: string;
  serialNumber: string;
  status: InventoryStatus;
  stockQuantity: number;
  minStockThreshold: number;
  assignedTo: string;
  location: string;
  purchaseDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  itemId: string;
  itemName: string;
  issue: string;
  actionTaken: string;
  cost: number;
  technician: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  scheduledDate: string;
  completedDate: string;
  createdAt: string;
}
