from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph, END
from langchain.chat_models import ChatOpenAI
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema.runnable import RunnableLambda
import os
from dotenv import load_dotenv
load_dotenv()
from typing import TypedDict, List
from langchain_core.documents import Document
from pathlib import Path

class GraphState(TypedDict):
    input: str
    docs: List[Document]
    output: str



BASE_DIR = Path(__file__).resolve().parent
pdf_path = BASE_DIR / "resume" / "dhvani_resume.pdf"

loader = PyPDFLoader(str(pdf_path))

documents = loader.load()

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
split_docs = splitter.split_documents(documents)

vectorstore = Chroma.from_documents(split_docs, OpenAIEmbeddings(), persist_directory="vector_store")
retriever = vectorstore.as_retriever()

llm = ChatOpenAI(model="gpt-4-turbo")

def retrieve_node(state):
    query = state["input"]
    docs = retriever.get_relevant_documents(query)
    return {"input": query, "docs": docs}

def generate_node(state: GraphState) -> GraphState:
    docs = state["docs"]
    query = state["input"]
    context = "\n\n".join([doc.page_content for doc in docs])
    
    prompt = f"""
You are a professional assistant trained to answer questions about Dhvani Patel's resume, work experience, and certifications.

Dhvani is a **female** professional. Always refer to her using **she/her** pronouns.
Only use the information provided in the context. Do NOT make up information.  

📞 If the answer is not available, respond with:  
"I don't have a proper answer for that. Would you like to speak with Dhvani directly? You can contact him at +1 (470) 789-2960."

📌 Formatting Instructions:
- If listing multiple items (jobs, companies, skills), always use bullet points.
- Use **bold** formatting for job titles and company names.
- Use short, clean sentences.
- Break content into logical sections with line breaks between them.
- Avoid long paragraphs.

---

📄 Context:
{context}

---

❓ Question: {query}

---

💬 Answer:"""

    response = llm.invoke(prompt)
    return {"output": response.content}
graph = StateGraph(GraphState)
graph.add_node("retrieve", RunnableLambda(retrieve_node))
graph.add_node("generate", RunnableLambda(generate_node))
graph.set_entry_point("retrieve")
graph.add_edge("retrieve", "generate")
graph.add_edge("generate", END)

chatbot = graph.compile()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_input = data["message"]
    result = chatbot.invoke({"input": user_input})
    return {"reply": result["output"]}
