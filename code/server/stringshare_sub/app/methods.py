# Importing necessary modules and components
from uuid import UUID
from fastapi import UploadFile
from sqlalchemy.sql import select, insert, update, or_, delete
from sqlalchemy import func
from database import database
from constants import MEDIA_ROOT, COMMUNITY
import os.path
import auth
import tables
import aiofiles
import requests
import exceptions
import models

# Asynchronous function to create a new user
async def create_user(user: models.UserIn):
    # Adding community suffix to the username if not present
    if "@" + COMMUNITY not in user.username:
        user.username = user.username + "@" + COMMUNITY
    user.username = user.username.lower()

    # Checking if the username already exists
    query = tables.users.select().where(tables.users.c.username == user.username)
    existing_user = await database.execute(query)

    if existing_user:
        raise exceptions.API_409_USERNAME_CONFLICT_EXCEPTION
    else:
        async with (database.transaction()):
            try:
                # Generating a salt for password hashing
                salt = auth.gen_salt()

                # Inserting user data into the 'users' table
                query = tables.users.insert().values(
                    username=user.username,
                    full_name=user.full_name,
                    avatar_url=await create_avatar(user)
                )
                await database.execute(query)

                # Inserting user credentials into the 'user_credentials' table
                query = tables.user_credentials.insert().values(
                    username=user.username,
                    hashed_password=auth.get_password_hash(user.password + salt),
                    salt=salt,
                    disabled=False
                )
                await database.execute(query)

            except Exception as e:
                print(e)
                # Uncomment the line below if you want to rollback in case of an exception
                # await database.rollback()

# Asynchronous function to create an avatar for a user
async def create_avatar(user: models.User):
    # Parameters for the avatar creation API
    params = {
        "name": user.full_name,
        "background": "random"
    }

    # Requesting an avatar image from the API
    avatar = requests.get('https://ui-avatars.com/api/', params=params)

    # Writing the avatar image to a file
    async with aiofiles.open(os.path.join(MEDIA_ROOT, (user.username + ".png")), "wb") as out_file:
        await out_file.write(avatar.content)

    # Returning the filename of the avatar
    return user.username + ".png"

# Asynchronous function to get user information by username
async def get_user(username: str):
    query = tables.users.select().where(tables.users.c.username == username)
    user = await database.fetch_one(query)

    if user:
        return user
    else:
        raise exceptions.API_404_NOT_FOUND_EXCEPTION

# Asynchronous function to get user profile information
async def get_user_profile(username: str, user: models.User):
    # Subqueries for counting followers and following
    followers_subquery = select([
        tables.followers.c.user,
        func.count().label('followers')
    ]).group_by(tables.followers.c.user).subquery()

    following_subquery = select([
        tables.following.c.user,
        func.count().label('following')
    ]).group_by(tables.following.c.user).subquery()

    # Query to retrieve user profile information
    profile_query = select([
        tables.users,
        func.coalesce(followers_subquery.c.followers, 0).label('followers'),
        func.coalesce(following_subquery.c.following, 0).label('following')
    ]).select_from(
        tables.users
        .outerjoin(followers_subquery, followers_subquery.c.user == tables.users.c.username)
        .outerjoin(following_subquery, following_subquery.c.user == tables.users.c.username)
    ).where(
        tables.users.c.username == username
    )

    # Fetching the user profile
    profile = await database.fetch_one(profile_query)

    # Subqueries for counting comments, likes, and checking if liked
    comments_subquery = select([
        tables.comments.c.post_id,
        func.count().label('comments')
    ]).group_by(tables.comments.c.post_id).subquery()

    likes_subquery = select([
        tables.likes.c.post_id,
        func.count().label('likes')
    ]).group_by(tables.likes.c.post_id).subquery()

    liked_subquery = select([
        tables.likes.c.post_id,
        func.bool_or(tables.likes.c.username == user.username).label('liked')
    ]).group_by(tables.likes.c.post_id).subquery()

    # Query to retrieve user's posts
    query = select([
        tables.posts,
        tables.users.c.username,
        tables.users.c.full_name,
        tables.users.c.avatar_url,
        func.coalesce(comments_subquery.c.comments, 0).label('comments'),
        func.coalesce(likes_subquery.c.likes, 0).label('likes'),
        func.coalesce(liked_subquery.c.liked, False).label('liked'),
        tables.post_images.c.image_url,
        tables.post_locations.c.latitude,
        tables.post_locations.c.longitude
    ]).select_from(
        tables.posts
        .join(tables.users, tables.users.c.username == tables.posts.c.username)
        .outerjoin(comments_subquery, comments_subquery.c.post_id == tables.posts.c.post_id)
        .outerjoin(likes_subquery, likes_subquery.c.post_id == tables.posts.c.post_id)
        .outerjoin(tables.post_images, tables.post_images.c.post_id == tables.posts.c.post_id)
        .outerjoin(tables.post_locations, tables.post_locations.c.post_id == tables.posts.c.post_id)
    ).where(
        tables.posts.c.username == username
    ).order_by(
        tables.posts.c.date_posted.desc()
    )

    # Fetching user's posts
    posts = await database.fetch_all(query)

    # Returning user profile information along with posts
    return {**profile, 'posts': posts}

