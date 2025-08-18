export interface AvailableSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface AvailabilityResponse {
  date: string;
  court: string;
  available_slots: AvailableSlot[];
}