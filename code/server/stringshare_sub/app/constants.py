# Importing necessary modules
import os
import urllib.parse

# Getting the value of the 'COMMUNITY' environment variable
COMMUNITY = os.getenv('COMMUNITY')

# Setting up paths for the application
APP_ROOT = "./"
MEDIA_ROOT = APP_ROOT + "media/"
DATA_ROOT = os.path.join(APP_ROOT, 'data', COMMUNITY)

# Setting up database connection information using environment variables
DB_USER = os.getenv('POSTGRES_USER')
DB_KEY = urllib.parse.quote(os.getenv('POSTGRES_PASSWORD'))
DB_SERVER = os.getenv('POSTGRES_SERVER')
DB_PORT = os.getenv('POSTGRES_PORT')
DB_DB = os.getenv('POSTGRES_DB')

# Constructing the database URL using the obtained values
DB_URL = "postgresql://{}:{}@db:{}/{}".format(DB_USER, DB_KEY, DB_PORT, DB_DB)

# Getting the value of the 'SECRET_KEY' environment variable
SECRET_KEY = os.getenv('SECRET_KEY')
