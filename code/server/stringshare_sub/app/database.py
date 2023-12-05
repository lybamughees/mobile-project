# Importing necessary modules for working with databases and SQLAlchemy
import databases
import sqlalchemy

# Importing the metadata object from the 'tables' module
from tables import metadata

# Importing constants module to access database URL
import constants

# Creating a databases.Database instance with the specified database URL
database = databases.Database(constants.DB_URL)

# Creating a SQLAlchemy engine instance with the specified database URL
engine = sqlalchemy.create_engine(constants.DB_URL, echo=False)

# Creating database tables based on the defined metadata
metadata.create_all(engine)
