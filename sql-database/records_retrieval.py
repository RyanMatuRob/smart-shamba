import sqlite3
import json
import time

print("")
print(f"SQLite Version: {sqlite3.sqlite_version}")
print()

try:
    # Connect to the database
    conn = sqlite3.connect("IoT-lab.db")
    cursor = conn.cursor()


    print("Establishing database connection...")
    time.sleep(1)

    print("Connection established.")
    time.sleep(0.8)

    print("SELECT temperature, humidity, soil_moisture, timestamp, ph")
    print("FROM node_records")
    print("ORDER BY timestamp ASC;")
    print()

    time.sleep(1)

    cursor.execute("""
        SELECT temperature, humidity, soil_moisture, timestamp, ph
        FROM node_records
        ORDER BY timestamp ASC;
    """)

    print("Retrieving records...\n")
    time.sleep(1)

    for row in cursor.fetchall():
        record = {
            "temperature": row[0],
            "humidity": row[1],
            "soil_moisture": row[2],
            "timestamp": row[3],
            "ph": row[4]
        }

        print(json.dumps(record, indent=4))
        print("-" * 55)
        time.sleep(0.7)

    print("\nQuery completed successfully.")
    print("Database connection closed.")

    conn.close()

except sqlite3.Error as e:
    print(f"SQLite Error: {e}")