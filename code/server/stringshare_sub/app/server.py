# Importing necessary modules and classes from FastAPI
from fastapi import FastAPI, Depends, status, Request, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from uuid import UUID
from typing import List

# Importing standard libraries
import time
import logging
import random
import string
import helper
import os

# Importing custom modules and classes
import models
import exceptions
import database
import constants
import methods
import auth

# Creating a FastAPI app instance
app = FastAPI()

# Configuring logging to write to 'info.log'
logging.basicConfig(filename='info.log', level=logging.INFO)
logger = logging.getLogger(__name__)

# Middleware to log incoming requests and their processing times
@app.middleware('http')
async def log_requests(request: Request, call_next):
    idem = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    logger.info(f"rid={idem} start request path={request.url.path}")
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    formatted_process_time = '{0:.2f}'.format(process_time)
    logger.info(f"rid={idem} completed_in={formatted_process_time}ms status_code={response.status_code}")
    return response

# Event handlers for startup and shutdown
@app.on_event("startup")
async def startup():
    await database.database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.database.disconnect()

# API Routes

# Util Routes --

# Reset the database (for development purposes)
@app.get("/reset_database")
async def reset_database():
    await helper.reset_database()

# Utility endpoint (for development/debugging purposes)
@app.get("/util")
async def util():
    print("helping!")
    # Uncomment and use helper methods for various tasks
    # await helper.helper()
    # await helper.populate_activity()
    # await helper.fix_followers()
    # await helper.update_password()

# Auth Routes --

# Obtain a JWT token for authentication
@app.post("/token", response_model=models.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    token = await auth.login(form_data)
    return token

# User Routes --

# Create a new user
@app.post("/client/signup", status_code=status.HTTP_201_CREATED)
async def create_user(user: models.UserIn):
    await methods.create_user(user)

# Get the current user's profile
@app.get("/client/me", status_code=status.HTTP_200_OK, response_model=models.UserOut)
async def get_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_user_profile(current_user.username, current_user)

# Get a user's profile by username
@app.get("/client/users", status_code=status.HTTP_200_OK, response_model=models.UserOut)
async def get_user_profile(username: str, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_user_profile(username, current_user)

# Get user's activity
@app.get("/client/activity", status_code=status.HTTP_200_OK, response_model=List[models.ActivityOut])
async def get_activity(current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_activity(current_user)

# Search for users
@app.get("/client/search", status_code=status.HTTP_200_OK, response_model=List[models.SearchUser])
async def search_users(search_query: str, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.search_users(search_query, current_user)

# Follow a user
@app.post("/client/follow", status_code=status.HTTP_201_CREATED)
async def follow_user(username: str, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.follow_user(username, current_user)

# Get user's followers
@app.get("/client/followers", status_code=status.HTTP_200_OK, response_model=List[models.FollowerOut])
async def get_followers(current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_followers(current_user)

# Get user's following list
@app.get("/client/following", status_code=status.HTTP_200_OK, response_model=List[models.FollowingOut])
async def get_following(current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_following(current_user)

# Update user's bio
@app.post("/client/bio", status_code=status.HTTP_201_CREATED)
async def create_bio(bio: str, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.create_bio(bio, current_user)

# Update user's avatar
@app.post("/client/avatar", status_code=status.HTTP_201_CREATED)
async def update_avatar(file: UploadFile, current_user: models.User = Depends(auth.get_current_active_user)):
    await methods.update_avatar(file, current_user)

# Post, Comments, & Likes Routes --

# Get the user's feed
@app.get("/client/posts", status_code=status.HTTP_200_OK, response_model=List[models.PostOut])
async def get_feed(current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_feed(current_user)

# Get details of a specific post
@app.get("/client/post", status_code=status.HTTP_200_OK, response_model=models.PostOut)
async def get_post(post_id: UUID, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_post(post_id, current_user)

# Get likes for a post
@app.get("/client/likes", status_code=status.HTTP_200_OK, response_model=List[models.LikeOut])
async def get_post_likes(post_id: UUID, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_post_likes(post_id)

# Get comments for a post
@app.get("/client/comments", status_code=status.HTTP_200_OK, response_model=List[models.CommentOut])
async def get_comments(post_id: UUID, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.get_post_comments(post_id)

# Create a new post
@app.post("/client/post", status_code=status.HTTP_201_CREATED)
async def create_post(
        post: str,
        latitude: float,
        longitude: float,
        photo: UploadFile = None,
        current_user: models.User = Depends(auth.get_current_active_user)
):
    return await methods.create_post(post, latitude, longitude, photo, current_user)

# Create a new comment on a post
@app.post("/client/comment", status_code=status.HTTP_201_CREATED)
async def create_comment(comment: models.Comment, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.create_comment(comment, current_user)

# Like a post
@app.post("/client/like", status_code=status.HTTP_201_CREATED)
async def create_like(post_id: UUID, current_user: models.User = Depends(auth.get_current_active_user)):
    return await methods.create_like(post_id, current_user)

# Get a photo (avatar or post image)
@app.get("/client/media/", status_code=status.HTTP_200_OK)
async def get_photo(url: str = None):
    path = os.path.join(constants.MEDIA_ROOT, url)
    if os.path.isfile(path):
        return FileResponse(path)
    else:
        raise exceptions.API_404_NOT_FOUND_EXCEPTION
