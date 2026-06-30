const mqtt = require('mqtt');
const admin = require('firebase-admin');

// 1. Firebase Admin Configuration
// Ensure your downloaded service account key is in the same directory and named exactly 'firebase-key.json'
const serviceAccount = require('./firebase-key.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Using the specific European database URL you provided
  databaseURL: "https://smart-shamba-a43e5-default-rtdb.europe-west1.firebasedatabase.app" 
});
const db = admin.database();
const readingsRef = db.ref('readings');

// 2. HiveMQ Configuration
const mqttOptions = {
  host: '4b1e9aa82ec64e07974584ab727b7b5c.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'esp32_busia',
  password: 'Hive1234'
};

console.log('Connecting to HiveMQ...');
const mqttClient = mqtt.connect(mqttOptions);

mqttClient.on('connect', () => {
  console.log('Successfully connected to HiveMQ Broker!');
  // Subscribe to the topic where the ESP32 is publishing
  mqttClient.subscribe('smart-shamba/sensors', (err) => {
    if (!err) {
      console.log('Subscribed to smart-shamba/sensors');
    } else {
      console.error('Subscription error:', err);
    }
  });
});

// 3. Listen for Messages and Push to Firebase
mqttClient.on('message', (topic, message) => {
  console.log(`\nIncoming message on topic: ${topic}`);
  
  try {
    // Parse the JSON payload coming from the MicroPython/ESP32 script
    const sensorData = JSON.parse(message.toString());
    
    // Construct the payload to match what dataService.js expects
    const finalPayload = {
      deviceId: sensorData.deviceId || "esp32-01",
      timestamp: new Date().toISOString(), // Node.js generates the accurate ISO timestamp here
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      soilMoisture: sensorData.soilMoisture
    };

    // Push the new reading to the Firebase Realtime Database
    readingsRef.push(finalPayload)
      .then(() => {
        console.log('Successfully saved to Firebase:', finalPayload);
      })
      .catch((error) => {
        console.error('Error saving to Firebase:', error);
      });

  } catch (error) {
    console.error('Failed to parse incoming MQTT message as JSON:', error);
    console.error('Raw message was:', message.toString());
  }
});

// Handle connection errors gracefully
mqttClient.on('error', (error) => {
  console.error('MQTT Connection Error:', error);
});