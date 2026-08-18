import { User, PredictionResult, Alert, Hotspot, InventoryItem, MaintenanceRecord } from '../types';

export class AppDatabase {
  private static instance: AppDatabase;
  private users: User[] = [];
  private predictions: PredictionResult[] = [];
  private alerts: Alert[] = [];
  private hotspots: Hotspot[] = [];
  private inventoryItems: InventoryItem[] = [];
  private maintenanceRecords: MaintenanceRecord[] = [];

  private constructor() {
    this.seedUsers();
    this.seedHotspots();
    this.seedMockPredictions();
    this.seedInventory();
    this.seedMaintenance();
  }

  private seedInventory() {
    this.inventoryItems = [
      {
        id: 'inv_1',
        name: 'AI Smart Dashcam Pro X1',
        category: 'Camera',
        sku: 'CAM-AI-901',
        serialNumber: 'SN-99882104',
        status: 'Operational',
        stockQuantity: 24,
        minStockThreshold: 5,
        assignedTo: 'Alexander Wright',
        location: 'Vehicle Unit #104 (Tesla Model Y)',
        purchaseDate: '2026-01-10',
        lastMaintenanceDate: '2026-07-15',
        nextMaintenanceDate: '2027-01-15',
        notes: 'Equipped with infrared night vision and MediaPipe driver fatigue tracking.',
        createdBy: 'usr_admin',
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
      },
      {
        id: 'inv_2',
        name: 'Fleet Patrol Cruiser Ford Explorer',
        category: 'Vehicle',
        sku: 'VEH-FRD-01',
        serialNumber: 'VIN-1FT7W2B89REC',
        status: 'Operational',
        stockQuantity: 8,
        minStockThreshold: 2,
        assignedTo: 'Lead Safety Patrol Team',
        location: 'Central Depot Bay 4',
        purchaseDate: '2025-11-20',
        lastMaintenanceDate: '2026-08-01',
        nextMaintenanceDate: '2026-11-01',
        notes: 'High endurance patrol vehicle fitted with automated geofence radar.',
        createdBy: 'usr_admin',
        createdAt: new Date(Date.now() - 120 * 86400000).toISOString()
      },
      {
        id: 'inv_3',
        name: 'GPS Ultra-Tracker SatCom 5G',
        category: 'GPS Device',
        sku: 'GPS-SAT-5G',
        serialNumber: 'GPS-7749021',
        status: 'Deployed',
        stockQuantity: 3,
        minStockThreshold: 6, // Low stock example
        assignedTo: 'Express Logistics Unit Alpha',
        location: 'Active Transit',
        purchaseDate: '2026-03-05',
        lastMaintenanceDate: '2026-06-10',
        nextMaintenanceDate: '2026-09-10',
        notes: 'Real-time telemetry and sub-meter GPS positioning module.',
        createdBy: 'usr_admin',
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
      },
      {
        id: 'inv_4',
        name: 'High-Visibility LED Safety Vest Set (Box of 10)',
        category: 'Safety Equipment',
        sku: 'SAF-VEST-10',
        serialNumber: 'VEST-LOT-442',
        status: 'Operational',
        stockQuantity: 45,
        minStockThreshold: 10,
        assignedTo: 'Field Emergency Response Team',
        location: 'Warehouse Room B',
        purchaseDate: '2026-04-12',
        lastMaintenanceDate: '2026-05-01',
        nextMaintenanceDate: '2027-05-01',
        notes: 'ANSI/ISEA class 3 certified reflective safety wear.',
        createdBy: 'usr_admin',
        createdAt: new Date(Date.now() - 80 * 86400000).toISOString()
      },
      {
        id: 'inv_5',
        name: 'Emergency Medical Trauma Kit Level 2',
        category: 'Safety Equipment',
        sku: 'MED-KIT-02',
        serialNumber: 'MED-883190',
        status: 'Operational',
        stockQuantity: 18,
        minStockThreshold: 4,
        assignedTo: 'All Patrol Units',
        location: 'Emergency Cabinet #3',
        purchaseDate: '2026-02-14',
        lastMaintenanceDate: '2026-07-20',
        nextMaintenanceDate: '2026-10-20',
        notes: 'Contains tourniquets, quick-clot gauze, and automated trauma dressings.',
        createdBy: 'usr_admin',
        createdAt: new Date(Date.now() - 100 * 86400000).toISOString()
      },
      {
        id: 'inv_6',
        name: 'LiDAR Road Hazard Scanner Sensor',
        category: 'Camera',
        sku: 'LIDAR-SCAN-9',
        serialNumber: 'LIDAR-339210',
        status: 'In Maintenance',
        stockQuantity: 2,
        minStockThreshold: 2,
        assignedTo: 'Tech Engineering Dept',
        location: 'Repair Lab #2',
        purchaseDate: '2025-10-01',
        lastMaintenanceDate: '2026-08-10',
        nextMaintenanceDate: '2026-08-25',
        notes: 'Undergoing optical calibration and firmware update.',
        createdBy: 'usr_admin',
        createdAt: new Date(Date.now() - 150 * 86400000).toISOString()
      }
    ];
  }

