import django_filters
from .models import Event


class EventFilter(django_filters.FilterSet):
    search   = django_filters.CharFilter(method='filter_search', label='Search')
    category = django_filters.NumberFilter(field_name='category__id', label='Category ID')

    class Meta:
        model  = Event
        fields = ['search', 'category']

    def filter_search(self, queryset, name, value):
        """Case-insensitive search across title and description."""
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value) | Q(description__icontains=value)
        )
