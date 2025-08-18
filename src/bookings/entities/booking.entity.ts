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

export interface UpdateBookingType {
  uuid: string;
  court_id: number;
  booking_date: Date;
  start_time: Date;
  end_time: Date;
  total_price: number;
  total_hour: number;
}
