import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { AppDatabase } from './src/server/db';
import { AccidentSeverityPredictor } from './src/server/ml';
import { generateAiInsight } from './src/server/gemini';
import { PredictionInput } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  const db = AppDatabase.getInstance();
  const mlPredictor = AccidentSeverityPredictor.getInstance();

  // --- API ROUTES ---

  // Health check & Model info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      system: 'SafeRoad - Road Accident Prediction & Risk Analysis Engine',
      metrics: mlPredictor.getModelMetrics(),
      timestamp: new Date().toISOString()
    });
  });

  // Auth Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const user = db.createUser({ name, email, phone: phone || '', role: 'user' });
    const token = `jwt_token_${user.id}_${Date.now()}`;
    return res.json({ user, token });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended. Please contact administrator.' });
    }

    const token = `jwt_token_${user.id}_${Date.now()}`;
    return res.json({ user, token });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided.' });
    }
    const tokenParts = authHeader.split('_');
    if (tokenParts.length >= 3) {
      const userId = tokenParts[2];
      const user = db.getUserById(userId);
      if (user) {
        return res.json({ user });
      }
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  });

  // --- INVENTORY MANAGEMENT API ---
  app.get('/api/inventory', (req, res) => {
    try {
      const items = db.getInventoryItems();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch inventory items' });
    }
  });

  app.post('/api/inventory', (req, res) => {
    try {
      const { name, category, sku, serialNumber, status, stockQuantity, minStockThreshold, assignedTo, location, purchaseDate, lastMaintenanceDate, nextMaintenanceDate, notes, createdBy } = req.body;
      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required.' });
      }
      const newItem = db.createInventoryItem({
        name,
        category,
        sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        serialNumber: serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        status: status || 'Operational',
        stockQuantity: Number(stockQuantity) || 1,
        minStockThreshold: Number(minStockThreshold) || 2,
        assignedTo: assignedTo || 'Unassigned',
        location: location || 'Main Warehouse',
        purchaseDate: purchaseDate || new Date().toISOString().slice(0, 10),
        lastMaintenanceDate: lastMaintenanceDate || new Date().toISOString().slice(0, 10),
        nextMaintenanceDate: nextMaintenanceDate || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        notes: notes || '',
        createdBy: createdBy || 'usr_admin'
      });
      res.json(newItem);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create inventory item' });
    }
  });

  app.put('/api/inventory/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updated = db.updateInventoryItem(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Inventory item not found.' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update inventory item' });
    }
  });

  app.delete('/api/inventory/:id', (req, res) => {
    try {
      const { id } = req.params;
      const success = db.deleteInventoryItem(id);
      if (!success) {
        return res.status(404).json({ error: 'Inventory item not found.' });
      }
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete inventory item' });
    }
  });

  // --- MAINTENANCE RECORDS API ---
  app.get('/api/maintenance', (req, res) => {
    try {
      const records = db.getMaintenanceRecords();
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch maintenance records' });
    }
  });

  app.post('/api/maintenance', (req, res) => {
    try {
      const { itemId, itemName, issue, actionTaken, cost, technician, status, scheduledDate, completedDate } = req.body;
      if (!itemId || !itemName || !issue) {
        return res.status(400).json({ error: 'Item ID, item name, and issue are required.' });
      }
      const newRecord = db.createMaintenanceRecord({
        itemId,
        itemName,
        issue,
        actionTaken: actionTaken || 'Pending inspection',
        cost: Number(cost) || 0,
        technician: technician || 'Assigned Technician',
        status: status || 'Scheduled',
        scheduledDate: scheduledDate || new Date().toISOString().slice(0, 10),
        completedDate: completedDate || ''
      });
      res.json(newRecord);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create maintenance record' });
    }
  });

  app.put('/api/maintenance/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updated = db.updateMaintenanceRecord(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Maintenance record not found.' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update maintenance record' });
    }
  });

  app.delete('/api/maintenance/:id', (req, res) => {
    try {
      const { id } = req.params;
      const success = db.deleteMaintenanceRecord(id);
      if (!success) {
        return res.status(404).json({ error: 'Maintenance record not found.' });
      }
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete maintenance record' });
    }
  });

  // Reverse Geocoding Proxy
  app.get('/api/geocode', async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    try {
      // Use OpenStreetMap Nominatim API with fallback
      const latNum = parseFloat(lat as string);
      const lngNum = parseFloat(lng as string);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latNum}&lon=${lngNum}&format=json`,
        { headers: { 'User-Agent': 'SafeRoadAI-App/1.0' } }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const city = address.city || address.town || address.village || address.suburb || address.county || 'Detected Area';
        const region = address.state || address.region || address.province || 'State/Region';
        const country = address.country || 'Country';

        return res.json({
          city,
          region,
          country,
          latitude: latNum,
          longitude: lngNum,
          formattedAddress: data.display_name || `${city}, ${region}, ${country}`
        });
      }
    } catch (err) {
      console.warn('Geocoding fetch fallback:', err);
    }

    // Smart Fallback Location mapping
    return res.json({
      city: 'Current Geo Location',
      region: 'Automated Region',
      country: 'Global',
      latitude: parseFloat(lat as string),
      longitude: parseFloat(lng as string)
    });
  });

  // Weather Proxy Endpoint
  app.get('/api/weather', async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    const latNum = parseFloat(lat as string);
    const lngNum = parseFloat(lng as string);

    // If OpenWeather API key is present in process.env, fetch live
    if (process.env.OPENWEATHER_API_KEY) {
      try {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latNum}&lon=${lngNum}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
        );
        if (weatherRes.ok) {
          const wData = await weatherRes.json();
          const isRaining = Boolean(wData.rain || wData.weather?.[0]?.main?.toLowerCase().includes('rain'));
          return res.json({
            temperature: Math.round(wData.main.temp),
            condition: wData.weather?.[0]?.main || 'Clear',
            visibilityKm: parseFloat(((wData.visibility || 10000) / 1000).toFixed(1)),
            humidity: wData.main.humidity,
            windSpeedKmh: Math.round((wData.wind.speed || 3) * 3.6),
            isRaining,
            rainIntensity: isRaining ? 'moderate' : 'none'
          });
        }
      } catch (err) {
        console.warn('Live Weather fetch failed, falling back:', err);
      }
    }

    // Deterministic Weather simulation based on coordinates and time of day for high fidelity response
    const hour = new Date().getHours();
    const hash = Math.abs(Math.sin(latNum * 10 + lngNum * 5));
    const isRaining = hash > 0.65;
    const tempC = Math.round(18 + Math.cos(hour / 3.8) * 8 + (hash * 4 - 2));

    let condition = 'Clear';
    if (isRaining) {
      condition = hash > 0.82 ? 'Stormy' : 'Rainy';
    } else if (hash > 0.45) {
      condition = 'Overcast';
    } else if (hash < 0.15) {
      condition = 'Foggy';
    }

    const visibilityKm = isRaining ? 2.5 : condition === 'Foggy' ? 1.2 : 10.0;

    return res.json({
      temperature: tempC,
      condition,
      visibilityKm,
      humidity: Math.round(50 + hash * 40),
      windSpeedKmh: Math.round(10 + hash * 25),
      isRaining,
      rainIntensity: isRaining ? (hash > 0.82 ? 'heavy' : 'moderate') : 'none'
    });
  });

  // ML Prediction Endpoint
  app.post('/api/predict', async (req, res) => {
    const input: PredictionInput = req.body.input;
    const userId = req.body.userId;
    const userName = req.body.userName;

    if (!input || typeof input.age !== 'number' || !input.vehicleType) {
      return res.status(400).json({ error: 'Invalid prediction parameters provided.' });
    }

    // 1. Run ML Pipeline
    const predictionResult = mlPredictor.predict(input);
    if (userId) {
      predictionResult.userId = userId;
      predictionResult.userName = userName || 'User';
    }

    // 2. Optional Gemini AI Enhancement
    try {
      const aiInsight = await generateAiInsight(predictionResult);
      predictionResult.aiInsight = aiInsight;
    } catch (e) {
      console.warn('AI insight generation skipped:', e);
    }

    // 3. Save Prediction to DB
    db.savePrediction(predictionResult);

    return res.json(predictionResult);
  });

  // Prediction History Endpoint
  app.get('/api/predictions', (req, res) => {
    const userId = req.query.userId as string;
    if (userId) {
      return res.json(db.getUserPredictions(userId));
    }
    return res.json(db.getPredictions());
  });

  // Emergency Alert Endpoint
  app.post('/api/alerts', (req, res) => {
    const { predictionId, userId, userName, alertMessage, recipient, type, location, severity } = req.body;
    if (!alertMessage) {
      return res.status(400).json({ error: 'Alert message is required.' });
    }

    const alert = db.saveAlert({
      predictionId,
      userId,
      userName,
      alertMessage,
      recipient,
      type: type || 'whatsapp',
      status: 'Sent',
      severity: severity || 'High',
      location: location || { city: 'Detected Location', latitude: 0, longitude: 0 }
    });

    return res.json({ success: true, alert });
  });

  app.get('/api/alerts', (req, res) => {
    const userId = req.query.userId as string;
    if (userId) {
      return res.json(db.getUserAlerts(userId));
    }
    return res.json(db.getAlerts());
  });

  // Hotspots Endpoints
  app.get('/api/hotspots', (req, res) => {
    return res.json(db.getHotspots());
  });

  app.post('/api/hotspots', (req, res) => {
    const hotspotData = req.body;
    if (!hotspotData.name || !hotspotData.latitude || !hotspotData.longitude) {
      return res.status(400).json({ error: 'Name, latitude, and longitude are required.' });
    }
    const newHs = db.addHotspot(hotspotData);
    return res.json(newHs);
  });

  app.post('/api/hotspots/import', (req, res) => {
    const { csvText } = req.body;
    if (!csvText) {
      return res.status(400).json({ error: 'CSV content is required.' });
    }
    const result = db.importHotspotsFromCsv(csvText);
    return res.json(result);
  });

  // Admin User Management
  app.get('/api/admin/users', (req, res) => {
    return res.json(db.getUsers());
  });

  app.patch('/api/admin/users/:id/status', (req, res) => {
    const { status } = req.body;
    const user = db.updateUserStatus(req.params.id, status);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json(user);
  });

  app.delete('/api/admin/users/:id', (req, res) => {
    const success = db.deleteUser(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ success: true, message: 'User deleted successfully.' });
  });

  // Analytics Endpoint
  app.get('/api/analytics', (req, res) => {
    return res.json(db.getAnalytics());
  });

  // Vite Development / Production Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, 'localhost', () => {
    console.log(`[SafeRoad] Engine running on http://localhost:${PORT}`);
  });
}

startServer();
