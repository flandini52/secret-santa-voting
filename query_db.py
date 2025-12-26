import sqlite3

conn = sqlite3.connect("data/votes.db")
cur = conn.cursor()

# Esempio di query
cur.execute("SELECT * FROM votes")
rows = cur.fetchall()
for row in rows:
    print(row)

conn.close()

