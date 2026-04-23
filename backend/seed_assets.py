from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from datetime import datetime, timedelta
import random

def seed_assets():
    db = SessionLocal()
    
    asset_types = ["Laptop", "Monitor", "Peripherals", "Mobile", "Furniture", "Desktop"]
    brands = {
        "Laptop": ["MacBook Pro", "Dell XPS", "Lenovo ThinkPad", "HP Spectre", "ASUS ZenBook"],
        "Monitor": ["Dell UltraSharp", "LG UltraFine", "Samsung Odyssey", "ASUS ProArt", "BenQ"],
        "Peripherals": ["Logitech MX Master", "Keychron K2", "Razer DeathAdder", "Apple Magic Trackpad"],
        "Mobile": ["iPhone 15", "Samsung S24", "Google Pixel 8", "OnePlus 12"],
        "Furniture": ["Herman Miller Aeron", "Steelcase Gesture", "Secretlab Titan", "IKEA Markus"],
        "Desktop": ["iMac", "Mac Studio", "Dell OptiPlex", "HP Z2 Mini"]
    }

    print("Generating 30 unique assets...")
    
    for i in range(1, 31):
        atype = random.choice(asset_types)
        brand = random.choice(brands[atype])
        name = f"{brand} - Unit {random.randint(100, 999)}"
        serial = f"SN-{random.randint(10000000, 99999999)}"
        
        # Check if serial exists
        existing = db.query(models.Asset).filter(models.Asset.serial_number == serial).first()
        if existing:
            continue

        asset = models.Asset(
            name=name,
            type=atype,
            serial_number=serial,
            status="Available",
            purchase_date=datetime.now() - timedelta(days=random.randint(10, 500))
        )
        db.add(asset)
    
    try:
        db.commit()
        print("Successfully seeded 30 assets!")
    except Exception as e:
        print(f"Error seeding assets: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_assets()
