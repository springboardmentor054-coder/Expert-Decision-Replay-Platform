#!/usr/bin/env python
"""
Backend verification script
Checks if all dependencies are installed and database is accessible
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

def check_environment():
    """Check if environment variables are set correctly"""
    print("Checking environment variables...")
    
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL not set")
        return False
    print(f"✓ DATABASE_URL: {database_url}")
    
    session_secret = os.environ.get("SESSION_SECRET")
    if not session_secret:
        print("⚠️  SESSION_SECRET not set (using default)")
    else:
        print("✓ SESSION_SECRET is set")
    
    return True

def check_imports():
    """Check if all required packages are installed"""
    print("\nChecking dependencies...")
    
    required_packages = [
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "psycopg2",
        "bcrypt",
        "jose",
        "pydantic",
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package}")
        except ImportError:
            print(f"❌ {package}")
            missing.append(package)
    
    if missing:
        print(f"\nMissing packages: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    return True

def check_database():
    """Check if database connection works"""
    print("\nChecking database connection...")
    
    try:
        from app.database.session import engine
        
        with engine.connect() as conn:
            print("✓ Database connection successful")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False

def check_models():
    """Check if all models can be imported"""
    print("\nChecking models...")
    
    try:
        from app import models
        print("✓ All models imported successfully")
        return True
    except Exception as e:
        print(f"❌ Error importing models: {str(e)}")
        return False

def check_app():
    """Check if the FastAPI app can be instantiated"""
    print("\nChecking FastAPI app...")
    
    try:
        from app.main import app
        print("✓ FastAPI app instantiated successfully")
        print(f"✓ Title: {app.title}")
        print(f"✓ Version: {app.version}")
        return True
    except Exception as e:
        print(f"❌ Error with FastAPI app: {str(e)}")
        return False

def main():
    """Run all checks"""
    print("=" * 50)
    print("Expert Decision Replay Backend - Verification")
    print("=" * 50)
    
    checks = [
        check_environment,
        check_imports,
        check_database,
        check_models,
        check_app,
    ]
    
    results = []
    for check in checks:
        try:
            result = check()
            results.append(result)
        except Exception as e:
            print(f"\n❌ Unexpected error in {check.__name__}: {str(e)}")
            results.append(False)
    
    print("\n" + "=" * 50)
    if all(results):
        print("✓ All checks passed! Backend is ready to run.")
        print("\nTo start the backend:")
        print("  uvicorn app.main:app --reload")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
