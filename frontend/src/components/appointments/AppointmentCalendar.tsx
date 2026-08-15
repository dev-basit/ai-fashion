"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { APPOINTMENT_CALENDAR_COLORS } from "@/config/colors";
import type { AppointmentCalendarProps } from "@/types/props";
import type { Appointment } from "@/types/database";

export function AppointmentCalendar({ appointments }: AppointmentCalendarProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const events = appointments.map((apt) => {
    const ext = apt as Appointment & {
      profiles?: { full_name?: string };
      services?: { name?: string };
    };
    return {
      id: apt.id,
      title: `${ext.services?.name ?? "Appointment"} — ${ext.profiles?.full_name ?? "Client"}`,
      start: apt.starts_at,
      end: apt.ends_at,
      backgroundColor: APPOINTMENT_CALENDAR_COLORS[apt.status] ?? "#404040",
      borderColor: "transparent",
      textColor: apt.status === "cancelled" || apt.status === "no_show" ? "#737373" : "#ffffff",
    };
  });

  return (
    <div className="rounded-lg border border-border overflow-hidden [&_.fc]:font-sans [&_.fc-toolbar-title]:text-base [&_.fc-toolbar-title]:font-semibold [&_.fc-toolbar]:flex-wrap [&_.fc-toolbar]:gap-y-2 [&_.fc-toolbar-chunk]:flex [&_.fc-toolbar-chunk]:items-center">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin] as any[]}
        initialView={isMobile ? "dayGridMonth" : "timeGridWeek"}
        headerToolbar={
          isMobile
            ? { left: "prev,next", center: "title", right: "today" }
            : { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }
        }
        events={events}
        eventClick={(info: any) => router.push(`/dashboard/appointments/${info.event.id}`)}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator
        businessHours={{ daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: "09:00", endTime: "18:00" }}
      />
    </div>
  );
}
