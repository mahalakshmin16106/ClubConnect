from django.contrib import admin
from .models import Club, Event, ClubMembership, EventRegistration, Notification

admin.site.register(Club)
admin.site.register(Event)
admin.site.register(ClubMembership)
admin.site.register(EventRegistration)
admin.site.register(Notification)