# Asynchronous function to retrieve user activity
async def get_activity(user: models.User):
    # Query to fetch user activity along with user details
    query = select([
        tables.activity,
        tables.users.c.full_name,
        tables.users.c.avatar_url
    ]).select_from(
        tables.activity
        .join(tables.users, tables.users.c.username == tables.activity.c.action_user)
    ).where(tables.activity.c.user == user.username).order_by(
        tables.activity.c.datetime.desc()
    )
    
    # Fetching and returning all activity records
    return await database.fetch_all(query)


# Asynchronous function to search for users based on a search query
async def search_users(search_query: str, user: models.User):
    # Subquery to check if the current user is following each user in the result
    following_subquery = select([
        tables.following.c.following,
        func.bool_or(tables.following.c.user == user.username).label('is_following')
    ]).group_by(tables.following.c.following).subquery()

    # Query to search for users matching the search query, including following status
    query = select([
        tables.users.c.username,
        tables.users.c.full_name,
        tables.users.c.avatar_url,
        following_subquery.c.is_following
    ]).select_from(
        tables.users
        .outerjoin(following_subquery, tables.users.c.username == following_subquery.c.following)
    ).where(
        or_(
            tables.users.c.username.like("%" + search_query + "%"),
            tables.users.c.full_name.like("%" + search_query + "%"),
        )
    )

    # Fetching and returning all matching users with their following status
    return await database.fetch_all(query)


# Asynchronous function to get the list of followers for a user
async def get_followers(user: models.User):
    query = select(tables.followers).where(tables.followers.c.user == user.username)
    followers = await database.fetch_all(query)
    return followers


# Asynchronous function to get the list of users a given user is following
async def get_following(user: models.User):
    query = select(tables.following.c.following).where(tables.following.c.user == user.username)
    following = await database.fetch_all(query)
    return following


# Asynchronous function to get the count of followers for a user
async def get_follower_count(user: models.User):
    query = select([func.count()]).select_from(tables.followers).where(tables.followers.c.user == user.username)
    followers = await database.execute(query)
    return followers


# Asynchronous function to get the count of users a given user is following
async def get_following_count(user: models.User):
    query = select([func.count()]).select_from(tables.following).where(tables.following.c.user == user.username)
    following = await database.execute(query)
    return following


# Asynchronous function to create or update user bio
async def create_bio(bio, user):
    query = update(tables.users).where(tables.users.c.username == user.username).values(bio=bio)
    await database.execute(query)


# Asynchronous function to update user avatar
async def update_avatar(photo: UploadFile, user: models.User):
    _, extension = os.path.splitext(photo.filename)
    url = str(user.username) + extension
    
    # Writing the photo content to the specified file
    async with aiofiles.open(os.path.join(MEDIA_ROOT, url), "wb") as out_file:
        await out_file.write(photo.file.read())
    
    # Updating the user's avatar URL in the database
    query = update(tables.users).where(tables.users.c.username == user.username).values(avatar_url=url)
    await database.execute(query)


