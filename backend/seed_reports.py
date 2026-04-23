from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import random

def seed_reports():
    db = SessionLocal()
    
    # Get all assets
    assets = db.query(models.Asset).all()
    if not assets:
        print("No assets found. Seed assets first.")
        return

    issues = [
        "Screen flicker on high brightness",
        "Battery drain issue after latest update",
        "Keyboard key 'E' is sticky",
        "Trackpad not responding occasionally",
        "Overheating during video calls",
        "OS crash on startup",
        "WIFI connectivity dropping",
        "Blue screen of death",
        "Physical damage on the chassis",
        "Missing cable/charger"
    ]

    print("Generating maintenance reports...")
    
    # Create 10 reports
    for _ in range(10):
        asset = random.choice(assets)
        issue = random.choice(issues)
        
        # Randomly set some as 'Closed' and others 'Open'
        status = random.choice(["Open", "Open", "Closed"])
        
        report = models.Maintenance(
            asset_id=asset.id,
            issue_description=issue,
            status=status
        )
        db.add(report)
        
        # If it's a critical report, update asset status to Broken or Under Maintenance
        if status == "Open":
            asset.status = random.choice(["Broken", "Under Maintenance"])
    
    try:
        db.commit()
        print("Successfully seeded maintenance reports!")
    except Exception as e:
        print(f"Error seeding reports: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_reports()
