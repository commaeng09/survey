from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class Survey(models.Model):
    STATUS_CHOICES = [
        ('draft', '임시저장'),
        ('active', '진행중'),
        ('completed', '완료'),
        ('scheduled', '예약됨'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='surveys', verbose_name='생성자')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='상태')
    scheduled_date = models.DateTimeField(null=True, blank=True, verbose_name='예약일시')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일')
    response_count = models.IntegerField(default=0, verbose_name='응답수')
    
    class Meta:
        db_table = 'surveys'
        ordering = ['-created_at']
        verbose_name = '설문조사'
        verbose_name_plural = '설문조사들'
    
    def __str__(self):
        return self.title
    
    @property
    def is_active(self):
        """설문이 활성 상태인지 확인"""
        if self.status == 'scheduled' and self.scheduled_date:
            return timezone.now() >= self.scheduled_date
        return self.status == 'active'


class Question(models.Model):
    QUESTION_TYPES = [
        ('text', '단답형'),
        ('textarea', '장문형'),
        ('radio', '객관식(단일선택)'),
        ('checkbox', '객관식(다중선택)'),
        ('dropdown', '드롭다운'),
        ('rating', '평점'),
        ('date', '날짜'),
        ('time', '시간'),
        ('email', '이메일'),
        ('phone', '전화번호'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions', verbose_name='설문조사')
    text = models.CharField(max_length=500, verbose_name='질문')
    description = models.TextField(blank=True, verbose_name='질문 설명')
    type = models.CharField(max_length=20, choices=QUESTION_TYPES, verbose_name='질문 유형')
    required = models.BooleanField(default=False, verbose_name='필수 여부')
    order = models.IntegerField(verbose_name='순서')
    options = models.JSONField(default=list, blank=True, verbose_name='선택지')
    
    class Meta:
        db_table = 'questions'
        ordering = ['order']
        verbose_name = '질문'
        verbose_name_plural = '질문들'
        unique_together = ['survey', 'order']
    
    def __str__(self):
        return f"{self.survey.title} - {self.text[:50]}"


class Response(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses', verbose_name='설문조사')
    respondent_email = models.EmailField(blank=True, verbose_name='응답자 이메일')
    submitted_at = models.DateTimeField(auto_now_add=True, verbose_name='제출일시')
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='IP 주소')
    
    class Meta:
        db_table = 'responses'
        ordering = ['-submitted_at']
        verbose_name = '응답'
        verbose_name_plural = '응답들'
    
    def __str__(self):
        return f"{self.survey.title} - {self.submitted_at.strftime('%Y-%m-%d %H:%M')}"


class Answer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name='answers', verbose_name='응답')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers', verbose_name='질문')
    text_answer = models.TextField(blank=True, verbose_name='텍스트 답변')
    choice_answers = models.JSONField(default=list, blank=True, verbose_name='선택 답변')
    
    class Meta:
        db_table = 'answers'
        verbose_name = '답변'
        verbose_name_plural = '답변들'
        unique_together = ['response', 'question']
    
    def __str__(self):
        return f"{self.question.text[:30]} - {self.text_answer[:30] if self.text_answer else self.choice_answers}"
