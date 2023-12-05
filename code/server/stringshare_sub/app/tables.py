# Importing necessary modules and classes from SQLAlchemy
from sqlalchemy import Column, Integer, String, Boolean, Table, MetaData, Enum, Float, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

# Importing models module
import models

# Creating a metadata object to hold the information about database tables
metadata = MetaData()

# Defining the 'users' table
users = Table('users', metadata,
    Column('username', String(100), primary_key=True),  # Primary key for user identification
    Column('full_name', String(100)),  # Full name of the user
    Column('avatar_url', String(500)),  # URL for the user's avatar (could be stored on other servers)
    Column('bio', String(500)),  # Biography or description of the user
    # Column('server', String(100)),  # Uncomment if storing information about the server
)

# Defining the 'user_credentials' table
user_credentials = Table('user_credentials', metadata,
    Column('username', String(100), ForeignKey('users.username', ondelete='cascade'), primary_key=True, unique=True),
    Column('hashed_password', String(100)),  # Hashed password for user authentication
    Column('salt', String(64)),  # Salt for password hashing
    Column('disabled', Boolean, default=False),  # Flag indicating if the user is disabled
    Column('date_created', DateTime, server_default=func.now()),  # Date and time when the user was created
)

# Defining the 'posts' table
posts = Table('posts', metadata,
    Column('post_id', UUID, primary_key=True, server_default=func.gen_random_uuid()),  # Unique identifier for posts
    Column('username', String(100), ForeignKey('users.username', ondelete='cascade')),  # User who made the post
    Column('content', String(1000)),  # Content of the post
    Column('date_posted', DateTime, server_default=func.now()),  # Date and time when the post was made
)

# Defining the 'post_locations' table
post_locations = Table('post_locations', metadata,
    Column('post_id', UUID, ForeignKey('posts.post_id', ondelete='cascade'), primary_key=True),
    Column('latitude', Float),  # Latitude information for post location
    Column('longitude', Float),  # Longitude information for post location
)

# Defining the 'post_images' table
post_images = Table('post_images', metadata,
    Column('post_id', UUID, ForeignKey('posts.post_id', ondelete='cascade'), primary_key=True),
    Column('image_url', String(500), primary_key=True),  # URL for post images
)

# Defining the 'likes' table
likes = Table('likes', metadata,
    Column('post_id', UUID, ForeignKey('posts.post_id', ondelete='cascade'), primary_key=True),
    Column('username', ForeignKey('users.username', ondelete='cascade'), primary_key=True),
)

# Defining the 'comments' table
comments = Table('comments', metadata,
    Column('comment_id', UUID, primary_key=True, server_default=func.gen_random_uuid()),  # Unique identifier for comments
    Column('post_id', UUID, ForeignKey('posts.post_id', ondelete='cascade')),  # Post associated with the comment
    Column('username', String(100), ForeignKey('users.username', ondelete='cascade')),  # User who made the comment
    Column('content', String(1000)),  # Content of the comment
    Column('date_posted', DateTime, server_default=func.now()),  # Date and time when the comment was made
)

# Defining the 'followers' table
followers = Table('followers', metadata,
    Column('user', String(100), ForeignKey('users.username', ondelete='cascade'), primary_key=True),
    Column('follower', String(100), ForeignKey('users.username', ondelete='cascade'), primary_key=True),
)

# Defining the 'following' table
following = Table('following', metadata,
    Column('user', String(100), ForeignKey('users.username', ondelete='cascade'), primary_key=True),
    Column('following', String(100), ForeignKey('users.username', ondelete='cascade'), primary_key=True),
)

# Defining the 'activity' table
activity = Table('activity', metadata,
    Column('action_id', UUID, primary_key=True, server_default=func.gen_random_uuid()),  # Unique identifier for actions
    Column('user', String(100), ForeignKey('users.username', ondelete='cascade'), primary_key=True),  # User involved in the action
    Column('action_user', String(100), ForeignKey('users.username', ondelete='cascade')),  # User performing the action
    Column('action', Enum(models.ActivityAction), primary_key=True, default=None),  # Type of action (enum from the models module)
    Column('post_id', ForeignKey('posts.post_id', ondelete='cascade'), default=None),  # Post associated with the action
    Column('datetime', DateTime, server_default=func.now()),  # Date and time when the action occurred
)
