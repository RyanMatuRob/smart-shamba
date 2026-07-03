from umqtt.simple import MQTTClient
import network
import dht
import machine
from machine import ADC
import time
import json
import gc

# ============================================================
# USER CONFIGURATION
# ============================================================

SSID = "Martin Router King"
PASSWORD = "alas13513"

BROKER = "broker.hivemq.com"
TOPIC = b"iot/project/sensor"

CLIENT_ID = "TTGO"

# Sensor Pins
DHT_PIN = 23
SOIL_PIN = 15      

# Soil Calibration
DRY_VALUE = 4095
WET_VALUE = 1200

# Sensor Pins
DHT_PIN = 23
SOIL_PIN = 15
PH_PIN = 32

# pH Calibration
PH_SLOPE = -5.70
PH_OFFSET = 21.34

# ============================================================
# STARTUP
# ============================================================

print("=" * 60)
print("TTGO ESP32 IoT Monitoring System")
print("=" * 60)

print("Configuration")
print("--------------------------------")
print("WiFi SSID      :", SSID)
print("MQTT Broker    :", BROKER)
print("MQTT Topic     :", TOPIC.decode())
print("DHT22 GPIO     :", DHT_PIN)
print("Soil ADC GPIO  :", SOIL_PIN)
print("--------------------------------\n")

# ============================================================
# INITIALIZE DHT22
# ============================================================

try:
    print("Initializing DHT22...")
    dht_sensor = dht.DHT22(machine.Pin(DHT_PIN))
    print("DHT22 OK\n")

except Exception as e:
    print("DHT22 Initialization Failed")
    print(e)
    raise SystemExit

# ============================================================
# INITIALIZE SOIL SENSOR
# ============================================================

try:
    print("Initializing Soil Moisture Sensor...")

    soil_sensor = ADC(machine.Pin(SOIL_PIN))
    soil_sensor.atten(ADC.ATTN_11DB)
    soil_sensor.width(ADC.WIDTH_12BIT)

    print("Soil Sensor OK\n")

except Exception as e:
    print("Soil Sensor Initialization Failed")
    print(e)
    raise SystemExit


# ============================================================
# TEST SOIL SENSOR
# ============================================================

print("Testing Soil Sensor")

for i in range(10):

    reading = soil_sensor.read()

    print("Reading {:02d}: {}".format(i + 1, reading))

    time.sleep(0.3)

print()


# ============================================================
# INITIALIZE PH SENSOR
# ============================================================

try:

    print("Initializing pH Sensor...")

    ph_sensor = ADC(machine.Pin(PH_PIN))
    ph_sensor.atten(ADC.ATTN_11DB)
    ph_sensor.width(ADC.WIDTH_12BIT)

    print("pH Sensor OK\n")

except Exception as e:

    print("pH Sensor Initialization Failed")
    print(e)
    raise SystemExit




# ============================================================
# CONNECT WIFI
# ============================================================

print("Starting WiFi...")

wifi = network.WLAN(network.STA_IF)

wifi.active(False)
time.sleep(1)

wifi.active(True)
time.sleep(1)

try:

    wifi.connect(SSID, PASSWORD)

    timeout = 20

    while not wifi.isconnected() and timeout > 0:

        print("Connecting... {} sec remaining".format(timeout))

        timeout -= 1
        time.sleep(1)

    if not wifi.isconnected():

        print("WiFi Connection Failed")
        raise SystemExit

except Exception as e:

    print("WiFi Error")
    print(e)
    raise SystemExit

print("\nWiFi Connected")
print("IP Address:", wifi.ifconfig()[0])
print()

# ============================================================
# MQTT
# ============================================================

print("Connecting to MQTT...")

try:

    client = MQTTClient(CLIENT_ID, BROKER)
    client.connect()

    print("MQTT Connected\n")

except Exception as e:

    print("MQTT Connection Failed")
    print(e)
    raise SystemExit

# ============================================================
# MAIN LOOP
# ============================================================

last_soil = None

