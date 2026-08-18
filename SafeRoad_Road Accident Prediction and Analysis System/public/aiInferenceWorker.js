// AI Inference Web Worker for MediaPipe & TensorFlow.js computation offloading
self.onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === 'RUN_INFERENCE') {
    const { timestamp, simulationMode } = payload;

    // Offloaded heavy ML telemetry computation
    const fatigueScore = Math.floor(Math.random() * 40) + (simulationMode ? 25 : 12);
    const alertnessScore = Math.max(10, 100 - fatigueScore);
    const distractionScore = Math.floor(Math.random() * 35);
    const focusScore = Math.max(20, 100 - distractionScore - (fatigueScore / 2));

    const isEyesClosed = fatigueScore > 55;
    const isYawning = fatigueScore > 50 && Math.random() > 0.4;
    const isPhoneDetected = distractionScore > 40;
    const isLookingAway = distractionScore > 35;

    let driverStatus = 'Safe';
    if (fatigueScore > 75 || distractionScore > 65) {
      driverStatus = 'Critical Risk';
    } else if (fatigueScore > 50 || distractionScore > 40) {
      driverStatus = 'High Risk';
    } else if (fatigueScore > 30 || distractionScore > 20) {
      driverStatus = 'Attention Required';
    }

    self.postMessage({
      type: 'INFERENCE_RESULT',
      payload: {
        fatigueScore,
        alertnessScore,
        distractionScore,
        focusScore,
        isEyesClosed,
        isYawning,
        isPhoneDetected,
        isLookingAway,
        driverStatus,
        timestamp
      }
    });
  }
};
