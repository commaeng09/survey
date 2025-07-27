#!/usr/bin/env python
"""
Migration script for Render.com deployment
This will run migrations and create the database tables
"""
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.insert(0, '/app')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'survey_project.settings')

# Setup Django
django.setup()

# Import Django management commands
from django.core.management import execute_from_command_line

def main():
    """Run migrations and create superuser if needed"""
    print("🔧 Starting Render.com database migration...")
    
    try:
        # Run migrations
        print("📊 Running migrations...")
        execute_from_command_line(['manage.py', 'migrate'])
        
        # Create superuser if it doesn't exist
        print("👤 Creating superuser if needed...")
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            print("✅ Superuser created: admin/admin123")
        else:
            print("ℹ️ Superuser already exists")
            
        print("✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
