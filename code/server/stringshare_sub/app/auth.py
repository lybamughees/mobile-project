# Importing necessary modules and classes from FastAPI, JWT, and other libraries
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from models import UserAuthIn, User, TokenData
from tables import users, user_credentials
from database import database
from sqlalchemy.sql import select, insert
import bcrypt
import exceptions
import constants

# Setting up constants for JWT (JSON Web Token) and token expiration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

# Creating a password context for password hashing using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Function to verify a password given its plain form, salt, and hashed form
def verify_password(plain_password, salt, hashed_password):
    return pwd_context.verify(plain_password + salt, hashed_password)

# Function to generate a hashed password with salt
def get_password_hash(password_and_salt):
    return pwd_context.hash(password_and_salt)

# Function to generate a salt using bcrypt
def gen_salt():
    return str(bcrypt.gensalt(10))

# Function to get a user by their username from the database
async def get_user(username: str):
    query = select([users.join(user_credentials, users.c.username == user_credentials.c.username)]).where(
        users.c.username == username.lower())
    user = await database.fetch_one(query)
    if user:
        return UserAuthIn(**user)

# Function to authenticate a user by checking their username and password
async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user.salt, user.hashed_password):
        return False
    return user

# Function to create an access token with optional expiration time
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, constants.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Function to get the current user from the JWT token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Decoding the JWT token and extracting the username
        payload = jwt.decode(token, constants.SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            # Raise an exception if the username is missing
            raise exceptions.API_401_CREDENTIALS_EXCEPTION
        token_data = TokenData(username=username)
    except JWTError:
        # Raise an exception if there is an issue decoding the token
        raise exceptions.API_401_CREDENTIALS_EXCEPTION
    
    # Retrieve the user from the database based on the extracted username
    user = await get_user(username=token_data.username)
    if user is None:
        # Raise an exception if the user is not found in the database
        raise exceptions.API_401_CREDENTIALS_EXCEPTION
    return user

# Function to get the current active user using the previous function
async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user

# Function to handle the login process and generate an access token
async def login(form_data):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        # Raise an exception if the authentication fails
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate an access token with a specified expiration time
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
