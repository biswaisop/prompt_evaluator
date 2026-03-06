from fastapi import APIRouter, HTTPException, status
from schema import SignUp, loginRequest, tokenResponse, userInDB
from core import createuser, getuserbyemail, verify_password, create_access_token, hash_password
from datetime import timedelta
from pymongo.errors import DuplicateKeyError
AuthRouter = APIRouter()

@AuthRouter.post("/signup",status_code=status.HTTP_201_CREATED)
def signup(user: SignUp):
    existing_user = getuserbyemail(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    hased_password = hash_password(user.password)
    try:
        createuser(
            name=user.name,
            email=user.email,
            hashed_password=hased_password
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    return {"message": "Signup successful"}

@AuthRouter.post("/login", response_model=tokenResponse)
def login(user: loginRequest):
    existing_user = getuserbyemail(user.email)  
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not verify_password(user.password, existing_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    access_token = create_access_token(existing_user.email)
    return tokenResponse(access_token=access_token, token_type="bearer")