while True:

    try:

        print("=" * 60)

        # ----------------------------------------------------
        # DHT22
        # ----------------------------------------------------

        print("Reading DHT22...")

        dht_sensor.measure()

        temperature = dht_sensor.temperature()
        humidity = dht_sensor.humidity()

        print("Temperature :", temperature)
        print("Humidity    :", humidity)

        # ----------------------------------------------------
        # Soil Sensor
        # ----------------------------------------------------

        print("\nReading Soil Sensor...")

        samples = []

        for i in range(5):

            value = soil_sensor.read()

            samples.append(value)

            time.sleep_ms(50)

        soil_raw = sum(samples) // len(samples)

        print("ADC Samples :", samples)
        print("ADC Average :", soil_raw)

        # ----------------------------------------------------
        # Sensor Diagnostics
        # ----------------------------------------------------

        if soil_raw >= 4090:

            print("\nWARNING")
            print("ADC reading is maximum (4095)")
            print("Possible causes:")
            print("- Probe disconnected")
            print("- AO wire disconnected")
            print("- Wrong GPIO")
            print("- Sensor not powered")
            print("- Extremely dry soil")

        elif soil_raw <= 20:

            print("\nWARNING")
            print("ADC reading is minimum (0)")
            print("Possible causes:")
            print("- Short circuit")
            print("- Incorrect wiring")
            print("- Faulty sensor")

        # ----------------------------------------------------
        # Soil Moisture Calculation
        # ----------------------------------------------------

        soil_percent = (
            (DRY_VALUE - soil_raw)
            /
            (DRY_VALUE - WET_VALUE)
        ) * 100

        if soil_percent > 100:
            soil_percent = 100

        if soil_percent < 0:
            soil_percent = 0

        print("\nCalibration")
        print("Dry Value :", DRY_VALUE)
        print("Wet Value :", WET_VALUE)
        print("Moisture  : {:.1f}%".format(soil_percent))

        # ----------------------------------------------------
        # pH Sensor
        # ----------------------------------------------------

        print("\nReading pH Sensor...")

        ph_samples = []

        for i in range(10):
          ph_samples.append(ph_sensor.read())
          time.sleep_ms(20)

        ph_raw = sum(ph_samples) / len(ph_samples)

        print("ADC Samples :", ph_samples)
        print("ADC Average :", ph_raw)

        # Convert ADC to voltage
        voltage = (ph_raw / 4095.0) * 3.3

        # Convert voltage to pH
        ph_value = (PH_SLOPE * voltage) + PH_OFFSET

        # Limit displayed values
        if ph_value < 0:
          ph_value = 0

        if ph_value > 14:
          ph_value = 14

        print("Voltage  : {:.3f} V".format(voltage))
        print("pH Value : {:.2f}".format(ph_value))

        # ----------------------------------------------------
        # Compare Previous Reading
        # ----------------------------------------------------

        if last_soil is not None:

            difference = soil_raw - last_soil

            print("\nPrevious Reading :", last_soil)
            print("Current Reading  :", soil_raw)
            print("Difference       :", difference)

            if abs(difference) < 3:

                print("Sensor reading is stable.")

        last_soil = soil_raw

        # ----------------------------------------------------
        # JSON
        # ----------------------------------------------------

        payload = {

            "temperature": temperature,
            "humidity": humidity,
            "soil_raw": soil_raw,
            "soil_moisture": round(soil_percent, 1)

        }

        message = json.dumps(payload)

        # ----------------------------------------------------
        # MQTT Publish
        # ----------------------------------------------------

        print("\nPublishing MQTT...")

        try:

            client.publish(TOPIC, message)

            print("MQTT Publish Successful")

        except Exception as e:

            print("MQTT Publish Failed")
            print(e)

        # ----------------------------------------------------
        # Final Output
        # ----------------------------------------------------

        print("\nPublished JSON")
        print(message)

        # ----------------------------------------------------
        # Memory
        # ----------------------------------------------------

        gc.collect()

        print("\nMemory")
        print("Free      :", gc.mem_free())
        print("Allocated :", gc.mem_alloc())

        print("=" * 60)

    except OSError as e:

        print("\nDHT22 Read Failed")
        print(e)

        print("\nChecklist")
        print("- Check DHT22 wiring")
        print("- Check GPIO", DHT_PIN)
        print("- Check pull-up resistor")
        print("- Verify 3.3V supply")

    except Exception as e:

        print("\nUnexpected Error")
        print(e)

        try:

            print("Reconnecting MQTT...")

            client.connect()

            print("MQTT Reconnected")

        except Exception as err:

            print("MQTT Reconnect Failed")
            print(err)

    time.sleep(2)