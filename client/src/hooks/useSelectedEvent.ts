import { useCallback, useEffect, useState } from 'react';
import { listEvents } from '@/api/events';
import { ApiError } from '@/lib/api';
import type { Event } from '@/types/api';

const SELECTED_EVENT_KEY = 'everafter_selected_event_id';

export function useSelectedEvent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventIdState] = useState<string | null>(() =>
    localStorage.getItem(SELECTED_EVENT_KEY),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEvents();
      setEvents(data);

      const stored = localStorage.getItem(SELECTED_EVENT_KEY);
      const validStored = stored && data.some((e) => e.id === stored);

      if (validStored) {
        setEventIdState(stored);
      } else if (data.length > 0) {
        setEventIdState(data[0].id);
        localStorage.setItem(SELECTED_EVENT_KEY, data[0].id);
      } else {
        setEventIdState(null);
        localStorage.removeItem(SELECTED_EVENT_KEY);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 401
            ? 'Please sign in to view your events.'
            : err.message
          : 'Failed to load events.';
      setError(message);
      setEvents([]);
      setEventIdState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const selectEvent = useCallback((id: string) => {
    setEventIdState(id);
    localStorage.setItem(SELECTED_EVENT_KEY, id);
  }, []);

  const selectedEvent = events.find((e) => e.id === eventId) ?? null;

  return {
    events,
    eventId,
    selectedEvent,
    selectEvent,
    loading,
    error,
    reload: loadEvents,
  };
}
