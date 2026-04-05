from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import google_login, user_details, recomendation, schemes, comments
from app.core.database import init_models




app = FastAPI(
    title="AI-Powered Education & Health Assistant",
    description="AI-powered assistant for education and health",
    version="1.0.0",
)

@app.on_event("startup")
async def startup_event():
    await init_models()

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Powered Education & Health Assistant API"}

@app.get("/health")
def health_check():
    return {"status": "ok"} 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(google_login.router)
app.include_router(user_details.router)
app.include_router(recomendation.router)
app.include_router(schemes.router)
app.include_router(comments.router)
