from rest_framework import serializers
from .models import Survey, Question, Response, Answer
from apps.authentication.serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('id', 'text', 'description', 'type', 'required', 'order', 'options')

class SurveySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    creator = UserSerializer(read_only=True)
    
    class Meta:
        model = Survey
        fields = ('id', 'title', 'description', 'creator', 'status', 'scheduled_date', 
                 'created_at', 'updated_at', 'response_count', 'questions')
        read_only_fields = ('id', 'creator', 'created_at', 'updated_at', 'response_count')

class SurveyCreateSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    
    class Meta:
        model = Survey
        fields = ('title', 'description', 'status', 'scheduled_date', 'questions')
    
    def create(self, validated_data):
        logger.info(f"SurveyCreateSerializer received data: {validated_data}")
        questions_data = validated_data.pop('questions', [])
        logger.info(f"Questions data: {questions_data}")
        survey = Survey.objects.create(**validated_data)
        logger.info(f"Created survey: {survey.id}")
        
        for i, question_data in enumerate(questions_data):
            logger.info(f"Creating question {i+1}: {question_data}")
            Question.objects.create(survey=survey, **question_data)
        
        return survey

class AnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Answer
        fields = ('question_id', 'text_answer', 'choice_answers')

class ResponseSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, write_only=True)
    
    class Meta:
        model = Response
        fields = ('respondent_email', 'answers')
    
    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        response = Response.objects.create(**validated_data)
        
        for answer_data in answers_data:
            question_id = answer_data.pop('question_id')
            Answer.objects.create(
                response=response,
                question_id=question_id,
                **answer_data
            )
        
        # 응답 수 증가
        response.survey.response_count += 1
        response.survey.save()
        
        return response

class ResponseDetailSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    survey = SurveySerializer(read_only=True)
    
    class Meta:
        model = Response
        fields = ('id', 'survey', 'respondent_email', 'submitted_at', 'answers')
