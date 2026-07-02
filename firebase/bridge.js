
const mqtt = require('mqtt');
const { initializeApp } = require('firebase-admin/app');
const { cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

// 1. Firebase Admin Configuration
const serviceAccount = require('./firebase-key.json'); 

initializeApp({
  credential: cert(serviceAccount), 
  databaseURL: "https://smart-shamba-a43e5-default-rtdb.europe-west1.firebasedatabase.app" 
});

const db = getDatabase();
const readingsRef = db.ref('live_data');

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
    const sensorData = JSON.parse(message.toString());
    
    const finalPayload = {
      deviceId: sensorData.deviceId || "esp32-01",
      timestamp: new Date().toISOString(), 
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      soilMoisture: sensorData.soilMoisture,
      soilPH: sensorData.soilPH !== undefined ? sensorData.soilPH : null
    };

    readingsRef.push(finalPayload)
      .then(() => {
        console.log('Successfully saved historical entry to Firebase:', finalPayload);
      })
      .catch((error) => {
        console.error('Error saving to Firebase:', error);
      });

  } catch (error) {
    console.error('Failed to parse incoming MQTT message as JSON:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('MQTT Connection Error:', error);
});
