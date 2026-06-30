import network
import time
import ujson
import machine
import urandom
from umqtt.simple import MQTTClient

# Wi-Fi Credentials
ssid = "YOUR_WIFI_SSID"
password = "YOUR_WIFI_PASSWORD"

# HiveMQ Credentials
mqtt_server = "4b1e9aa82ec64e07974584ab727b7b5c.s1.eu.hivemq.cloud"
mqtt_port = 8883
mqtt_user = "esp32_busia"
mqtt_pass = "Hive1234"

# Generate a random Client ID
client_id = "ESP32Client-" + str(urandom.getrandbits(16))
publish_topic = b"smart-shamba/sensors"

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print("Connecting to ", ssid)
        wlan.connect(ssid, password)
        while not wlan.isconnected():
            time.sleep(0.5)
            print(".", end="")
    print("\nWiFi connected")
    print("Network config:", wlan.ifconfig())

def connect_mqtt():
    # HiveMQ Cloud requires SSL/TLS. 
    # ssl_params={'server_hostname': mqtt_server} is crucial for SNI routing on HiveMQ.
    client = MQTTClient(
        client_id=client_id,
        server=mqtt_server,
        port=mqtt_port,
        user=mqtt_user,
        password=mqtt_pass,
        keepalive=60,
        ssl=True,
        ssl_params={'server_hostname': mqtt_server}
    )
    
    print("Attempting MQTT connection...")
    client.connect()
    print("Connected to HiveMQ")
    return client

# --- Main Execution ---
connect_wifi()
client = None

while True:
    try:
        # Reconnect if client is uninitialized or disconnected
        if client is None:
            client = connect_mqtt()
            
        # --- REPLACE THESE WITH REAL SENSOR READINGS LATER ---
        temp = 25.5 
        hum = 60.0
        soil = 45
        
        # Create dictionary matching your dataService.js contract
        payload_dict = {
            "deviceId": "esp32-01",
            "temperature": temp,
            "humidity": hum,
            "soilMoisture": soil
        }
        
        # Convert dictionary to JSON string
        json_payload = ujson.dumps(payload_dict)
        
        print("Publishing message:", json_payload)
        client.publish(publish_topic, json_payload.encode())
        
        time.sleep(60) # Publish every 60 seconds
        
    except OSError as e:
        print("Connection error:", e)
        print("Retrying in 5 seconds...")
        client = None # Reset client to force reconnection
        time.sleep(5)