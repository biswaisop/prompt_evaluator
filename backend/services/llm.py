import os
from dotenv import load_dotenv
load_dotenv()
from langchain_groq import ChatGroq

client = ChatGroq(
    api_key=os.getenv("GROQ"),
    model_name="llama-3.3-70b-versatile",
    temperature=0.0,
    max_tokens=512
)
