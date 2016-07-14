from django.shortcuts import render, get_object_or_404

from yaksh.models import Quiz, Question, QuestionPaper, AnswerPaper, Answer, TestCase
from yaksh.views import validate_answer, get_user_dir
from api.serializers import QuizSerializer, QuestionSerializer, AnswerPaperSerializer

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
# Create your views here.


@api_view(['GET'])
def get_quizzes(request):
    if request.method == 'GET':
        quizzes = Quiz.objects.filter(active=True)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)
    return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_questions(request, quiz_id):
    if request.method == 'GET':
        user = request.user
        quiz = Quiz.objects.get(pk=quiz_id)
        question_paper = QuestionPaper.objects.get(quiz=quiz)
        questions = question_paper.fixed_questions
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)
    return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_question(request, question_id):
    if request.method == 'GET':
        try:
            question = Question.objects.get(pk=question_id)
        except Question.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        data = {}
        if question.type == 'mcq' or question.type == 'mcc':
            options = _get_options(question)
            data['options'] = options
        serializer = QuestionSerializer(question)
        data.update(serializer.data)
        return Response(data)
    return Response(status=status.HTTP_404_NOT_FOUND)

def _get_options(question):
    options = []
    testcases = question.get_test_cases()
    for testcase in testcases:
        options.append(testcase.options)
    return options


@api_view(['GET'])
def get_result(request):
    if request.method == 'GET':
        user = request.user
        answer_papers = AnswerPaper.objects.filter(user=user)
        serializer = AnswerPaperSerializer(answer_papers, many=True)
        return Response(serializer.data)
    return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def check_answer(request):
    if request.method == 'POST':
        user = request.user
        question_paper_id = request.data.get('qp_id')
        question_id = request.data.get('question')
        answer = request.data.get('answer')
        question_paper = QuestionPaper.objects.get(pk=question_paper_id)
        question = Question.objects.get(pk=question_id)
        message = 'checking...'
        complete = False
        quiz_complete = False
        create_new_answerpaper = False

        answer_paper = AnswerPaper.objects.get_user_last_attempt(question_paper, user)
        if not answer_paper:
            #create answerpaper with attempt number 1
            create_new_answerpaper = True
            attempt_number = 1
        elif not answer_paper.is_attempt_inprogress():
            #create answerpaper with attempt number + 1
            create_new_answerpaper = True
            attempt_number = answer_paper.attempt_number + 1
        if create_new_answerpaper:
            ip = request.META['REMOTE_ADDR']
            answer_paper = question_paper.make_answerpaper(user, ip, attempt_number)
            # Make user directory.
            user_dir = get_user_dir(user)
        if question in answer_paper.questions_answered.all():
            message = 'Already answered!'
            complete = True
        else:
            new_answer = Answer(question=question, answer=answer,
                                correct=False)
            new_answer.save()
            answer_paper.answers.add(new_answer)
            test_cases = TestCase.objects.filter(question=question)
            json_data = question.consolidate_answer_data(answer) if question.type == 'code' else None
            if question.type == 'mcc':
                answer = answer.split(',')
            correct, result = validate_answer(user, answer, question, json_data)
            if correct:
                new_answer.correct = correct
                new_answer.marks = question.points
            new_answer.error = result.get('error')
            new_answer.save()
            answer_paper.update_marks('inprogress')
            if not result.get('success'):
                message = result.get('error')
                complete = False
            else:
                message = "Answer Accepted"
                answer_paper.completed_question(question_id)
                complete = True
        if answer_paper.questions_left() == 0 or answer_paper.time_left == 0:
            answer_paper.update_marks('completed')
            quiz_complete = True
        data = {'question_id': question_id, 'message': message, 'complete': complete, 'quiz_complete': quiz_complete}
        return Response(data)

