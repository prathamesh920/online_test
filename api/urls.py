from django.conf.urls import url

from api import views

urlpatterns = [
    url(r'^quizzes/$', views.get_quizzes, name='get_quizzes'),
    url(r'^questions/(?P<quiz_id>\d+)/$', views.get_questions, name='get_questions'),
    url(r'^get_question/(?P<question_id>\d+)/$', views.get_question, name='get_question'),
    url(r'^check_answer/$', views.check_answer, name='check_answer'),
    url(r'^results/$', views.get_result, name='get_result'),
]
