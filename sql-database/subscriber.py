import json
import sqlite3
from paho.mqtt import client as mqtt

BROKER = "broker.hivemq.com"
TOPIC = "iot/project/sensor"

# Connect to SQLite
conn = sqlite3.connect("IoT-lab.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS node_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    soil_moisture INTEGER NOT NULL,
    ph REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()


def on_connect(client, userdata, flags, rc, properties=None):
    print("Connected to MQTT")
    client.subscribe(TOPIC)


def on_message(client, userdata, msg):
    payload = json.loads(msg.payload.decode())

    # Print JSON
    print(json.dumps(payload))

    cursor.execute("""
        INSERT INTO node_records
        (temperature, humidity, soil_moisture, ph)
        VALUES (?, ?, ?, ?)
    """, (
        payload["temperature"],
        payload["humidity"],
        payload["soil_moisture"],
        payload["ph"]
    ))

    conn.commit()


client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, 1883)

print("Waiting for sensor data...\n")

client.loop_forever()