"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateTimeSlots } from "../../../lib/utils/time-slot";
import {
  checkTimeSlotAvailability,
  clientHasBookingAtTime,
  createBooking,
} from "../../_actions/create-booking";
import { toast } from "sonner";
import { COUNTRY_CONFIGS, validateInternationalPhone } from "@/lib/utils/phone-validation";
import { getBarberAvailableDates, AvailabilityResponse } from "@/app/_actions/get-barber-availability";

// In-memory cache for availability data with 5-minute TTL
interface CachedAvailability {
  data: AvailabilityResponse;
  timestamp: number;
}

const availabilityCache = new Map<string, CachedAvailability>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// Generate cache key from barberId and date range
function generateCacheKey(barberId: string, startDate: Date, endDate: Date): string {
  return `${barberId}-${startDate.toISOString()}-${endDate.toISOString()}`;
}

// Check if cached data is still fresh (< 5 minutes old)
function isCacheFresh(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL_MS;
}

interface BookingSheetProps {
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
    barberShopId: string;
    description?: string | null;
  };
  barbers: {
    id: string;
    name: string;
  }[];
  primaryColor?: string;
}

const TIME_SLOTS = generateTimeSlots(9, 19, 30);

export function BookingSheet({ service, barbers, primaryColor = '#000000' }: BookingSheetProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("PT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Fetch availability when barber is selected
  useEffect(() => {
    if (!selectedBarber) {
      setAvailableDates([]);
      return;
    }

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 30);
        
        // Generate cache key
        const cacheKey = generateCacheKey(selectedBarber, today, endDate);
        
        // Check cache first
        const cached = availabilityCache.get(cacheKey);
        if (cached && isCacheFresh(cached.timestamp)) {
          // Use cached data if fresh
          setAvailableDates(cached.data.availableDates);
          return;
        }
        
        // Fetch fresh data if cache miss or stale
        const response = await getBarberAvailableDates({
          barberId: selectedBarber,
          startDate: today,
          endDate: endDate,
          serviceDuration: service.duration,
        });
        
        // Update cache with timestamp
        availabilityCache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
        
        setAvailableDates(response.availableDates);
      } catch (error) {
        console.error("Failed to fetch availability:", error);
        toast.error("Failed to load available dates");
        setAvailableDates([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedBarber, service.duration]);

  // Validation helper: Check all required fields are non-empty (memoized)
  const validateRequiredFields = useCallback((): boolean => {
    if (!date) return false;
    if (!selectedBarber || selectedBarber.trim() === "") return false;
    if (!selectedTime || selectedTime.trim() === "") return false;
    if (!customerName || customerName.trim() === "") return false;
    if (!customerPhone || customerPhone.trim() === "") return false;
    return true;
  }, [date, selectedBarber, selectedTime, customerName, customerPhone]);

  // Validation helper: Check if time is within business hours (9:00 AM - 7:30 PM)
  // This is a pure function with no dependencies, moved outside or use useCallback with empty deps
  const validateBusinessHours = useCallback((time: string): boolean => {
    const [hours, minutes] = time.split(":").map(Number);
    if (hours < 9 || hours >= 19 || (hours === 18 && minutes > 30)) {
      return false;
    }
    return true;
  }, []);

  // Memoized check for submit button disabled state
  const isSubmitDisabled = useMemo(() => 
    !selectedTime || !customerName || isSubmitting,
    [selectedTime, customerName, isSubmitting]
  );

  const handleBookingSubmit = useCallback(async () => {
    // Validation 1: Check all required fields are filled
    if (!validateRequiredFields()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validation 2: Check specific empty fields with detailed messages
    if (!customerName || customerName.trim() === "") {
      toast.error("Please enter your name");
      return;
    }

    if (!customerPhone || customerPhone.trim() === "") {
      toast.error("Please enter your phone number");
      return;
    }

    if (!selectedBarber || selectedBarber.trim() === "") {
      toast.error("Please select a barber");
      return;
    }

    if (!selectedTime || selectedTime.trim() === "") {
      toast.error("Please select a time slot");
      return;
    }

    // Validation 3: Validate international phone number
    const phoneValidation = validateInternationalPhone(customerPhone, selectedCountry);
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }

    // Validation 4: Check business hours
    if (!validateBusinessHours(selectedTime)) {
      toast.error("Please select a time between 9:00 AM and 7:30 PM");
      return;
    }

    setIsSubmitting(true);
    
    // Set up informational toast for long-running operations (>3 seconds)
    const longRunningToastTimeout = setTimeout(() => {
      toast.info("Processing your booking, please wait...");
    }, 3000);
    
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const start = new Date(date!);
      start.setHours(hours, minutes, 0, 0);

      // Check time slot availability
      const availabilityResult = await checkTimeSlotAvailability({
        serviceId: service.id,
        barberId: selectedBarber,
        barberShopId: service.barberShopId,
        startTime: start,
        duration: service.duration,
        customerName,
        customerPhone: phoneValidation.fullNumber!,
        customerCountry: selectedCountry,
      });

      if (availabilityResult.status === 409) {
        toast.error("This time slot is already booked. Please select another time");
        return;
      }

      if (availabilityResult.status === 500) {
        toast.error("Unable to check availability. Please try again");
        return;
      }

      // Check if client has booking at this time
      const clientBookingResult = await clientHasBookingAtTime({
        serviceId: service.id,
        barberId: selectedBarber,
        barberShopId: service.barberShopId,
        startTime: start,
        duration: service.duration,
        customerName,
        customerPhone: phoneValidation.fullNumber!,
        customerCountry: selectedCountry,
      });

      if (clientBookingResult.status === 409) {
        toast.error("You already have a booking at this time. Please choose a different time or cancel your existing booking");
        return;
      }

      if (clientBookingResult.status === 500) {
        toast.error("Unable to verify existing bookings. Please try again");
        return;
      }

      // Create the booking
      const createResult = await createBooking({
        serviceId: service.id,
        barberId: selectedBarber,
        barberShopId: service.barberShopId,
        startTime: start,
        duration: service.duration,
        customerName,
        customerPhone: phoneValidation.fullNumber!,
        customerCountry: selectedCountry,
      });

      if (createResult.status === 200) {
        toast.success("Booking confirmed successfully!");
        // Reset form
        setCustomerName("");
        setCustomerPhone("");
        setSelectedBarber("");
        setSelectedTime("");
        setDate(new Date());
      } else if (createResult.status === 400) {
        toast.error(createResult.message);
      } else if (createResult.status === 409) {
        toast.error("This time slot was just booked by someone else. Please select another time");
      } else if (createResult.status === 500) {
        toast.error("Failed to create booking. Please try again or contact support");
      }
    } finally {
      clearTimeout(longRunningToastTimeout);
      setIsSubmitting(false);
    }
  }, [
    date,
    selectedBarber,
    selectedTime,
    customerName,
    customerPhone,
    selectedCountry,
    service.id,
    service.barberShopId,
    service.duration,
    validateRequiredFields,
    validateBusinessHours,
  ]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button 
          className="px-6 py-2.5 text-white text-sm font-bold rounded-full hover:opacity-80 transition-all active:scale-95 whitespace-nowrap shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          Book
        </button>
      </DrawerTrigger>

      <DrawerContent className="h-[92vh] sm:h-[90vh] bg-white border-t border-slate-200">
        <DrawerHeader className="border-b border-slate-100 pb-6 pt-6 px-6 text-left">
          <div className="max-w-md mx-auto w-full">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 block mb-2">
              Appointment Details
            </span>
            <DrawerTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {service.name}
            </DrawerTitle>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-lg font-bold text-slate-900">
                {Intl.NumberFormat("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                }).format(service.price)}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {service.duration} mins
              </span>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto pb-24 h-full">
          <div className="max-w-md mx-auto space-y-8">

            {/* Section 1: Your Details */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">1. Your Details</h3>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                    Full Name
                  </label>
                  <input
                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium text-slate-900"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                {/* Country + Phone */}
                <div className="grid grid-cols-[110px_1fr] gap-10">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                      Code
                    </label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="px-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-500 text-sm font-medium">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(COUNTRY_CONFIGS).map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.code} ({country.dialCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                      Phone Number
                    </label>
                    <input
                      className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-sm font-medium text-slate-900"
                      placeholder={COUNTRY_CONFIGS[selectedCountry].placeholder}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      maxLength={COUNTRY_CONFIGS[selectedCountry].maxLength}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Select Barber */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">2. Select Barber</h3>
              <Select onValueChange={setSelectedBarber} value={selectedBarber}>
                <SelectTrigger className="w-full h-[52px] px-4 bg-slate-50/50 text-slate-500 border border-slate-200 rounded-2xl text-sm font-medium">
                  <SelectValue placeholder="Choose a professional" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section 3: Date & Time */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">3. Date & Time</h3>
                {isLoadingAvailability ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-sm text-slate-500 font-medium">Loading dates...</p>
                    </div>
                  </div>
                ) : (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-2xl text-slate-100 border-none shadow-none bg-slate-900"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date < today) return true;
                      if (!selectedBarber) return false;
                      const dateStr = date.toISOString().split("T")[0];
                      return !availableDates.some(
                        (availableDate) =>
                          availableDate.toISOString().split("T")[0] === dateStr
                      );
                    }}
                  />
                )}
            

              {/* Time Slots */}
              {date && selectedBarber && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block text-center">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 rounded-2xl font-bold text-sm transition-all border ${
                          selectedTime === time
                            ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                disabled={isSubmitDisabled}
                className={`w-full rounded-2xl font-bold text-base transition-all flex items-center justify-center h-[56px] ${
                  isSubmitDisabled
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "text-white hover:opacity-80 shadow-lg active:scale-[0.98]"
                }`}
                style={!isSubmitDisabled ? { backgroundColor: primaryColor } : {}}
                onClick={handleBookingSubmit}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>

          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