  private seedMaintenance() {
    this.maintenanceRecords = [
      {
        id: 'maint_1',
        itemId: 'inv_6',
        itemName: 'LiDAR Road Hazard Scanner Sensor',
        issue: 'Optical lens calibration drifting during high temperature operation.',
        actionTaken: 'Realigned laser emitter arrays and updated firmware to v4.2.',
        cost: 350,
        technician: 'David Miller (Senior Tech)',
        status: 'In Progress',
        scheduledDate: '2026-08-10',
        completedDate: '',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'maint_2',
        itemId: 'inv_2',
        itemName: 'Fleet Patrol Cruiser Ford Explorer',
        issue: 'Routine 10,000-mile tire rotation and brake pad inspection.',
        actionTaken: 'Rotated all 4 tires, replaced front brake pads, tested radar telemetry.',
        cost: 480,
        technician: 'Metro Fleet Service Center',
        status: 'Completed',
        scheduledDate: '2026-08-01',
        completedDate: '2026-08-01',
        createdAt: new Date(Date.now() - 17 * 86400000).toISOString()
      },
      {
        id: 'maint_3',
        itemId: 'inv_1',
        itemName: 'AI Smart Dashcam Pro X1',
        issue: 'Quarterly lens cleaning and AI model telemetry check.',
        actionTaken: 'Cleaned wide-angle lens, recalibrated eye-tracking bounding box.',
        cost: 120,
        technician: 'AI Systems Unit',
        status: 'Completed',
        scheduledDate: '2026-07-15',
        completedDate: '2026-07-15',
        createdAt: new Date(Date.now() - 34 * 86400000).toISOString()
      }
    ];
  }

  public getInventoryItems(): InventoryItem[] {
    return this.inventoryItems;
  }

  public createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    this.inventoryItems.unshift(newItem);
    return newItem;
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem | null {
    const idx = this.inventoryItems.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.inventoryItems[idx] = { ...this.inventoryItems[idx], ...updates };
    return this.inventoryItems[idx];
  }

  public deleteInventoryItem(id: string): boolean {
    const len = this.inventoryItems.length;
    this.inventoryItems = this.inventoryItems.filter((i) => i.id !== id);
    return this.inventoryItems.length < len;
  }

  public getMaintenanceRecords(): MaintenanceRecord[] {
    return this.maintenanceRecords;
  }

