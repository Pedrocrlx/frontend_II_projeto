"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateTimeSlots } from "../../../lib/utils/time-slot";
import { createBooking } from "../../_actions/create-booking";

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

  const handleBookingSubmit = async () => {
    if (!date || !selectedBarber || !selectedTime || !customerName || !customerPhone) return;

    setIsSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const start = new Date(date);
      start.setHours(hours, minutes, 0, 0);

      const result = await createBooking({
        serviceId: service.id,
        barberId: selectedBarber,
        barberShopId: service.barberShopId,
        startTime: start,
        duration: service.duration,
        customerName,
        customerPhone,
      });

      if (result.success) {
        alert("Booking confirmed!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button size="sm">Agendar</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
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
              placeholder="Seu telefone"
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
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
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
            {isSubmitting ? "Enviando..." : "Confirmar"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}