from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI


def groq_response(api_key:str, temperature: float, max_tokens: int, query:str, model_name: str = "llama-3.3-70b-versatile") -> dict:
        llm = ChatGroq(
            api_key=api_key,
            model_name=model_name,
            temperature=temperature,
            max_tokens=max_tokens
        )
        return llm.invoke(query)


def groq_stream(api_key: str, temperature: float, max_tokens: int, query: str, model_name: str = "llama-3.3-70b-versatile"):
        llm = ChatGroq(
            api_key=api_key,
            model_name=model_name,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        for chunk in llm.stream(query):
            yield chunk



def gemini_response( api_key:str, temperature: float, max_tokens: int,query: str) -> dict:
        llm = ChatGoogleGenerativeAI(
            api_key = api_key,
            model = "gemini-3.0-flash",
            temperature = temperature,
            max_tokens = max_tokens
        )
        return llm.invoke(query)
    

def openai_response(api_key:str, temperature: float, max_tokens: int,query: str) -> dict:
        llm = ChatOpenAI(
            api_key = api_key,
            model = "gemini-3.0-flash",
            temperature = temperature,
            max_tokens = max_tokens
        )
        return llm.invoke(query)

