from pymongo import MongoClient, DESCENDING
from pymongo.collection import Collection
from dotenv import load_dotenv
import os 

load_dotenv()

client = MongoClient(
    os.getenv("MONGOURI"),
    maxPoolSize=100,        # max concurrent connections
    minPoolSize=5,          # keep 5 alive even when idle
    serverSelectionTimeoutMS=5000  # fail fast if DB is unreachable
    )
db = client[os.getenv("DBNAME", "Prompt_Playground")]

users_collection: Collection = db["Users"]
history_collection: Collection = db["History"]


def create_indexes():
    users_collection.create_index("email", unique=True)
    history_collection.create_index("user_id")
    history_collection.create_index([("user_id", 1), ("created_at", DESCENDING)])


def getdb():
    return db
