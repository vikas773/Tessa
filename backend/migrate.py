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
        else:
            print("user_id column already exists in maintenance table.")

if __name__ == "__main__":
    migrate()
