import geopandas as gpd
import pandas as pd
import rasterio
from rasterio.sample import sample_gen
from shapely.geometry import Point
import json
import os

def calculate_thermal_strain():
    print("🚀 Initializing Canopy AI x ThermoNet 5G Pipeline...")

    # File paths (You will drop your downloaded files here later)
    thermal_raster_path = "data/landsat_lst_kl.tif"
    osm_buildings_path = "data/kl_building_heights.geojson"
    ookla_mobile_path = "data/ookla_performance_mobile_tiles.parquet"
    
    # Target output directly to the Spring Boot backend
    output_api_path = "../2-api-backend/src/main/resources/processed_nodes.json"

    try:
        # 1. Load Datasets
        print("Loading OSM Building Footprints...")
        buildings_gdf = gpd.read_file(osm_buildings_path)

        print("Loading Ookla 5G Mobile Performance Data...")
        # Ookla data contains fields like avg_d_kbps (download speed) and avg_lat_ms (latency)
        ookla_gdf = gpd.read_parquet(ookla_mobile_path)

        # 2. Spatial Join: Find telecom nodes situated inside or very close to buildings
        print("Intersecting Telecom Nodes with Urban Geometry...")
        # For hackathon purposes, we assume Ookla tiles represent micro-cell clusters
        nodes_with_buildings = gpd.sjoin(ookla_gdf, buildings_gdf, how="inner", predicate="intersects")

        # 3. Extract Thermal Data (Simulated for this script structure)
        print("Extracting Surface Temperatures from Landsat Raster...")
        processed_nodes = []
        
        # Open the raster to sample temperatures at each node's coordinate
        with rasterio.open(thermal_raster_path) as src:
            for idx, row in nodes_with_buildings.head(50).iterrows(): # Limit to top 50 for the prototype
                # Extract coordinate
                lon, lat = row.geometry.centroid.x, row.geometry.centroid.y
                
                # Sample the thermal band at this specific coordinate (Simulated logic)
                # lst_value = list(sample_gen(src, [(lon, lat)]))[0][0] 
                
                # --- HACKATHON MOCK SCORING CALCULATION ---
                # Since we don't have the files yet, we generate the mathematical model
                base_temp = 32.0 # degrees celsius
                building_density_penalty = 1.5
                
                # Thermal Strain Score Algorithm (0-100)
                # Higher latency + lower download speeds + urban density = Higher Strain
                speed_penalty = (100000 / max(row.get('avg_d_kbps', 1000), 1)) #
                strain_score = min(100, (base_temp * building_density_penalty) + speed_penalty)

                # Determine Status Category
                status = "OPTIMAL"
                if strain_score > 85:
                    status = "CRITICAL_THROTTLING"
                elif strain_score > 70:
                    status = "ELEVATED_RISK"

                processed_nodes.append({
                    "id": f"5G-NODE-{idx}",
                    "location": "KL Urban Corridor",
                    "lat": lat,
                    "lng": lon,
                    "download_speed_kbps": int(row.get('avg_d_kbps', 0)), #
                    "latency_ms": int(row.get('avg_lat_ms', 0)), #
                    "thermalStrainScore": round(strain_score, 1),
                    "status": status
                })

        # 4. Export to the Java Spring Boot API directory
        print(f"Exporting {len(processed_nodes)} processed nodes to Backend...")
        os.makedirs(os.path.dirname(output_api_path), exist_ok=True)
        with open(output_api_path, 'w') as f:
            json.dump(processed_nodes, f, indent=4)
            
        print("✅ Pipeline Complete! Data is ready for the Java API.")

    except Exception as e:
        print(f"Pipeline Paused: {e}")
        print("Waiting for dataset files to be placed in the 'data/' folder...")

if __name__ == "__main__":
    calculate_thermal_strain()