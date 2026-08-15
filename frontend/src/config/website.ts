import {
  Calendar,
  Users,
  Scissors,
  ShoppingBag,
  MessageSquare,
  BarChart2,
  ClipboardList,
  FileText,
  Shield,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MarqueeItem = { icon: LucideIcon; label: string };
export type StatItem = { value: string; label: string };
export type GalleryPhoto = { src: string; alt: string; label: string };
export type HeroPhoto = { src: string; alt: string };
export type ClientAvatar = { name: string; tag: string; src: string };
export type FeatureItem = { icon: LucideIcon; title: string; desc: string; wide: boolean };
export type RoleItem = { role: string; icon: LucideIcon; inverted: boolean; perks: string[] };

export const LANDING_MARQUEE: MarqueeItem[] = [
  { icon: Calendar, label: "Smart Scheduling" },
  { icon: Users, label: "Client Management" },
  { icon: ClipboardList, label: "Consultation Forms" },
  { icon: ShoppingBag, label: "Products & Orders" },
  { icon: MessageSquare, label: "Real-time Chat" },
  { icon: BarChart2, label: "Reports & Analytics" },
  { icon: FileText, label: "Treatment Plans" },
  { icon: Scissors, label: "Service Catalog" },
];

export const LANDING_STATS: StatItem[] = [
  { value: "8+", label: "Core modules" },
  { value: "3", label: "User roles" },
  { value: "100%", label: "Real-time sync" },
  { value: "1", label: "Unified platform" },
];

// Unsplash photos — beauty/salon context, all shown grayscale via CSS
export const LANDING_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80&auto=format&fit=crop",
    alt: "Modern salon interior",
    label: "Premium experience",
  },
  {
    src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop",
    alt: "Hair care treatment",
    label: "Expert care",
  },
  {
    src: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80&auto=format&fit=crop",
    alt: "Professional staff consultation",
    label: "Trusted professionals",
  },
];

export const LANDING_HERO_PHOTOS: HeroPhoto[] = [
  {
    src: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&q=75&auto=format&fit=crop",
    alt: "Client at salon",
  },
  {
    src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&q=75&auto=format&fit=crop",
    alt: "Salon products",
  },
  {
    src: "https://images.unsplash.com/photo-1581182800629-7d90925ad072?w=300&q=75&auto=format&fit=crop",
    alt: "Beauty treatment",
  },
];

export const LANDING_CLIENT_AVATARS: ClientAvatar[] = [
  {
    name: "Sarah M.",
    tag: "VIP",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=75&auto=format&fit=crop&crop=face",
  },
  {
    name: "James K.",
    tag: "Regular",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=75&auto=format&fit=crop&crop=face",
  },
  {
    name: "Aisha R.",
    tag: "New",
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=75&auto=format&fit=crop&crop=face",
  },
];

export const LANDING_FEATURES: FeatureItem[] = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    desc: "Full calendar view for bookings, reschedules, and real-time status updates across your whole team.",
    wide: true,
  },
  {
    icon: Users,
    title: "Client Profiles",
    desc: "Detailed histories, consultation records, and client journeys all in one place.",
    wide: false,
  },
  {
    icon: ClipboardList,
    title: "Consultation Forms",
    desc: "Build dynamic intake forms with custom fields. Capture responses and attach staff observations.",
    wide: false,
  },
  {
    icon: FileText,
    title: "Treatment Plans",
    desc: "Multi-step templates and client plan assignments with timestamped progress notes.",
    wide: false,
  },
  {
    icon: ShoppingBag,
    title: "Products & Orders",
    desc: "Manage retail inventory, set low stock alerts, and let customers purchase online.",
    wide: false,
  },
  {
    icon: MessageSquare,
    title: "Built-in Chat",
    desc: "Realtime messaging between clients and staff. No third-party tools needed.",
    wide: true,
  },
  {
    icon: BarChart2,
    title: "Reports & Analytics",
    desc: "Revenue trends, staff performance, and product sales — all exportable to CSV.",
    wide: false,
  },
  {
    icon: Scissors,
    title: "Services & Pricing",
    desc: "Organize services by category, add variants, duration modifiers, and manage pricing.",
    wide: false,
  },
];

export const LANDING_ROLES: RoleItem[] = [
  {
    role: "Admin",
    icon: Shield,
    inverted: true,
    perks: [
      "Full access to every screen",
      "Manage staff accounts & roles",
      "Configure services & pricing",
      "View all reports and analytics",
    ],
  },
  {
    role: "Staff",
    icon: Scissors,
    inverted: false,
    perks: [
      "Manage assigned appointments",
      "Fill consultation forms & add notes",
      "Track client treatment progress",
      "Chat with your clients",
    ],
  },
  {
    role: "Customer",
    icon: Star,
    inverted: false,
    perks: [
      "Book and reschedule appointments",
      "Browse and purchase products",
      "View personal treatment plans",
      "Message your assigned staff",
    ],
  },
];