  public createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id' | 'createdAt'>): MaintenanceRecord {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `maint_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    this.maintenanceRecords.unshift(newRecord);
    return newRecord;
  }

  public updateMaintenanceRecord(id: string, updates: Partial<MaintenanceRecord>): MaintenanceRecord | null {
    const idx = this.maintenanceRecords.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.maintenanceRecords[idx] = { ...this.maintenanceRecords[idx], ...updates };
    return this.maintenanceRecords[idx];
  }

  public deleteMaintenanceRecord(id: string): boolean {
    const len = this.maintenanceRecords.length;
    this.maintenanceRecords = this.maintenanceRecords.filter((m) => m.id !== id);
    return this.maintenanceRecords.length < len;
  }

  public static getInstance(): AppDatabase {
    if (!AppDatabase.instance) {
      AppDatabase.instance = new AppDatabase();
    }
    return AppDatabase.instance;
  }

  private seedUsers() {
    this.users = [
      {
        id: 'usr_admin',
        name: 'SafeRoad Administrator',
        email: 'admin@saferoad.sys',
        phone: '+1 800 555 0199',
        role: 'admin',
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'usr_demo',
        name: 'Alexander Wright',
        email: 'alexander@example.com',
        phone: '+1 555 012 3456',
        role: 'user',
        status: 'active',
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      }
    ];
  }

  private seedHotspots() {
    this.hotspots = [
      {
        id: 'hs_1',
        name: 'Intersection of 5th Ave & 42nd St',
        latitude: 40.7527,
        longitude: -73.9822,
        city: 'New York',
        region: 'NY',
        severity: 'Fatal',
        riskScore: 92,
        accidentCount: 48,
        roadType: 'Intersection',
        primaryCause: 'High Pedestrian Density & Blind Turning Signals',
        description: 'Major urban intersection with frequent turning conflict points during rush hour.',
        createdAt: '2026-01-15T10:00:00.000Z'
      },
      {
        id: 'hs_2',
        name: 'Highway 101 - Devil\'s Slide Junction',
        latitude: 37.5841,
        longitude: -122.5028,
        city: 'San Francisco',
        region: 'CA',
        severity: 'Fatal',
        riskScore: 89,
        accidentCount: 36,
        roadType: 'Highway',
        primaryCause: 'Sharp Coastal Curves & Sudden Fog Banks',
        description: 'High speed coastal highway section prone to moisture accumulation and steep drop-offs.',
        createdAt: '2026-02-01T12:00:00.000Z'
      },
      {
        id: 'hs_3',
        name: 'Piccadilly Circus Outer Ring',
        latitude: 51.5101,
        longitude: -0.1342,
        city: 'London',
        region: 'Greater London',
        severity: 'Severe',
        riskScore: 74,
        accidentCount: 29,
        roadType: 'Urban Street',
        primaryCause: 'Multi-lane Merging & Heavy Tourist Foot Traffic',
        description: 'Complex round-the-clock traffic junction with frequent cycle-vehicle conflicts.',
        createdAt: '2026-02-10T14:30:00.000Z'
      },
      {
        id: 'hs_4',
        name: 'M4 Motorway Junction 10',
        latitude: 51.4362,
        longitude: -0.8651,
        city: 'Reading',
        region: 'Berkshire',
        severity: 'Fatal',
        riskScore: 86,
        accidentCount: 42,
        roadType: 'Expressway',
        primaryCause: 'High Speed Differential & Sudden Congestion Tailbacks',
        description: 'Expressway merge point prone to high velocity rear-end collisions.',
        createdAt: '2026-02-18T09:15:00.000Z'
      },
      {
        id: 'hs_5',
        name: 'Shibuya Crossing North Lane',
        latitude: 35.6595,
        longitude: 139.7004,
        city: 'Tokyo',
        region: 'Kanto',
        severity: 'Severe',
        riskScore: 68,
        accidentCount: 22,
        roadType: 'Intersection',
        primaryCause: 'Wet Road Surface & High Turning Traffic',
        description: 'Busiest pedestrian intersection in Tokyo requiring strict speed reduction.',
        createdAt: '2026-03-01T08:00:00.000Z'
      },
      {
        id: 'hs_6',
        name: 'I-95 South Miami Exit Ramp',
        latitude: 25.7617,
        longitude: -80.1918,
        city: 'Miami',
        region: 'FL',
        severity: 'Fatal',
        riskScore: 91,
        accidentCount: 54,
        roadType: 'Highway',
        primaryCause: 'Heavy Sudden Rainstorms & Hydroplaning',
        description: 'High risk tropical rain zone with reduced water drainage during severe downpours.',
        createdAt: '2026-03-05T11:20:00.000Z'
      },
      {
        id: 'hs_7',
        name: 'B2 Highway Brandenburg Forest Sector',
        latitude: 52.3988,
        longitude: 13.0657,
        city: 'Potsdam',
        region: 'Brandenburg',
        severity: 'Slight',
        riskScore: 38,
        accidentCount: 14,
        roadType: 'Rural Road',
        primaryCause: 'Wildlife Crossing & Low Night Lighting',
        description: 'Rural road surrounded by forest coverage with frequent deer crossing warnings.',
        createdAt: '2026-03-12T16:00:00.000Z'
      },
      {
        id: 'hs_8',
        name: 'Marina Coastal Expressway Tunnel Entrance',
        latitude: 1.2762,
        longitude: 103.8550,
        city: 'Singapore',
        region: 'Central',
        severity: 'Slight',
        riskScore: 32,
        accidentCount: 9,
        roadType: 'Expressway',
        primaryCause: 'Speed Transition into Subterranean Tunnel',
        description: 'Modern Expressway segment equipped with intelligent monitoring sensors.',
        createdAt: '2026-03-20T10:00:00.000Z'
      }
    ];
  }

  private seedMockPredictions() {
    this.predictions = [
      {
        id: 'pred_seed_1',
        userId: 'usr_demo',
        userName: 'Alexander Wright',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        severity: 'Fatal',
        riskLevel: 'High',
        riskScore: 88,
        confidenceScore: 91.2,
        probabilities: { slight: 0.05, severe: 0.25, fatal: 0.70 },
        keyFactors: [
          { name: 'High Speed Zone', impact: 'High', contributionPct: 35, description: 'Speed limit 110 km/h in wet conditions.' },
          { name: 'Adverse Weather', impact: 'High', contributionPct: 30, description: 'Stormy rain with 1.2km visibility.' }
        ],
        recommendations: [
          'Reduce vehicle speed immediately by at least 25 km/h.',
          'Turn on fog lights and hazard lights in reduced visibility.',
          'Maintain 5-second gap with leading vehicles.'
        ],
        input: {
          age: 23,
          gender: 'Male',
          vehicleType: 'Motorcycle',
          speedLimit: 110,
          roadType: 'Highway',
          trafficDensity: 'Heavy',
          weatherCondition: 'Stormy',
          visibilityKm: 1.2,
          isRaining: true,
          timeOfDay: '21:15',
          isNight: true,
          location: { latitude: 37.5841, longitude: -122.5028, city: 'San Francisco', region: 'CA', country: 'USA' }
        },
        aiInsight: 'Crucial Risk Warning: Operating a Motorcycle on high-speed coastal highways during stormy nighttime conditions creates an exponential risk factor. Brake response margins are severely compromised by wet pavement friction reduction.'
      },
      {
        id: 'pred_seed_2',
        userId: 'usr_demo',
        userName: 'Alexander Wright',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        severity: 'Severe',
        riskLevel: 'Medium',
        riskScore: 56,
        confidenceScore: 88.4,
        probabilities: { slight: 0.18, severe: 0.58, fatal: 0.24 },
        keyFactors: [
          { name: 'Complex Intersection', impact: 'High', contributionPct: 40, description: 'Heavy urban traffic during evening peak hours.' }
        ],
        recommendations: [
          'Exercise vigilance at multi-lane signal switches.',
          'Avoid sudden lane departures without signaling.'
        ],
        input: {
          age: 34,
          gender: 'Male',
          vehicleType: 'Car',
          speedLimit: 60,
          roadType: 'Intersection',
          trafficDensity: 'Congested',
          weatherCondition: 'Overcast',
          visibilityKm: 6.0,
          isRaining: false,
          timeOfDay: '18:30',
          isNight: false,
          location: { latitude: 40.7527, longitude: -73.9822, city: 'New York', region: 'NY', country: 'USA' }
        }
      },
      {
        id: 'pred_seed_3',
        userId: 'usr_demo',
        userName: 'Alexander Wright',
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
        severity: 'Slight',
        riskLevel: 'Low',
        riskScore: 24,
        confidenceScore: 94.1,
        probabilities: { slight: 0.82, severe: 0.15, fatal: 0.03 },
        keyFactors: [
          { name: 'Optimal Driving Conditions', impact: 'Low', contributionPct: 80, description: 'Clear daylight weather and low traffic density.' }
        ],
        recommendations: [
          'Maintain regular lane safety discipline.',
          'Enjoy smooth driving conditions while staying observant.'
        ],
        input: {
          age: 34,
          gender: 'Male',
          vehicleType: 'Car',
          speedLimit: 50,
          roadType: 'Urban Street',
          trafficDensity: 'Low',
          weatherCondition: 'Clear',
          visibilityKm: 10.0,
          isRaining: false,
          timeOfDay: '10:15',
          isNight: false,
          location: { latitude: 51.5101, longitude: -0.1342, city: 'London', region: 'Greater London', country: 'UK' }
        }
      }
    ];

    this.alerts = [
      {
        id: 'alt_1',
        predictionId: 'pred_seed_1',
        userId: 'usr_demo',
        userName: 'Alexander Wright',
        alertMessage: 'Road Accident Risk Alert\nSeverity: Fatal (High Risk)\nLocation: San Francisco, CA (37.5841, -122.5028)\nWeather: Stormy, Raining (Visibility 1.2km)\nTimestamp: ' + new Date().toLocaleString(),
        recipient: '+1 555 999 8877',
        type: 'whatsapp',
        status: 'Sent',
        sentAt: new Date(Date.now() - 3500000 * 2).toISOString(),
        severity: 'Fatal',
        location: { city: 'San Francisco', latitude: 37.5841, longitude: -122.5028 }
      }
    ];
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Omit<User, 'id' | 'role' | 'status' | 'createdAt'> & { role?: 'user' | 'admin' }): User {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role || 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.users.unshift(newUser);
    return newUser;
  }

  public updateUserStatus(userId: string, status: 'active' | 'suspended'): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;
    user.status = status;
    return user;
  }

  public deleteUser(userId: string): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== userId);
    return this.users.length < initialLen;
  }

  // --- Predictions ---
  public getPredictions(): PredictionResult[] {
    return this.predictions;
  }

  public getUserPredictions(userId: string): PredictionResult[] {
    return this.predictions.filter((p) => p.userId === userId);
  }

  public savePrediction(prediction: PredictionResult): PredictionResult {
    this.predictions.unshift(prediction);
    return prediction;
  }

  // --- Alerts ---
  public getAlerts(): Alert[] {
    return this.alerts;
  }

  public getUserAlerts(userId: string): Alert[] {
    return this.alerts.filter((a) => a.userId === userId);
  }

  public saveAlert(alert: Omit<Alert, 'id' | 'sentAt'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sentAt: new Date().toISOString()
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  // --- Hotspots ---
  public getHotspots(): Hotspot[] {
    return this.hotspots;
  }

  public addHotspot(hotspot: Omit<Hotspot, 'id' | 'createdAt'>): Hotspot {
    const newHotspot: Hotspot = {
      ...hotspot,
      id: `hs_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.hotspots.unshift(newHotspot);
    return newHotspot;
  }

  public importHotspotsFromCsv(csvText: string): { importedCount: number; errors: string[] } {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return { importedCount: 0, errors: ['CSV file is empty or missing headers.'] };
    }

    let count = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 7) {
        errors.push(`Line ${i + 1}: Insufficient columns (expected at least name, lat, lng, city, severity, riskScore, accidentCount).`);
        continue;
      }

      const [name, latStr, lngStr, city, severityStr, riskScoreStr, accidentCountStr, roadType, primaryCause, description] = parts;

      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      const riskScore = parseInt(riskScoreStr, 10) || 50;
      const accidentCount = parseInt(accidentCountStr, 10) || 10;
      const severity = (['Slight', 'Severe', 'Fatal'].includes(severityStr) ? severityStr : 'Severe') as 'Slight' | 'Severe' | 'Fatal';

      if (isNaN(lat) || isNaN(lng)) {
        errors.push(`Line ${i + 1}: Invalid latitude/longitude values.`);
        continue;
      }

      this.addHotspot({
        name: name || `Hotspot Location #${i}`,
        latitude: lat,
        longitude: lng,
        city: city || 'Unknown City',
        region: 'Region',
        severity,
        riskScore,
        accidentCount,
        roadType: roadType || 'Urban Street',
        primaryCause: primaryCause || 'High traffic intersection collision',
        description: description || 'Imported accident hotspot data record.'
      });
      count++;
    }

    return { importedCount: count, errors };
  }

  // --- Analytics Generator ---
  public getAnalytics() {
    const totalPredictions = this.predictions.length;
    let highRiskCount = 0;
    let fatalCount = 0;
    let severeCount = 0;
    let slightCount = 0;
    let sumConfidence = 0;

    const vehicleMap: Record<string, { slight: number; severe: number; fatal: number }> = {
      Car: { slight: 0, severe: 0, fatal: 0 },
      Motorcycle: { slight: 0, severe: 0, fatal: 0 },
      Truck: { slight: 0, severe: 0, fatal: 0 },
      Bus: { slight: 0, severe: 0, fatal: 0 },
      Bicycle: { slight: 0, severe: 0, fatal: 0 },
      Other: { slight: 0, severe: 0, fatal: 0 }
    };

    const roadMap: Record<string, { totalRisk: number; count: number }> = {
      Highway: { totalRisk: 0, count: 0 },
      'Urban Street': { totalRisk: 0, count: 0 },
      'Rural Road': { totalRisk: 0, count: 0 },
      Intersection: { totalRisk: 0, count: 0 },
      Expressway: { totalRisk: 0, count: 0 }
    };

    const weatherMap: Record<string, number> = {};

    this.predictions.forEach((p) => {
      if (p.riskLevel === 'High') highRiskCount++;
      if (p.severity === 'Fatal') fatalCount++;
      if (p.severity === 'Severe') severeCount++;
      if (p.severity === 'Slight') slightCount++;
      sumConfidence += p.confidenceScore;

      const vType = p.input.vehicleType || 'Car';
      if (!vehicleMap[vType]) vehicleMap[vType] = { slight: 0, severe: 0, fatal: 0 };
      if (p.severity === 'Fatal') vehicleMap[vType].fatal++;
      else if (p.severity === 'Severe') vehicleMap[vType].severe++;
      else vehicleMap[vType].slight++;

      const rType = p.input.roadType || 'Urban Street';
      if (!roadMap[rType]) roadMap[rType] = { totalRisk: 0, count: 0 };
      roadMap[rType].totalRisk += p.riskScore;
      roadMap[rType].count++;

      const wCond = p.input.weatherCondition || 'Clear';
      weatherMap[wCond] = (weatherMap[wCond] || 0) + 1;
    });

    const severityByVehicle = Object.keys(vehicleMap).map((v) => ({
      vehicle: v,
      slight: vehicleMap[v].slight,
      severe: vehicleMap[v].severe,
      fatal: vehicleMap[v].fatal
    }));

    const riskByRoadType = Object.keys(roadMap).map((r) => ({
      roadType: r,
      avgRiskScore: roadMap[r].count > 0 ? Math.round(roadMap[r].totalRisk / roadMap[r].count) : 0,
      count: roadMap[r].count
    }));

    const severityByWeather = Object.keys(weatherMap).map((w) => ({
      weather: w,
      count: weatherMap[w]
    }));

    const hourlyRiskTrend = [
      { hour: '00:00', avgRisk: 62 },
      { hour: '04:00', avgRisk: 68 },
      { hour: '08:00', avgRisk: 45 },
      { hour: '12:00', avgRisk: 32 },
      { hour: '16:00', avgRisk: 52 },
      { hour: '20:00', avgRisk: 74 }
    ];

    return {
      totalPredictions,
      highRiskCount,
      fatalCount,
      severeCount,
      slightCount,
      avgConfidence: totalPredictions > 0 ? parseFloat((sumConfidence / totalPredictions).toFixed(1)) : 90.0,
      severityByVehicle,
      riskByRoadType,
      severityByWeather,
      hourlyRiskTrend
    };
  }
}
