import os

import httpx
from fastapi import HTTPException
from jose import jwt as jose_jwt
from jose.exceptions import JWTError

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

APPLE_SERVICES_ID = os.environ.get("APPLE_SERVICES_ID", "")
APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys"
APPLE_ISSUER = "https://appleid.apple.com"


async def verify_google_access_token(access_token: str) -> dict:
    """Verify a Google OAuth access token by asking Google who it belongs to.

    Requires only a Client ID (no client secret) since we use the implicit
    grant on the frontend and just confirm the token with Google directly.
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured on the server yet. Set GOOGLE_CLIENT_ID.",
        )

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired Google access token")

    data = response.json()
    email = data.get("email")
    if not email or not data.get("email_verified", True):
        raise HTTPException(status_code=401, detail="Google account has no verified email")

    return {"email": email, "full_name": data.get("name") or email.split("@")[0]}


async def verify_apple_id_token(id_token: str) -> dict:
    """Verify an Apple Sign In id_token against Apple's published public keys.

    Requires only the Services ID (used as the expected `aud` claim) — no
    client secret or private key needed, since we're verifying a token Apple
    already signed rather than exchanging a code ourselves.
    """
    if not APPLE_SERVICES_ID:
        raise HTTPException(
            status_code=503,
            detail="Apple sign-in is not configured on the server yet. Set APPLE_SERVICES_ID.",
        )

    try:
        unverified_header = jose_jwt.get_unverified_header(id_token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Malformed Apple sign-in token")

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(APPLE_KEYS_URL)
    jwks = response.json().get("keys", [])

    key = next((k for k in jwks if k.get("kid") == unverified_header.get("kid")), None)
    if not key:
        raise HTTPException(status_code=401, detail="Could not verify Apple sign-in token")

    try:
        payload = jose_jwt.decode(
            id_token,
            key,
            algorithms=["RS256"],
            audience=APPLE_SERVICES_ID,
            issuer=APPLE_ISSUER,
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired Apple sign-in token")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Apple account has no email on this token")

    return {"email": email, "full_name": email.split("@")[0]}
