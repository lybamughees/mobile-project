# Importing necessary modules and components
import os.path
from sqlalchemy.sql import delete, select, insert, update
from database import database
from constants import DATA_ROOT, COMMUNITY
import tables
import auth
import methods
import models

# Asynchronous function to reset the entire database to its initial state
async def reset_database():
    print("Resetting database...")

    # Deleting all data from various tables
    await database.execute(delete(tables.activity))
    await database.execute(delete(tables.post_images))
    await database.execute(delete(tables.post_locations))
    await database.execute(delete(tables.likes))
    await database.execute(delete(tables.comments))
    await database.execute(delete(tables.posts))
    await database.execute(delete(tables.following))
    await database.execute(delete(tables.followers))
    await database.execute(delete(tables.user_credentials))
    await database.execute(delete(tables.users))

# Loading initial data from SQL files to populate all the tables
    with open(os.path.join(DATA_ROOT, "users.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "user_credentials.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "followers.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "following.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "posts.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "comments.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "likes.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "post_locations.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "post_images.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    with open(os.path.join(DATA_ROOT, "activity.sql"), 'r') as file:
        user_commands = file.read()
        await database.execute(user_commands)

    print("Database Reset Complete")


# Asynchronous function to print environment variable and constant values
async def helper():
    print(os.getenv('PORT'))
    print(COMMUNITY)

# Asynchronous function to fix the 'followers' table based on the 'following' table
async def fix_followers():
    await database.execute(delete(tables.followers))
    query = select([tables.following])
    following = await database.fetch_all(query)
    for pair in following:
        await database.execute(insert(tables.followers).values(
            user=pair.following,
            follower=pair.user
        ))

# Asynchronous function to populate the 'activity' table based on other tables
async def populate_activity():
    # Populating 'activity' table with 'like' actions
    likes_query = select([tables.likes])
    likes = await database.fetch_all(likes_query)
    for like in likes:
        author = await methods.get_post_author(like.post_id)
        query = insert(tables.activity).values(
            user=author.username,
            action_user=like.username,
            action=models.ActivityAction.like,
            post_id=like.post_id
        )
        await database.execute(query)

    # Populating 'activity' table with 'comment' actions
    comments_query = select([tables.likes])
    comments = await database.fetch_all(comments_query)
    for comment in comments:
        author = await methods.get_post_author(comment.post_id)
        query = insert(tables.activity).values(
            user=author.username,
            action_user=comment.username,
            action=models.ActivityAction.comment,
            post_id=comment.post_id
        )
        await database.execute(query)

    # Populating 'activity' table with 'follow' actions
    query = select([tables.followers])
    followers = await database.fetch_all(query)
    for pair in followers:
        await database.execute(insert(tables.activity).values(
            user=pair.user,
            action_user=pair.follower,
            action=models.ActivityAction.follow
        ))

# Asynchronous function to update user passwords
async def update_password():
    q = select([tables.users])
    users = await database.fetch_all(q)
    for user in users:
        salt = auth.gen_salt()
        query = ((
            update(tables.user_credentials)
            .where(tables.user_credentials.c.username == user.username)
        ).values(
            hashed_password=auth.get_password_hash("a" + salt),
            salt=salt,
            disabled=False
        ))
        await database.execute(query)

# Asynchronous function to create avatars for all users
async def create_avatars():
    q = select([tables.users])
    users = await database.fetch_all(q)
    for user in users:
        await methods.create_avatar(user)