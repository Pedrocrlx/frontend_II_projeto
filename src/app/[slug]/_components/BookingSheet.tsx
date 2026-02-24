"use client";

import { useState } from "react";
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
}

const TIME_SLOTS = generateTimeSlots(9, 19, 30);

export function BookingSheet({ service, barbers }: BookingSheetProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation helper: Check all required fields are non-empty
  const validateRequiredFields = (): boolean => {
    if (!date) return false;
    if (!selectedBarber || selectedBarber.trim() === "") return false;
    if (!selectedTime || selectedTime.trim() === "") return false;
    if (!customerName || customerName.trim() === "") return false;
    if (!customerPhone || customerPhone.trim() === "") return false;
    return true;
  };

  // Validation helper: Check phone matches Portuguese format
  const validatePhoneFormat = (phone: string): boolean => {
    const phoneRegex = /^\+351[1-9][0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  // Validation helper: Check if time is within business hours (9:00 AM - 7:30 PM)
  const validateBusinessHours = (time: string): boolean => {
    const [hours, minutes] = time.split(":").map(Number);
    if (hours < 9 || hours >= 19 || (hours === 18 && minutes > 30)) {
      return false;
    }
    return true;
  };

  const handleBookingSubmit = async () => {
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

    // Validation 3: Check phone format
    if (!validatePhoneFormat(customerPhone)) {
      toast.error("Please enter a valid phone number (format: +351 912345678)");
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
        customerPhone,
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
        customerPhone,
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
        customerPhone,
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
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm">Agendar</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh] ">
        <DrawerHeader>
          <DrawerTitle>Agendar {service.name}</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-bold">Nome</label>
            <input
              className="w-full p-2 border rounded-md"
              placeholder="Seu nome"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Telefone</label>
            <input
              className="w-full p-2 border rounded-md"
              placeholder="+351 912-345-678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Profissional</label>
            <Select onValueChange={setSelectedBarber}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um barbeiro" />
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

          <div className="flex flex-col items-center">
            <Calendar mode="single" selected={date} onSelect={setDate} />
          </div>

          {date && selectedBarber && (
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          )}

          <Button
            disabled={!selectedTime || !customerName || isSubmitting}
            className="w-full mt-4"
            onClick={handleBookingSubmit}
          >
            {isSubmitting ? "A enviar..." : "Confirmar"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
