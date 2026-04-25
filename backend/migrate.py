from sqlalchemy import text
from database import engine

def migrate():
    print("Running migrations...")
    with engine.connect() as connection:
        # Check if user_id column exists in maintenance table
        check_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name='maintenance' AND column_name='user_id';")
        result = connection.execute(check_sql).fetchone()
        
        if not result:
            print("Adding user_id column to maintenance table...")
            add_sql = text("ALTER TABLE maintenance ADD COLUMN user_id INTEGER;")
            connection.execute(add_sql)
            connection.commit()
            print("Successfully added user_id column.")

        # Check if rejection_reason exists in asset_requests table
        check_req_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name='asset_requests' AND column_name='rejection_reason';")
        result_req = connection.execute(check_req_sql).fetchone()

        if not result_req:
            print("Adding rejection_reason column to asset_requests table...")
            add_req_sql = text("ALTER TABLE asset_requests ADD COLUMN rejection_reason TEXT;")
            connection.execute(add_req_sql)
            connection.commit()
            print("Successfully added rejection_reason column.")
        else:
            print("rejection_reason column already exists in asset_requests table.")

if __name__ == "__main__":
    migrate()
