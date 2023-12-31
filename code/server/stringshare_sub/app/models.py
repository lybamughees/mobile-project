from pydantic import BaseModel
from typing import Optional, Any, List, Dict
from uuid import UUID

import datetime
import enum

# Auth Models

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Users Models

class User(BaseModel):
    username: str
    full_name: str

class SearchUser(User):
    is_following: Optional[bool]
    avatar_url: str

class UserAvatar(User):
    avatar_url: str

class UserIn(User):
    password: str

class UserAuthIn(User):
    hashed_password: str
    salt: str

# Post Models

class Post(User):
    post_id: UUID
    content: str
    date_posted: datetime.datetime
    latitude: float
    longitude: float

class PostOut(Post):
    avatar_url: Optional[str]
    image_url: Optional[str]
    comments: int
    likes: int
    liked: bool

# User Profile Models

class UserOut(User):
    bio: Optional[str]
    avatar_url: Optional[str]
    followers: int
    following: int
    posts: List[PostOut]

# Comment Models

class CommentOut(BaseModel):
    comment_id: UUID
    username: str
    content: str
    avatar_url: Optional[str]
    date_posted: datetime.datetime

class FollowingOut(BaseModel):
    following: str

class FollowerOut(BaseModel):
    follower: str

class LikeOut(BaseModel):
    username: str

class Comment(BaseModel):
    post_id: UUID
    content: str

# Activity Models

class ActivityAction(enum.Enum):
    follow = 0
    like = 1
    comment = 2

class ActivityOut(BaseModel):
    action_user: str
    action: str
    full_name: str
    avatar_url: str
    post_id: Optional[UUID]

# Additional Models

class DataIn(BaseModel):
    test: str

class ServerSearchUser(User):
    search_query: str

class ServerUser(User):
    avatar_url: str
    bio: str

class ServerFollowUser(BaseModel):
    username: str
    user: ServerUser

class ServerLike(BaseModel):
    post_id: UUID
    user: ServerUser

class ServerComment(BaseModel):
    comment: Comment
    user: ServerUser
