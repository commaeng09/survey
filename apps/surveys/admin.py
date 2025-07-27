from django.contrib import admin
from .models import Survey, Question, Response, Answer

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = ('text', 'type', 'required', 'order')

@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ('title', 'creator', 'status', 'response_count', 'created_at')
    list_filter = ('status', 'created_at', 'creator')
    search_fields = ('title', 'description')
    inlines = [QuestionInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('creator')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'survey', 'type', 'required', 'order')
    list_filter = ('type', 'required', 'survey__status')
    search_fields = ('text', 'survey__title')

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    fields = ('question', 'text_answer', 'choice_answers')

@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ('survey', 'respondent_email', 'submitted_at', 'ip_address')
    list_filter = ('submitted_at', 'survey')
    search_fields = ('respondent_email', 'survey__title')
    inlines = [AnswerInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('survey')

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'response', 'text_answer', 'choice_answers')
    list_filter = ('question__type', 'response__submitted_at')
    search_fields = ('text_answer', 'question__text')
