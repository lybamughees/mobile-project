# Importing necessary classes and modules from the FastAPI framework
from fastapi import HTTPException, status

# Creating a custom HTTPException instance for a 400 Bad Request scenario
API_400_BAD_REQUEST_EXCEPTION = HTTPException(
    status_code=400,           # HTTP status code for Bad Request
    detail="bad request",      # Custom detail message for the exception
)

# Creating a custom HTTPException instance for a 401 Unauthorized scenario
API_401_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,  # HTTP status code for Unauthorized
    detail="could not validate credentials",  # Custom detail message for the exception
    headers={"WWW-Authenticate": "Bearer"},    # Custom headers for the exception response
)

# Creating a custom HTTPException instance for a 404 Not Found scenario
API_404_NOT_FOUND_EXCEPTION = HTTPException(
    status_code=404,          # HTTP status code for Not Found
    detail="not found",       # Custom detail message for the exception
)

# Creating a custom HTTPException instance for a 409 Conflict scenario
API_409_USERNAME_CONFLICT_EXCEPTION = HTTPException(
    status_code=status.HTTP_409_CONFLICT,   # HTTP status code for Conflict
    detail="username already exists",       # Custom detail message for the exception
)

# Creating a custom HTTPException instance for a 500 Internal Server Error scenario
API_500_SIGNATURE_EXCEPTION = HTTPException(
    status_code=500,           # HTTP status code for Internal Server Error
    detail="server error",     # Custom detail message for the exception
)
