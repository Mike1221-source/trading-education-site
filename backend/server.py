from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer(auto_error=False)

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_premium: bool = False
    created_at: datetime

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SessionData(BaseModel):
    session_id: str

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    post_id: str
    title: str
    slug: str
    excerpt: str
    content: str
    author: str
    image_url: str
    published_at: datetime
    tags: List[str]

class EmailLead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    lead_id: str
    email: str
    name: Optional[str] = None
    created_at: datetime

class EmailLeadCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    session_token = request.cookies.get("session_token")
    
    if not session_token and credentials:
        session_token = credentials.credentials
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

@api_router.post("/auth/signup")
async def signup(user_data: UserSignup, response: Response):
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hashed_pw,
        "picture": None,
        "is_premium": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    user_doc.pop('password_hash', None)
    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    return {"user": User(**user_doc), "session_token": session_token}

@api_router.post("/auth/login")
async def login(user_data: UserLogin, response: Response):
    user_doc = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    
    if not user_doc or not verify_password(user_data.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    user_doc.pop('password_hash', None)
    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at']) if isinstance(user_doc.get('created_at'), str) else user_doc['created_at']
    return {"user": User(**user_doc), "session_token": session_token}

@api_router.post("/auth/google/session")
async def google_auth_session(session_data: SessionData, response: Response):
    async with httpx.AsyncClient() as client:
        auth_response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_data.session_id}
        )
    
    if auth_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    user_data = auth_response.json()
    
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": user_data["name"],
                "picture": user_data["picture"]
            }}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data["picture"],
            "is_premium": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    session_token = user_data["session_token"]
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at']) if isinstance(user_doc.get('created_at'), str) else user_doc['created_at']
    return {"user": User(**user_doc), "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user)):
    await db.user_sessions.delete_many({"user_id": current_user.user_id})
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/blog/posts", response_model=List[BlogPost])
async def get_blog_posts():
    posts = await db.blog_posts.find({}, {"_id": 0}).to_list(100)
    for post in posts:
        if isinstance(post.get('published_at'), str):
            post['published_at'] = datetime.fromisoformat(post['published_at'])
    return posts

@api_router.get("/blog/posts/{slug}", response_model=BlogPost)
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if isinstance(post.get('published_at'), str):
        post['published_at'] = datetime.fromisoformat(post['published_at'])
    return BlogPost(**post)

@api_router.post("/leads", response_model=EmailLead)
async def create_lead(lead_data: EmailLeadCreate):
    existing_lead = await db.email_leads.find_one({"email": lead_data.email}, {"_id": 0})
    if existing_lead:
        return EmailLead(**existing_lead)
    
    lead_id = f"lead_{uuid.uuid4().hex[:12]}"
    lead_doc = {
        "lead_id": lead_id,
        "email": lead_data.email,
        "name": lead_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.email_leads.insert_one(lead_doc)
    lead_doc['created_at'] = datetime.fromisoformat(lead_doc['created_at'])
    return EmailLead(**lead_doc)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def startup_db():
    sample_posts = [
        {
            "post_id": "post_001",
            "title": "5 Essential Risk Management Strategies Every Trader Should Know",
            "slug": "risk-management-strategies",
            "excerpt": "Learn how to protect your capital with proven risk management techniques used by professional traders.",
            "content": "Risk management is the cornerstone of successful trading. In this comprehensive guide, we'll explore five essential strategies that every trader should implement...",
            "author": "Trading Academy Team",
            "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "tags": ["Risk Management", "Trading Strategy", "Beginner"]
        },
        {
            "post_id": "post_002",
            "title": "Understanding Market Psychology: The Key to Better Trading Decisions",
            "slug": "market-psychology",
            "excerpt": "Discover how emotions and crowd behavior influence markets and learn to use psychology to your advantage.",
            "content": "Market psychology plays a crucial role in price movements. Understanding the emotional drivers behind market participants can give you a significant edge...",
            "author": "Trading Academy Team",
            "image_url": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "tags": ["Psychology", "Trading Mindset", "Advanced"]
        },
        {
            "post_id": "post_003",
            "title": "Technical Analysis 101: Reading Charts Like a Pro",
            "slug": "technical-analysis-101",
            "excerpt": "Master the fundamentals of technical analysis and start identifying profitable trading opportunities.",
            "content": "Technical analysis is an essential skill for any trader. This beginner-friendly guide will walk you through chart patterns, indicators, and more...",
            "author": "Trading Academy Team",
            "image_url": "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "tags": ["Technical Analysis", "Charts", "Beginner"]
        }
    ]
    
    existing_count = await db.blog_posts.count_documents({})
    if existing_count == 0:
        await db.blog_posts.insert_many(sample_posts)
        logger.info("Sample blog posts created")