"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { DashboardManagementLayout } from "../_components/DashboardManagementLayout";
import {
  getShopWithBookings,
  confirmBooking,
  cancelBooking,
  deleteBooking,
  type BookingWithDetails,
} from "@/app/_actions/dashboard-bookings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
} from "date-fns";

// --- Icons ---
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

type ViewMode = "calendar" | "list";
type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELED";

interface Barber {
  id: string;
  name: string;
  imageUrl: string | null;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  // State
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] =
    useState<BookingWithDetails | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Fetch bookings for the current month
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);

      const result = await getShopWithBookings(user.id, {
        startDate: monthStart,
        endDate: monthEnd,
      });

      if (result) {
        setBarbers(result.barbers);
        setBookings(result.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(t.dashboard.bookings.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedDate, t.dashboard.bookings.loadError]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Filter by barber
      if (selectedBarber !== "all" && booking.barber.id !== selectedBarber) {
        return false;
      }
      // Filter by status
      if (
        selectedStatus !== "all" &&
        booking.status !== selectedStatus
      ) {
        return false;
      }
      return true;
    });
  }, [bookings, selectedBarber, selectedStatus]);

  // Bookings for selected date (calendar view)
  const bookingsForSelectedDate = useMemo(() => {
    return filteredBookings.filter((booking) =>
      isSameDay(new Date(booking.startTime), selectedDate)
    );
  }, [filteredBookings, selectedDate]);

  // Dates with bookings (for calendar highlighting)
  const datesWithBookings = useMemo(() => {
    const dates = new Set<string>();
    filteredBookings.forEach((booking) => {
      dates.add(format(new Date(booking.startTime), "yyyy-MM-dd"));
    });
    return dates;
  }, [filteredBookings]);

  // Handlers
  const handleConfirmBooking = async (bookingId: string) => {
    if (!confirm(t.dashboard.bookings.confirmBookingMessage)) return;

    setIsProcessing(true);
    try {
      const result = await confirmBooking(bookingId);
      if (result.error) throw new Error(result.error);
      toast.success(t.dashboard.bookings.successConfirmed);
      fetchBookings();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Confirm error:", error);
      toast.error(t.dashboard.bookings.errorConfirm);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(t.dashboard.bookings.cancelBookingMessage)) return;

    setIsProcessing(true);
    try {
      const result = await cancelBooking(bookingId);
      if (result.error) throw new Error(result.error);
      toast.success(t.dashboard.bookings.successCanceled);
      fetchBookings();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error(t.dashboard.bookings.errorCancel);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm(t.dashboard.bookings.deleteBookingMessage)) return;

    setIsProcessing(true);
    try {
      const result = await deleteBooking(bookingId);
      if (result.error) throw new Error(result.error);
      toast.success(t.dashboard.bookings.successDeleted);
      fetchBookings();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t.dashboard.bookings.errorDelete);
    } finally {
      setIsProcessing(false);
    }
  };

  const openBookingDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  const getStatusBadge = (status: BookingStatus) => {
    const styles = {
      PENDING:
        "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      CONFIRMED:
        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      CANCELED:
        "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    };

    const labels = {
      PENDING: t.dashboard.bookings.statusPending,
      CONFIRMED: t.dashboard.bookings.statusConfirmed,
      CANCELED: t.dashboard.bookings.statusCanceled,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardManagementLayout
      title={t.dashboard.bookings.title}
      subtitle={t.dashboard.bookings.subtitle}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* View Toggle - full width on mobile */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden xs:inline">{t.dashboard.bookings.calendarView}</span>
              <span className="xs:hidden">Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <ListIcon className="w-4 h-4" />
              <span className="hidden xs:inline">{t.dashboard.bookings.listView}</span>
              <span className="xs:hidden">List</span>
            </button>
          </div>

          {/* Filters - stacked on mobile, row on larger screens */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                <SelectValue placeholder={t.dashboard.bookings.filterByBarber} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.dashboard.bookings.allBarbers}</SelectItem>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[160px] rounded-xl">
                <SelectValue placeholder={t.dashboard.bookings.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.dashboard.bookings.allStatuses}</SelectItem>
                <SelectItem value="PENDING">{t.dashboard.bookings.statusPending}</SelectItem>
                <SelectItem value="CONFIRMED">{t.dashboard.bookings.statusConfirmed}</SelectItem>
                <SelectItem value="CANCELED">{t.dashboard.bookings.statusCanceled}</SelectItem>
              </SelectContent>
            </Select>

            {viewMode === "calendar" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
                className="w-full sm:w-auto rounded-xl font-bold"
              >
                {t.dashboard.bookings.today}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-auto lg:shrink-0 h-80 lg:h-auto rounded-2xl bg-slate-50 dark:bg-slate-900/40 animate-pulse border border-slate-100 dark:border-slate-800" />
            <div className="flex-1 h-80 rounded-2xl bg-slate-50 dark:bg-slate-900/40 animate-pulse border border-slate-100 dark:border-slate-800" />
          </div>
        ) : viewMode === "calendar" ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Calendar - fixed width, doesn't grow */}
            <div className="w-full lg:w-auto lg:shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm self-start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                onMonthChange={(month) => setSelectedDate(month)}
                modifiers={{
                  hasBookings: (date) =>
                    datesWithBookings.has(format(date, "yyyy-MM-dd")),
                }}
                modifiersStyles={{
                  hasBookings: {
                    fontWeight: "bold",
                    textDecoration: "underline",
                    textDecorationColor: "rgb(59, 130, 246)",
                    textUnderlineOffset: "4px",
                  },
                }}
                className="rounded-xl w-full lg:w-auto"
              />
            </div>

            {/* Bookings for selected date - takes remaining space */}
            <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>

              {bookingsForSelectedDate.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
                    {t.dashboard.bookings.noBookingsForDate}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] lg:max-h-[500px] overflow-y-auto">
                  {bookingsForSelectedDate
                    .sort(
                      (a, b) =>
                        new Date(a.startTime).getTime() -
                        new Date(b.startTime).getTime()
                    )
                    .map((booking) => (
                      <button
                        type="button"
                        key={booking.id}
                        onClick={() => openBookingDetails(booking)}
                        className="w-full text-left p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all bg-slate-50 dark:bg-slate-800/50 group"
                      >
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {format(new Date(booking.startTime), "HH:mm")}
                              </span>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="font-semibold text-slate-900 dark:text-slate-50 truncate text-sm sm:text-base">
                              {booking.customerName}
                            </p>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                              {booking.service.name} • {booking.barber.name}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">
                              ${booking.service.price}
                            </p>
                            <p className="text-xs text-slate-400">
                              {booking.service.duration} {t.dashboard.bookings.minutes}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // List View
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
                  {t.dashboard.bookings.noBookings}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBookings
                  .sort(
                    (a, b) =>
                      new Date(a.startTime).getTime() -
                      new Date(b.startTime).getTime()
                  )
                  .map((booking) => (
                    <button
                      type="button"
                      key={booking.id}
                      onClick={() => openBookingDetails(booking)}
                      className="w-full text-left p-3 sm:p-4 lg:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Top row: Avatar + Name + Status */}
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {booking.barber.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={booking.barber.imageUrl}
                                alt={booking.barber.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getInitials(booking.barber.name)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                              <p className="font-bold text-slate-900 dark:text-slate-50 text-sm sm:text-base truncate">
                                {booking.customerName}
                              </p>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                              {booking.service.name} • {booking.barber.name}
                            </p>
                          </div>
                        </div>

                        {/* Bottom row: Booking details */}
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 text-sm pl-0 sm:pl-14">
                          <div>
                            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                              {t.dashboard.bookings.bookedAt}
                            </p>
                            <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                              {format(new Date(booking.startTime), "MMM d, HH:mm")}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                              {t.dashboard.bookings.duration}
                            </p>
                            <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                              {booking.service.duration} {t.dashboard.bookings.minutes}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider mb-0.5">
                              {t.dashboard.bookings.price}
                            </p>
                            <p className="font-bold text-slate-900 dark:text-slate-50 text-xs sm:text-sm">
                              ${booking.service.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="sm:max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-black">
              {t.dashboard.bookings.viewDetails}
            </DrawerTitle>
            <DrawerDescription className="font-medium">
              {selectedBooking &&
                format(new Date(selectedBooking.startTime), "EEEE, MMMM d, yyyy")}
            </DrawerDescription>
          </DrawerHeader>

          {selectedBooking && (
            <div className="p-6 pt-0 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {t.dashboard.bookings.status}
                </span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
                <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-bold text-blue-900 dark:text-blue-100">
                    {format(new Date(selectedBooking.startTime), "HH:mm")} -{" "}
                    {format(new Date(selectedBooking.endTime), "HH:mm")}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {selectedBooking.service.duration} {t.dashboard.bookings.minutes}
                  </p>
                </div>
              </div>

              {/* Customer */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.dashboard.bookings.customer}
                </p>
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-slate-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {selectedBooking.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-slate-400" />
                  <a
                    href={`tel:${selectedBooking.customerPhone}`}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {selectedBooking.customerPhone}
                  </a>
                </div>
              </div>

              {/* Service & Barber */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.dashboard.bookings.service}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-slate-50">
                    {selectedBooking.service.name}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    ${selectedBooking.service.price}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.dashboard.bookings.barber}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-slate-50">
                    {selectedBooking.barber.name}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <DrawerFooter className="px-0 pt-4 gap-2">
                {selectedBooking.status === "PENDING" && (
                  <Button
                    onClick={() => handleConfirmBooking(selectedBooking.id)}
                    disabled={isProcessing}
                    className="w-full font-bold h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {t.dashboard.bookings.confirm}
                  </Button>
                )}

                {selectedBooking.status !== "CANCELED" && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    disabled={isProcessing}
                    className="w-full font-bold h-12 rounded-xl border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    {t.dashboard.bookings.cancel}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => handleDeleteBooking(selectedBooking.id)}
                  disabled={isProcessing}
                  className="w-full font-bold h-12 rounded-xl border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {t.dashboard.bookings.delete}
                </Button>

                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full font-bold h-12 rounded-xl"
                  >
                    {t.dashboard.bookings.close}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </DashboardManagementLayout>
  );
}
