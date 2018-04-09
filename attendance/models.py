from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# Create your models here.
class Attendance(models.Model):
    activity = models.ForeignKey(ContentType)
    id_of_activity = models.PositiveIntegerField()
    attendees = models.ManyToManyField(User, related_name='attendees')
    #organiser = models.ForeignKey(User, related_name='organiser')
    activity_object = GenericForeignKey('activity', 'id_of_activity')

    class Meta:
        unique_together = ('activity', 'id_of_activity')

    def is_attendee(self, user):
        return user in self.attendees.all()
