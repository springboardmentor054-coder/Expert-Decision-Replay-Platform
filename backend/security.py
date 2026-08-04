from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from jose import JWTError, jwt

from sqlalchemy.orm import Session

from database import get_db
from models import User

from passlib.context import CryptContext


# =====================================
# Password Security
# =====================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
):

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# =====================================
# JWT Configuration
# =====================================

# Move this to an environment variable
# before production deployment.

SECRET_KEY = (
    "expert-decision-replay-platform-"
    "secret-key-2026"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# =====================================
# HTTP Bearer Authentication
# =====================================

# This allows Swagger Authorize
# to accept a JWT Bearer token directly.

bearer_scheme = HTTPBearer()


# =====================================
# Valid Roles
# =====================================

VALID_ROLES = [
    "Admin",
    "Manager",
    "Reviewer",
    "User"
]


# =====================================
# Create Access Token
# =====================================

def create_access_token(
    user_id: int
):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {

        # Store logged-in user's ID
        # inside the JWT.

        "sub": str(user_id),

        # Token expiry time.

        "exp": expire
    }


    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


    return token


# =====================================
# Get Current Logged-In User
# =====================================

def get_current_user(

    credentials:
        HTTPAuthorizationCredentials
        = Depends(bearer_scheme),

    db: Session =
        Depends(get_db)

):

    # =====================================
    # Authentication Error
    # =====================================

    credentials_exception = HTTPException(

        status_code=
            status.HTTP_401_UNAUTHORIZED,

        detail=(
            "Invalid or expired "
            "authentication token"
        ),

        headers={
            "WWW-Authenticate":
                "Bearer"
        }

    )


    # =====================================
    # Extract JWT Token
    # =====================================

    if not credentials:

        raise credentials_exception


    token = credentials.credentials


    # =====================================
    # Decode JWT
    # =====================================

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[
                ALGORITHM
            ]

        )


        # Get user ID stored
        # inside "sub".

        user_id =payload.get("sub")


        if user_id is None:

            raise credentials_exception


        user_id = int(
            user_id
        )


    except (
        JWTError,
        ValueError
    ):

        raise credentials_exception


    # =====================================
    # Find User in Database
    # =====================================

    user = (

        db.query(User)

        .filter(
            User.user_id
            == user_id
        )

        .first()

    )


    # =====================================
    # User Must Still Exist
    # =====================================

    if not user:

        raise credentials_exception


    # IMPORTANT:
    #
    # We return the CURRENT database user.
    #
    # Therefore role is read from PostgreSQL,
    # not trusted from React or from the JWT.

    return user


# =====================================
# Validate Role
# =====================================

def validate_role(
    role: str
):

    if role not in VALID_ROLES:

        raise HTTPException(

            status_code=
                status.HTTP_400_BAD_REQUEST,

            detail=
                "Invalid user role"

        )


    return True


# =====================================
# Check Allowed Role
# =====================================

def require_role(
    user,
    allowed_roles
):

    # =====================================
    # User Must Be Authenticated
    # =====================================

    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Authentication required"

        )


    # =====================================
    # User Must Have Role
    # =====================================

    if not user.role:

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=
                "User role not assigned"

        )


    # =====================================
    # Check Permission
    # =====================================

    if user.role not in allowed_roles:

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail=(

                "Access denied. "
                "Your role does not have "
                "permission for this action."

            )

        )


    return True