# Asynchronous function to retrieve a specific post
async def get_post(post_id: UUID, user: models.User):
    # Subqueries to fetch counts and user-specific information related to the post
    comments_subquery = select([
        tables.comments.c.post_id,
        func.count().label('comments')
    ]).group_by(tables.comments.c.post_id).subquery()

    likes_subquery = select([
        tables.likes.c.post_id,
        func.count().label('likes')
    ]).group_by(tables.likes.c.post_id).subquery()

    liked_subquery = select([
        tables.likes.c.post_id,
        func.bool_or(tables.likes.c.username == user.username).label('liked')
    ]).group_by(tables.likes.c.post_id).subquery()

    # Main query to fetch post details
    query = select([
        tables.posts,
        tables.users,
        func.coalesce(comments_subquery.c.comments, 0).label('comments'),
        func.coalesce(likes_subquery.c.likes, 0).label('likes'),
        func.coalesce(liked_subquery.c.liked, False).label('liked'),
        tables.post_images.c.image_url,
        tables.post_locations.c.latitude,
        tables.post_locations.c.longitude
    ]).select_from(
        tables.posts
        .join(tables.users, tables.posts.c.username == tables.users.c.username)
        .outerjoin(comments_subquery, comments_subquery.c.post_id == tables.posts.c.post_id)
        .outerjoin(likes_subquery, likes_subquery.c.post_id == tables.posts.c.post_id)
        .outerjoin(tables.post_images, tables.post_images.c.post_id == tables.posts.c.post_id)
        .outerjoin(tables.post_locations, tables.post_locations.c.post_id == tables.posts.c.post_id)
    ).where(
        tables.posts.c.post_id == post_id
    )
    
    # Fetching and returning the post details
    feed = await database.fetch_one(query)
    return feed


# Asynchronous function to retrieve the user's feed
async def get_feed(user: models.User):
    # Similar subqueries as in the get_post function
    comments_subquery = select([
        tables.comments.c.post_id,
        func.count().label('comments')
    ]).group_by(tables.comments.c.post_id).subquery()

    likes_subquery = select([
        tables.likes.c.post_id,
        func.count().label('likes')
    ]).group_by(tables.likes.c.post_id).subquery()

    liked_subquery = select([
        tables.likes.c.post_id,
        func.bool_or(tables.likes.c.username == user.username).label('liked')
    ]).group_by(tables.likes.c.post_id).subquery()

    # Query to fetch posts from users the current user is following
    query = select([
        tables.posts,
        tables.users,
        func.coalesce(comments_subquery.c.comments, 0).label('comments'),
        func.coalesce(likes_subquery.c.likes, 0).label('likes'),
        func.coalesce(liked_subquery.c.liked, False).label('liked'),
        tables.post_images.c.image_url,
        tables.post_locations.c.latitude,
        tables.post_locations.c.longitude
    ]).select_from(
        tables.following
        .join(tables.posts, tables.following.c.following == tables.posts.c.username)
        .join(tables.users, tables.posts.c.username == tables.users.c.username)
        .outerjoin(comments_subquery, comments_subquery.c.post_id == tables.posts.c.post_id)
        .outerjoin(likes_subquery, likes_subquery.c.post_id == tables.posts.c.post_id)
        .outerjoin(liked_subquery, liked_subquery.c.post_id == tables.posts.c.post_id)
        .outerjoin(tables.post_images, tables.post_images.c.post_id == tables.posts.c.post_id)
        .outerjoin(tables.post_locations, tables.post_locations.c.post_id == tables.posts.c.post_id)
    ).where(
        tables.following.c.user == user.username
    ).order_by(
        tables.posts.c.date_posted.desc()
    )
    
    # Fetching and returning the user's feed
    feed = await database.fetch_all(query)
    return feed


# Asynchronous function to retrieve likes for a specific post
async def get_post_likes(post_id: UUID):
    query = tables.likes.select().where(tables.likes.c.post_id == post_id)
    likes = await database.fetch_all(query)
    return likes


