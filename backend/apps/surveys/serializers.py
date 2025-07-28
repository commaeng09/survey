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

class AnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.UUIDField(write_only=True)
    answer = serializers.CharField(write_only=True)  # 프론트엔드에서 보내는 형식
    
    class Meta:
        model = Answer
        fields = ('question_id', 'answer', 'text_answer', 'choice_answers')
        extra_kwargs = {
            'text_answer': {'read_only': True},
            'choice_answers': {'read_only': True},
        }
    
    def validate(self, attrs):
        """answer 필드를 적절한 필드로 변환"""
        answer = attrs.pop('answer', '')
        
        # JSON 문자열인지 확인해서 choice_answers 또는 text_answer로 분류
        try:
            import json
            parsed_answer = json.loads(answer)
            if isinstance(parsed_answer, list):
                attrs['choice_answers'] = parsed_answer
                attrs['text_answer'] = ''
            else:
                attrs['text_answer'] = str(parsed_answer)
                attrs['choice_answers'] = []
        except (json.JSONDecodeError, TypeError):
            # JSON이 아니면 텍스트 답변으로 처리
            attrs['text_answer'] = str(answer)
            attrs['choice_answers'] = []
        
        return attrs

class ResponseSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, write_only=True)
    respondent_name = serializers.CharField(required=False, write_only=True)  # 프론트엔드 호환성을 위한 필드
    
    class Meta:
        model = Response
        fields = ('respondent_email', 'respondent_name', 'answers')
    
    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        # respondent_name은 데이터베이스에 저장하지 않고 제거
        validated_data.pop('respondent_name', None)
        
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
