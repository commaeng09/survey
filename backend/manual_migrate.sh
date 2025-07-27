#!/bin/bash
# Manual migration script for Render.com
# Use this if automatic migrations fail

echo "🔧 Manual database migration for Render.com"
echo "📊 Running Django migrations..."

# Run migrations
python manage.py migrate --noinput

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
    
    # Create superuser if needed
    echo "👤 Checking for superuser..."
    python -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('✅ Superuser created: admin/admin123')
else:
    print('ℹ️ Superuser already exists')
    "
else
    echo "❌ Migration failed!"
    exit 1
fi

echo "🎯 Database setup complete!"