# Asynchronous function to retrieve comments for a specific post
async def get_post_comments(post_id: UUID):
    # Query to fetch comments along with user information for a specific post
    query = select([
        tables.comments,
        tables.users
    ]).select_from(
        tables.comments
        .join(tables.users, tables.comments.c.username == tables.users.c.username)
    ).where(
        tables.comments.c.post_id == post_id
    ).order_by(
        tables.comments.c.date_posted.desc()
    )
    
    # Fetching and returning comments
    comments = await database.fetch_all(query)
    return comments


# Asynchronous function to create a new post
async def create_post(post: str, latitude: float, longitude: float, photo: UploadFile, user: models.User):
    async with (database.transaction()):
        try:
            # Inserting the post details into the posts table
            post_query = insert(tables.posts).values(username=user.username, content=post)
            post_id = await database.execute(post_query)
            
            # Handling post image, if provided
            if photo:
                _, extension = os.path.splitext(photo.filename)
                url = str(post_id) + extension
                async with aiofiles.open(os.path.join(MEDIA_ROOT, url), "wb") as out_file:
                    await out_file.write(photo.file.read())
                
                # Inserting post image details into the post_images table
                image_query = insert(tables.post_images).values(post_id=post_id, image_url=url)
                await database.execute(image_query)
            
            # Inserting post location details into the post_locations table
            location_query = insert(
                tables.post_locations
            ).values(post_id=post_id,
                     latitude=latitude,
                     longitude=longitude)
            await database.execute(location_query)
        except Exception as e:
            print(e)
            # Handle exceptions or log errors as needed


# Asynchronous function to follow another user
async def follow_user(username: str, user: models.User):
    async with (database.transaction()):
        try:
            # Inserting into following and followers tables to establish the follow relationship
            query = insert(tables.following).values(user=user.username, following=username)
            await database.execute(query)
            query = insert(tables.followers).values(user=username, follower=user.username)
            await database.execute(query)
        except Exception as e:
            print(e)
            # Handle exceptions or log errors as needed
    
    # Logging the follow action
    await log_action(user, models.ActivityAction.follow, username=username)


# Asynchronous function to create a new comment
async def create_comment(comment: models.Comment, user: models.User):
    # Inserting comment details into the comments table
    query = insert(tables.comments).values(
        post_id=comment.post_id,
        username=user.username,
        content=comment.content
    )
    await database.execute(query)
    
    # Logging the comment action
    await log_action(user, models.ActivityAction.comment, post_id=comment.post_id)


# Asynchronous function to create or remove a like on a post
async def create_like(post_id: UUID, user: models.User):
    # Checking if the user has already liked the post
    existing_query = select([tables.likes]).where(
        tables.likes.c.post_id == post_id,
        tables.likes.c.username == user.username)
    existing = await database.fetch_one(existing_query)
    
    # If the user has already liked the post, remove the like; otherwise, add a new like
    if existing:
        query = delete(tables.likes).where(
            tables.likes.c.post_id == post_id,
            tables.likes.c.username == user.username
        )
        await database.execute(query)
    else:
        query = insert(tables.likes).values(
            post_id=post_id,
            username=user.username
        )
        await database.execute(query)
    
    # Logging the like action
    await log_action(user, models.ActivityAction.like, post_id=post_id)


# Asynchronous function to retrieve the author of a specific post
async def get_post_author(post_id: UUID):
    query = select([
        tables.posts.c.post_id,
        tables.users.c.username
    ]).select_from(
        tables.posts
        .join(tables.users, tables.posts.c.username == tables.users.c.username)
    ).where(
        tables.posts.c.post_id == post_id
    )
    return await database.fetch_one(query)


# Asynchronous function to log a user action (follow, comment, like) in the activity table
async def log_action(action_user: models.User, action: models.ActivityAction, username: str = None,
                     post_id: UUID = None):
    # Depending on the action type, log the action in the activity table
    if username is None and post_id is not None:
        # If the action is related to a post, find the author and log the action
        author = await get_post_author(post_id)
        query = insert(tables.activity).values(
            user=author.username,
            action_user=action_user.username,
            action=action,
            post_id=post_id
        )
        await database.execute(query)
    elif username is not None and action is models.ActivityAction.follow:
        # If the action is a follow, log the action for the specified user
        query = insert(tables.activity).values(
            user=username,
            action_user=action_user.username,
            action=action
        )
        await database.execute(query)
