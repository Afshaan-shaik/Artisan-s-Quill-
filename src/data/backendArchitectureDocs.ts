export interface BackendFile {
  filename: string;
  language: string;
  category: 'models' | 'api' | 'storage' | 'database' | 'config';
  description: string;
  content: string;
}

export const PYTHON_BACKEND_FILES: BackendFile[] = [
  {
    filename: 'models.py',
    language: 'python',
    category: 'models',
    description: 'SQLAlchemy ORM Data Models with Cascades, Foreign Keys & Relationships',
    content: `"""
The Artisan's Quill Backend — SQLAlchemy 2.0 ORM Models
Defines relational schemas for Artists, Artworks, Poetry Cards, and Social Graph.
"""

from datetime import datetime
import enum
from typing import List, Optional
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, ForeignKey,
    DateTime, Enum, JSON, Table, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship
import uuid

Base = declarative_base()

class ArtCategoryEnum(str, enum.Enum):
    PAINTING = "painting"
    DRAWING = "drawing"
    DIGITAL = "digital"
    VIDEO = "video"
    POETRY = "poetry"

class PoetryThemeEnum(str, enum.Enum):
    OBSIDIAN = "obsidian"
    VELLUM = "vellum"
    MIDNIGHT = "midnight"
    EMERALD = "emerald"
    CRIMSON = "crimson"

class InteractionTypeEnum(str, enum.Enum):
    LIKE = "like"
    BOOKMARK = "bookmark"
    CURATOR_PICK = "curator_pick"

# User follows association table
user_follows = Table(
    "user_follows",
    Base.metadata,
    Column("follower_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("following_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime(timezone=True), default=datetime.utcnow)
)

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(128), nullable=False)
    avatar_url = Column(Text, nullable=True)
    cover_image_url = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    discipline = Column(String(64), nullable=False, default="Visual Artist")
    location = Column(String(128), nullable=True)
    website = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    artworks = relationship("Artwork", back_populates="artist", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    interactions = relationship("SocialInteraction", back_populates="user", cascade="all, delete-orphan")
    
    following = relationship(
        "User",
        secondary=user_follows,
        primaryjoin=id == user_follows.c.follower_id,
        secondaryjoin=id == user_follows.c.following_id,
        backref="followers"
    )

class Artwork(Base):
    __tablename__ = "artworks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artist_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(Enum(ArtCategoryEnum), nullable=False, index=True)
    
    # Media and Physical Specs
    media_url = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    dimensions = Column(String(64), nullable=True)
    medium = Column(String(128), nullable=True)
    year = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    curator_note = Column(Text, nullable=True)
    aspect_ratio = Column(String(32), default="tall")
    
    # Metadata & Curation
    color_palette = Column(JSONB, nullable=True)  # List of HEX color codes
    tags = Column(JSONB, default=list)            # List of string tags
    is_featured = Column(Boolean, default=False, index=True)
    
    # Denormalized counters for lightning-fast queries
    likes_count = Column(Integer, default=0, nullable=False)
    views_count = Column(Integer, default=0, nullable=False)
    saves_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    artist = relationship("User", back_populates="artworks")
    poetry_detail = relationship("PoetryCard", back_populates="artwork", uselist=False, cascade="all, delete-orphan")
    video_detail = relationship("VideoMedia", back_populates="artwork", uselist=False, cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="artwork", cascade="all, delete-orphan")
    interactions = relationship("SocialInteraction", back_populates="artwork", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_artworks_category_created", "category", "created_at"),
    )

class PoetryCard(Base):
    __tablename__ = "poetry_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artwork_id = Column(UUID(as_uuid=True), ForeignKey("artworks.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    stanzas = Column(JSONB, nullable=False)  # Array of stanza strings
    theme = Column(Enum(PoetryThemeEnum), default=PoetryThemeEnum.OBSIDIAN, nullable=False)
    font_style = Column(String(32), default="cormorant", nullable=False)
    alignment = Column(String(16), default="center", nullable=False)
    
    audio_recitation_url = Column(Text, nullable=True)
    audio_duration_seconds = Column(Integer, nullable=True)
    reading_time_minutes = Column(Integer, default=1, nullable=False)
    author_signature = Column(String(128), nullable=True)
    subtitle = Column(String(255), nullable=True)

    artwork = relationship("Artwork", back_populates="poetry_detail")

class VideoMedia(Base):
    __tablename__ = "video_media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artwork_id = Column(UUID(as_uuid=True), ForeignKey("artworks.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    duration = Column(String(32), nullable=False)
    resolution = Column(String(32), default="4K Ultra HD")
    is_loop = Column(Boolean, default=True)
    has_audio = Column(Boolean, default=False)
    codec = Column(String(32), default="H.264 / ProRes")

    artwork = relationship("Artwork", back_populates="video_detail")

class SocialInteraction(Base):
    __tablename__ = "social_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    artwork_id = Column(UUID(as_uuid=True), ForeignKey("artworks.id", ondelete="CASCADE"), nullable=False, index=True)
    interaction_type = Column(Enum(InteractionTypeEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "artwork_id", "interaction_type", name="uq_user_artwork_interaction"),
    )

    user = relationship("User", back_populates="interactions")
    artwork = relationship("Artwork", back_populates="interactions")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artwork_id = Column(UUID(as_uuid=True), ForeignKey("artworks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="comments")
    artwork = relationship("Artwork", back_populates="comments")
`
  },
  {
    filename: 'storage_engine.py',
    language: 'python',
    category: 'storage',
    description: 'S3 / Cloud Storage Engine for High-Res Artworks, Video Transcoding & Color Extraction',
    content: `"""
The Artisan's Quill — High Resolution Media & Audio Storage Service
Handles secure presigned upload URLs, automatic PIL color palette extraction, and video metadata.
"""

import io
import os
import uuid
from typing import List, Tuple, Dict, Any
from PIL import Image
from colorthief import ColorThief
import boto3
from botocore.exceptions import ClientError

S3_BUCKET = os.getenv("AWS_S3_BUCKET_NAME", "atelier-noir-vault")
CLOUDFRONT_DOMAIN = os.getenv("CLOUDFRONT_DOMAIN", "https://cdn.ateliernoir.art")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
    region_name=os.getenv("AWS_REGION", "eu-central-1")
)

class MediaStorageEngine:
    @staticmethod
    def generate_presigned_upload_url(
        file_extension: str, 
        content_type: str, 
        folder: str = "artworks"
    ) -> Dict[str, str]:
        """Generates an authenticated direct-to-S3 upload URL with 15-minute expiration."""
        file_id = f"{uuid.uuid4()}.{file_extension.lstrip('.')}"
        object_key = f"{folder}/{file_id}"
        
        try:
            presigned_url = s3_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": S3_BUCKET,
                    "Key": object_key,
                    "ContentType": content_type,
                    "ACL": "public-read"
                },
                ExpiresIn=900
            )
            return {
                "upload_url": presigned_url,
                "file_key": object_key,
                "cdn_url": f"{CLOUDFRONT_DOMAIN}/{object_key}"
            }
        except ClientError as e:
            raise RuntimeError(f"Failed to generate presigned upload URL: {e}")

    @staticmethod
    def extract_color_palette(image_bytes: bytes, count: int = 5) -> List[str]:
        """Extracts dominant harmonized HEX color palette from high-res artwork bytes."""
        image_stream = io.BytesIO(image_bytes)
        color_thief = ColorThief(image_stream)
        palette_rgb = color_thief.get_palette(color_count=count, quality=1)
        
        hex_palette = [f"#{r:02x}{g:02x}{b:02x}" for (r, g, b) in palette_rgb]
        return hex_palette
`
  },
  {
    filename: 'main_api.py',
    language: 'python',
    category: 'api',
    description: 'FastAPI High-Performance REST Endpoints for Artworks, Poetry & User Profiles',
    content: `"""
The Artisan's Quill — FastAPI Application Entry Point
Production-ready REST routes with Async SQLAlchemy, JWT Auth, and Rate Limiting.
"""

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from .database import get_db
from .models import Artwork, User, PoetryCard, SocialInteraction, Comment, ArtCategoryEnum
from .schemas import (
    ArtworkCreate, ArtworkResponse, PoetryCardCreate,
    UserProfileResponse, CommentCreate, CommentResponse
)
from .auth import get_current_user

app = FastAPI(
    title="The Artisan's Quill — Digital Art & Poetry Sanctuary API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/artworks", response_model=List[ArtworkResponse])
async def list_artworks(
    category: Optional[ArtCategoryEnum] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(24, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Fetches high-res artworks and formatted poetry cards with nested artist profiles."""
    query = (
        select(Artwork)
        .options(
            selectinload(Artwork.artist),
            selectinload(Artwork.poetry_detail),
            selectinload(Artwork.video_detail)
        )
        .order_by(Artwork.created_at.desc())
    )
    
    if category:
        query = query.filter(Artwork.category == category)
        
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Artwork.title.ilike(search_pattern)) | 
            (Artwork.description.ilike(search_pattern))
        )
        
    result = await db.execute(query.limit(limit).offset(offset))
    return result.scalars().all()

@app.post("/api/artworks/poetry", response_model=ArtworkResponse, status_code=status.HTTP_201_CREATED)
async def publish_poetry_card(
    payload: PoetryCardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new artwork entry specifically formatted for aesthetic poetry cards."""
    new_artwork = Artwork(
        artist_id=current_user.id,
        title=payload.title,
        category=ArtCategoryEnum.POETRY,
        medium="Formatted Lyric Verse",
        year=payload.year,
        description=payload.description or "Poetry submission",
        aspect_ratio="portrait",
        color_palette=payload.color_palette,
        tags=payload.tags
    )
    
    poetry_meta = PoetryCard(
        artwork=new_artwork,
        stanzas=payload.stanzas,
        theme=payload.theme,
        font_style=payload.font_style,
        alignment=payload.alignment,
        reading_time_minutes=payload.reading_time_minutes,
        author_signature=payload.author_signature or f"— {current_user.full_name}"
    )
    
    db.add(new_artwork)
    db.add(poetry_meta)
    await db.commit()
    await db.refresh(new_artwork)
    return new_artwork
`
  },
  {
    filename: 'supabase_schema.sql',
    language: 'sql',
    category: 'database',
    description: 'Complete Supabase PostgreSQL DDL with RLS, Realtime Replication & Storage Buckets',
    content: `-- Supabase PostgreSQL Schema with Row Level Security and Storage Buckets
-- Execute in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    discipline TEXT DEFAULT 'Visual Artist & Poet',
    location TEXT DEFAULT 'Global Atelier',
    quote_text TEXT,
    quote_author TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    verified BOOLEAN DEFAULT false,
    artworks_count INT DEFAULT 0,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    badges TEXT[] DEFAULT ARRAY['Verified Artist']::TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.artworks (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    artist_name TEXT NOT NULL,
    artist_handle TEXT NOT NULL,
    artist_avatar TEXT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    dimensions TEXT DEFAULT 'Original Canvas',
    medium TEXT DEFAULT 'Digital Media',
    year INT DEFAULT EXTRACT(YEAR FROM now()),
    description TEXT,
    tags TEXT[] DEFAULT ARRAY['Atelier Submission']::TEXT[],
    likes_count INT DEFAULT 0,
    views_count INT DEFAULT 1,
    saves_count INT DEFAULT 0,
    aspect_ratio TEXT DEFAULT 'tall',
    color_palette TEXT[] DEFAULT ARRAY['#12141c', '#c9a875', '#333b4d', '#f0f3fa']::TEXT[],
    featured BOOLEAN DEFAULT false,
    poetry_content JSONB,
    video_data JSONB,
    exhibition_id TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    artwork_id TEXT NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    user_id TEXT DEFAULT 'guest',
    user_name TEXT NOT NULL DEFAULT 'Guest Critic',
    user_handle TEXT NOT NULL DEFAULT '@guest',
    user_avatar TEXT,
    user_verified BOOLEAN DEFAULT false,
    text TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.margin_reflections (
    id TEXT PRIMARY KEY,
    artwork_id TEXT NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    stanza_index INT DEFAULT 0,
    line_index INT,
    verse_snippet TEXT,
    user_id TEXT,
    author_name TEXT NOT NULL DEFAULT 'Sanctuary Poet',
    author_handle TEXT NOT NULL DEFAULT '@poet',
    author_avatar TEXT,
    text TEXT NOT NULL,
    ink_color TEXT DEFAULT 'gold',
    upvotes INT DEFAULT 1,
    is_curator_pick BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and Realtime
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.margin_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Artworks SELECT" ON public.artworks FOR SELECT USING (true);
CREATE POLICY "Public Artworks INSERT" ON public.artworks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Artworks UPDATE" ON public.artworks FOR UPDATE USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.artworks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.margin_reflections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('artworks', 'artworks', true), ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public Storage Objects" ON storage.objects FOR ALL USING (bucket_id IN ('artworks', 'avatars'));
`
  }
];
