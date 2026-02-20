export function generateTimeSlots(startHour: number, endHour: number, intervalMinutes: number = 30): string[] {
  const slots: string[] = [];
  
  let current = new Date();
  current.setHours(startHour, 0, 0, 0);
  
  const end = new Date();
  end.setHours(endHour, 0, 0, 0);

  while (current < end) {
    slots.push(current.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return slots;
}