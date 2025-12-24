import sqlite3
import os

db_path = 'instance/skin_analysis.db'
print(f"Looking for database at: {os.path.abspath(db_path)}")
print(f"Exists: {os.path.exists(db_path)}")

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # List tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"Tables: {tables}")
    
    # Get most recent analyses
    for table_name in tables:
        tn = table_name[0]
        print(f"\n--- Table: {tn} ---")
        cursor.execute(f"PRAGMA table_info({tn})")
        columns = cursor.fetchall()
        print(f"Columns: {[c[1] for c in columns]}")
        
        cursor.execute(f"SELECT * FROM {tn} ORDER BY rowid DESC LIMIT 2")
        rows = cursor.fetchall()
        for row in rows:
            print(f"Row: {row}")
    
    conn.close()
