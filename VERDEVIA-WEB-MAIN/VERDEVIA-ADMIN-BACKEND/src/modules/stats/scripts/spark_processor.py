import os
import time
import json
import psycopg2
from pyspark.sql import SparkSession
from pyspark.ml.clustering import KMeans
from pyspark.ml.feature import VectorAssembler

# PostgreSQL Config
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5435")
DB_NAME = os.environ.get("DB_NAME", "VERDEVIA_db")
DB_USER = os.environ.get("DB_USERNAME", "VERDEVIA_user")
DB_PASS = os.environ.get("DB_PASSWORD", "VERDEVIA_password")

def init_db():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS spark_predictions (
            id SERIAL PRIMARY KEY,
            latitude DOUBLE PRECISION,
            longitude DOUBLE PRECISION,
            cluster_id INTEGER,
            prediction_label VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cursor.close()
    conn.close()

def run_spark_analysis():
    print("Initializing Spark Session...")
    spark = SparkSession.builder \
        .appName("VERDEVIASparkTelemetryProcessor") \
        .master("local[*]") \
        .getOrCreate()
        
    spark.sparkContext.setLogLevel("WARN")

    try:
        # Connect to DB to load complaints
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cursor = conn.cursor()
        cursor.execute("SELECT latitude, longitude FROM complaints WHERE latitude IS NOT NULL AND longitude IS NOT NULL;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        if len(rows) < 3:
            print("Insufficient data for KMeans clustering. Seeding default cluster centers.")
            # Seed mock hotspots in Brazil regions if database has no records
            predictions = [
                (-22.9068, -43.1729, 0, "Rio de Janeiro Hotspot"),
                (-23.5505, -46.6333, 1, "São Paulo Hotspot"),
                (-12.9714, -38.5014, 2, "Salvador Hotspot"),
            ]
        else:
            # Load into Spark DataFrame
            df = spark.createDataFrame(rows, ["latitude", "longitude"])
            
            # Prepare vectors
            assembler = VectorAssembler(inputCols=["latitude", "longitude"], outputCol="features")
            dataset = assembler.transform(df)
            
            # KMeans Model
            kmeans = KMeans().setK(3).setSeed(42)
            model = kmeans.fit(dataset)
            
            # Predictions
            transformed = model.transform(dataset)
            predictions_data = transformed.select("latitude", "longitude", "prediction").collect()
            
            predictions = []
            for row in predictions_data:
                label = f"Região Cluster {row['prediction']}"
                predictions.append((row['latitude'], row['longitude'], row['prediction'], label))
                
        # Save predictions to PostgreSQL
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cursor = conn.cursor()
        cursor.execute("TRUNCATE TABLE spark_predictions;")
        for lat, lng, cluster, label in predictions:
            cursor.execute(
                "INSERT INTO spark_predictions (latitude, longitude, cluster_id, prediction_label) VALUES (%s, %s, %s, %s);",
                (lat, lng, cluster, label)
            )
        conn.commit()
        cursor.close()
        conn.close()
        print(f"Successfully processed and stored {len(predictions)} Spark spatial hotspots.")
    except Exception as e:
        print(f"Error processing Spark data: {e}")
    finally:
        spark.stop()

if __name__ == "__main__":
    print("Spark Telemetry Processor Started")
    # Wait for PostgreSQL to be healthy
    time.sleep(5)
    init_db()
    
    # Run once at startup
    run_spark_analysis()
    
    # Run periodically as a background cron job simulation
    while True:
        time.sleep(60)
        run_spark_analysis()
