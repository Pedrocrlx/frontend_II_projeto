"use client";

import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Barber, Service } from "@/services/barberService";

interface BookingSheetProps {
  service: Service;
  barbers: Barber[];
}

export function BookingSheet({ service, barbers }: BookingSheetProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>("");

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="bg-[var(--primary-tenant)] hover:opacity-90">Agendar</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Agendar {service.name}</DrawerTitle>
        </DrawerHeader>
        
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-bold">Escolha o profissional:</label>
            <Select onValueChange={setSelectedBarber}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um barbeiro" />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex flex-col items-center">
             <label className="text-sm font-bold self-start">Escolha a data:</label>
             <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow"
            />
          </div>

          <Button 
            disabled={!date || !selectedBarber}
            className="w-full bg-[var(--primary-tenant)]"
          >
            Confirmar Agendamento
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}