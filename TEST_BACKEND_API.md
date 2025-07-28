# Backend API Testing Guide

## Issues Fixed:

### 1. Survey Update Error
**Problem**: `AssertionError: The .update() method does not support writable nested fields by default.`

**Solution**: Added custom `update()` method to `SurveyCreateSerializer` in `backend/apps/surveys/serializers.py`

```python
def update(self, instance, validated_data):
    logger.info(f"SurveyCreateSerializer update received data: {validated_data}")
    questions_data = validated_data.pop('questions', [])
    
    # Update survey fields
    for attr, value in validated_data.items():
        setattr(instance, attr, value)
    instance.save()
    
    # Handle questions update
    if questions_data:
        # Delete existing questions
        instance.questions.all().delete()
        
        # Create new questions
        for question_data in questions_data:
            logger.info(f"Creating updated question: {question_data}")
            Question.objects.create(survey=instance, **question_data)
    
    return instance
```

### 2. Frontend-Backend Type Mapping
**Problem**: Frontend uses different field names than backend
- Frontend: `short-text`, `long-text`, `multiple-choice`, `title`
- Backend: `text`, `textarea`, `radio`, `text`

**Solution**: Updated frontend types and rendering to handle both:
- Updated `src/types/survey.ts` to include backend types
- Updated `SurveyResponsePage.tsx` to handle both `title` and `text` properties
- Added type mapping in switch cases

## Testing Steps:

### 1. Test Survey Update (Fix for 500 error)
1. Go to http://localhost:5173
2. Login with test credentials
3. Create a survey or edit existing one
4. Try to update title/description and save
5. Should work without 500 error

### 2. Test Survey Response Input (Fix for non-functional inputs)
1. Go to survey response page: http://localhost:5173/survey/{survey-id}
2. Try typing in input fields
3. Try selecting radio buttons/checkboxes
4. Check browser console for debugging logs
5. Should see responses being logged and stored

### 3. Test Backend API Directly
```bash
# Get surveys
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/surveys/

# Update a survey (should work now)
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated Title","description":"Updated Description","questions":[{"text":"New Question","type":"text","required":true,"order":1}]}' \
  http://localhost:8000/api/surveys/{survey-id}/

# Submit response (should work)
curl -X POST -H "Content-Type: application/json" \
  -d '{"respondent_email":"test@example.com","answers":[{"question_id":"QUESTION_UUID","text_answer":"My answer"}]}' \
  http://localhost:8000/api/surveys/{survey-id}/responses/
```

## Current Backend Status:
- ✅ Django server running on http://127.0.0.1:8000/
- ✅ Database: SQLite (production settings)
- ✅ CORS configured for localhost:5173
- ✅ JWT authentication working
- ✅ Survey update serializer fixed
- ✅ Frontend type compatibility added

## Next Steps:
1. Test the survey update functionality
2. Test survey response input functionality  
3. If issues persist, check browser console for detailed error logs
4. Verify API response formats match frontend expectations
