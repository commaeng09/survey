from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from .models import Survey, Question, Response as SurveyResponse
from .serializers import (
    SurveySerializer, 
    SurveyCreateSerializer, 
    QuestionSerializer, 
    ResponseSerializer,
    ResponseDetailSerializer
)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """헬스체크 엔드포인트 - 인증 불필요"""
    return Response({'status': 'healthy', 'message': 'Survey API is running'})

class SurveyViewSet(viewsets.ModelViewSet):
    """설문조사 CRUD API"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Survey.objects.filter(creator=self.request.user)
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SurveyCreateSerializer
        return SurveySerializer
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """설문조사 복제"""
        survey = self.get_object()
        
        # 새 설문조사 생성
        new_survey = Survey.objects.create(
            title=f"{survey.title} (복사본)",
            description=survey.description,
            creator=request.user,
            status='draft'
        )
        
        # 질문들 복제
        for question in survey.questions.all():
            Question.objects.create(
                survey=new_survey,
                text=question.text,
                description=question.description,
                type=question.type,
                required=question.required,
                order=question.order,
                options=question.options
            )
        
        return Response(
            SurveySerializer(new_survey).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """설문조사 분석 데이터"""
        survey = self.get_object()
        
        # 기본 통계
        total_responses = survey.responses.count()
        
        # 질문별 응답 분석
        questions_analytics = []
        for question in survey.questions.all():
            question_data = {
                'question': QuestionSerializer(question).data,
                'total_answers': question.answers.count(),
                'answer_distribution': {}
            }
            
            if question.type in ['radio', 'dropdown']:
                # 단일 선택 질문 분석
                for option in question.options:
                    count = question.answers.filter(
                        choice_answers__contains=[option]
                    ).count()
                    question_data['answer_distribution'][option] = count
            
            elif question.type == 'checkbox':
                # 다중 선택 질문 분석
                for option in question.options:
                    count = question.answers.filter(
                        choice_answers__contains=option
                    ).count()
                    question_data['answer_distribution'][option] = count
            
            questions_analytics.append(question_data)
        
        return Response({
            'survey': SurveySerializer(survey).data,
            'total_responses': total_responses,
            'questions_analytics': questions_analytics
        })

@api_view(['GET'])
@permission_classes([AllowAny])
def survey_public_view(request, survey_id):
    """공개 설문조사 조회 (응답용)"""
    survey = get_object_or_404(Survey, id=survey_id)
    
    if not survey.is_active:
        return Response({
            'error': '현재 진행중이지 않은 설문조사입니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(SurveySerializer(survey).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_response(request, survey_id):
    """설문조사 응답 제출"""
    survey = get_object_or_404(Survey, id=survey_id)
    
    if not survey.is_active:
        return Response({
            'error': '현재 진행중이지 않은 설문조사입니다.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # IP 주소 추가
    request.data['survey'] = survey.id
    
    serializer = ResponseSerializer(data=request.data)
    if serializer.is_valid():
        response = serializer.save(
            survey=survey,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        return Response({
            'message': '응답이 성공적으로 제출되었습니다.',
            'response_id': response.id
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def survey_responses(request, survey_id):
    """설문조사 응답 목록 조회"""
    survey = get_object_or_404(Survey, id=survey_id, creator=request.user)
    responses = survey.responses.all()
    
    serializer = ResponseDetailSerializer(responses, many=True)
    return Response(serializer.data)
