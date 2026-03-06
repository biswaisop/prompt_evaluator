from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI


def groq_response(self,api_key:str, temperature: float, max_tokens: int, query:str) -> dict:
        llm = ChatGroq(
            api_key=api_key,
            model_name="llama-3.3-70b-versatile",
            temperature=temperature,
            max_tokens=max_tokens
        )
        return llm.invoke(query)



def gemini_response(self, api_key:str, temperature: float, max_tokens: int,query: str) -> dict:
        llm = ChatGoogleGenerativeAI(
            api_key = api_key,
            model = "gemini-3.0-flash",
            temperature = temperature,
            max_tokens = max_tokens
        )
        return llm.invoke(query)
    

def openai_response(self, api_key:str, temperature: float, max_tokens: int,query: str) -> dict:
        llm = ChatOpenAI(
            api_key = api_key,
            model = "gemini-3.0-flash",
            temperature = temperature,
            max_tokens = max_tokens
        )
        return llm.invoke(query)

