'use client';

import { motion } from 'framer-motion';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

interface CalendlyEvent {
  uri: string;
  name: string;
  start_time: string;
  end_time: string;
  location: {
    type: string;
    location: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  available_spots: number;
}

interface WorkshopCardProps {
  event: CalendlyEvent;
  onRegister: (eventUri: string) => void;
}

export default function WorkshopCard({ event, onRegister }: WorkshopCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const getLocationDisplay = () => {
    if (event.location.type === 'google_calendar') {
      return 'Google Meet';
    }
    if (event.location.type === 'zoom') {
      return 'Zoom Meeting';
    }
    return event.location.location || 'Online';
  };

  const isFull = event.available_spots <= 0;
  const isLowSpots = event.available_spots <= 3 && event.available_spots > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-silver-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-navy-900">{event.name}</h3>
          {isLowSpots && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Only {event.available_spots} spots left
            </span>
          )}
          {isFull && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Full
            </span>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-navy-600">
            <CalendarIcon className="w-5 h-5 mr-3 text-emerald-600" />
            <span>{formatDate(event.start_time)}</span>
          </div>

          <div className="flex items-center text-navy-600">
            <ClockIcon className="w-5 h-5 mr-3 text-emerald-600" />
            <span>
              {formatTime(event.start_time)} - {formatTime(event.end_time)}
            </span>
          </div>

          <div className="flex items-center text-navy-600">
            <MapPinIcon className="w-5 h-5 mr-3 text-emerald-600" />
            <span>{getLocationDisplay()}</span>
          </div>

          <div className="flex items-center text-navy-600">
            <UsersIcon className="w-5 h-5 mr-3 text-emerald-600" />
            <span>
              {event.invitees_counter.active} of {event.invitees_counter.limit} registered
            </span>
          </div>
        </div>

        <button
          onClick={() => onRegister(event.uri)}
          disabled={isFull}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
            isFull
              ? 'bg-silver-200 text-silver-600 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
          }`}
        >
          {isFull ? 'Workshop Full' : 'Reserve My Seat'}
        </button>
      </div>
    </motion.div>
  );
} 