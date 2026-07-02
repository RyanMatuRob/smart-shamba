const mqtt = require('mqtt');

const mqttOptions = {
  host: '4b1e9aa82ec64e07974584ab727b7b5c.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'esp32_busia',
  password: 'Hive1234'
};

const client = mqtt.connect(mqttOptions);

client.on('connect', () => {
  const fakePayload = {
    deviceId: "esp32-01",
    temperature: 24.8,
    humidity: 56,
    soilMoisture: 50,
    soilPH: 6.8
  };

  client.publish('smart-shamba/sensors', JSON.stringify(fakePayload), () => {
    console.log('Sent fake sensor payload to HiveMQ!');
    client.end();
  });
});