from yaksh.models import Quiz, Question, AnswerPaper

from rest_framework import serializers

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'description']

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'description', 'summary', 'points', 'type', 'language']

class AnswerPaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerPaper
        fields = ['id', 'question_paper', 'attempt_number' ,'percent', 'status']
