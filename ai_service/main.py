import os
import time
import json
import re
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate

load_dotenv()

app = FastAPI(
    title="MERN AI Interviewer Python Service",
    description="FastAPI service running LangChain & Hugging Face pipeline for resume analysis and career chat.",
    version="1.0.0"
)

# Enable CORS for frontend and backend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
HF_MODEL = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.2")

# Request Models
class AnalyzeRequest(BaseModel):
    resume_text: str
    job_title: str
    job_description: str
    required_skills: List[str]

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    new_message: str

def query_huggingface(prompt: str, retries: int = 5) -> str:
    if not HF_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="HUGGINGFACE_API_TOKEN is missing from the environment configuration."
        )

    url = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 2000,
            "temperature": 0.2,
            "return_full_text": False
        }
    }
    
    for i in range(retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            
            # Check for API errors or loading states
            if response.status_code == 503:
                data = response.json()
                wait_time = int(data.get("estimated_time", 15))
                print(f"HF model is currently loading. Retrying in {wait_time}s... (Attempt {i+1}/{retries})")
                time.sleep(wait_time)
                continue
                
            data = response.json()
            if isinstance(data, dict) and "error" in data:
                error_msg = data["error"]
                if "loading" in error_msg.lower():
                    wait_time = int(data.get("estimated_time", 15))
                    print(f"HF model is currently loading. Retrying in {wait_time}s... (Attempt {i+1}/{retries})")
                    time.sleep(wait_time)
                    continue
                raise Exception(error_msg)

            if response.status_code != 200:
                raise Exception(f"HF API returned error code {response.status_code}: {response.text}")
                
            if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
                return data[0]["generated_text"]
            if isinstance(data, dict) and "generated_text" in data:
                return data["generated_text"]
            if isinstance(data, str):
                return data
                
            raise Exception("Invalid response format received from Hugging Face.")
            
        except Exception as e:
            if i == retries - 1:
                raise HTTPException(
                    status_code=500,
                    detail=f"Hugging Face query failed after all attempts: {str(e)}"
                )
            print(f"Hugging Face request failed: {str(e)}. Re-attempting in 3 seconds...")
            time.sleep(3)

def extract_json(text: str) -> dict:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Search for raw json structure within text
        match = re.search(r"(\{.*})", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError as err:
                print(f"Regex matched json block parsing error: {err}")
                
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract structured JSON from AI output. Raw text: {text}"
        )

# LangChain Prompt Templates
analysis_prompt_template = PromptTemplate.from_template(
    """[INST] You are an elite corporate recruiter, technical advisor, and career consultant. Compare the candidate's resume with the job requirements and generate a detailed report.
You must return ONLY a raw JSON object matching the JSON schema below. Do not include any formatting, text, notes, or markdown ticks (like ```json) outside the JSON output.

JSON Schema:
{{
  "compatibilityScore": 85,
  "gapAnalysis": {{
    "missingSkills": ["List", "of", "missing", "technical", "skills"],
    "weakAreas": "Detailed description of weak skills or qualifications",
    "experienceGaps": "Details of gaps in professional timeline or project depth",
    "missingKeywords": ["Keywords", "absent", "from", "the", "resume"],
    "missingTechnologies": ["Missing", "software", "frameworks", "or", "tools"]
  }},
  "atsOptimization": {{
    "formattingIssues": "Specific formatting, readability, or parser issues detected",
    "weakSummaries": "Critique and recommendations for summary / objective statement",
    "measurableAchievements": ["Upgraded experience statements showing metrics/results"],
    "bulletRecommendations": ["Suggested action-verb bullet points to replace vague sentences"]
  }},
  "interviewQuestions": [
    {{
      "question": "Interview question related to gaps or requirements based on this resume",
      "suggestedAnswer": "A guide on what to highlight in response"
    }}
  ],
  "improvementSuggestions": ["List of actionable steps to improve the resume or candidate skills"]
}}

Job Title: {job_title}
Job Description: {job_description}
Required Skills: {required_skills}

Candidate Resume:
{resume_text} [/INST]"""
)

chat_prompt_template = PromptTemplate.from_template(
    """[INST] You are an advanced AI career assistant, learning strategist, and interview coach specializing in modern technical stacks (MERN, Python, AI, DevOps, cloud).
Answer the user's queries concisely, providing structured steps, roadmap plans, resume feedback, or interview support.
Always return markdown formatted responses. Keep replies professional, short, and highly structured.

Conversation History:
{history}

User: {new_message} [/INST]"""
)

@app.get("/")
def read_root():
    return {"status": "online", "model": HF_MODEL}

@app.post("/analyze")
def analyze_resume(req: AnalyzeRequest):
    skills_str = ", ".join(req.required_skills) if req.required_skills else "None specified"
    
    # Format LangChain prompt template
    prompt = analysis_prompt_template.format(
        job_title=req.job_title,
        job_description=req.job_description,
        required_skills=skills_str,
        resume_text=req.resume_text
    )
    
    response_text = query_huggingface(prompt)
    report = extract_json(response_text)
    return report

@app.post("/chat")
def chat(req: ChatRequest):
    # Compile history string from history array
    history_str = ""
    for msg in req.messages[-10:]:
        role = "User" if msg.role == "user" else "Assistant"
        history_str += f"{role}: {msg.content}\n"
        
    prompt = chat_prompt_template.format(
        history=history_str,
        new_message=req.new_message
    )
    
    ai_reply = query_huggingface(prompt)
    return {"reply": ai_reply.strip()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
