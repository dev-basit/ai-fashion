import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,   // 2 min
      gcTime: 1000 * 60 * 10,     // 10 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const QK = {
  appointments:      (f?: object)      => f ? ["appointments", f] : ["appointments"],
  appointment:       (id: string)      => ["appointments", id],
  appointmentStats:  ()                => ["appointments", "stats"],
  clients:           (s?: string)      => s ? ["clients", s] : ["clients"],
  client:            (id: string)      => ["clients", id],
  clientHistory:     (id: string)      => ["clients", id, "history"],
  clientCounts:      ()                => ["clients", "counts"],
  staff:             (f?: object)      => f ? ["staff", f] : ["staff"],
  staffMember:       (id: string)      => ["staff", id],
  staffSchedule:     (id: string)      => ["staff", id, "schedule"],
  staffLeaves:       (id: string)      => ["staff", id, "leaves"],
  services:          (catId?: string)  => catId ? ["services", catId] : ["services"],
  service:           (id: string)      => ["services", id],
  serviceCategories: ()                => ["services", "categories"],
  products:          (f?: object)      => f ? ["products", f] : ["products"],
  product:           (id: string)      => ["products", id],
  productCategories: ()                => ["products", "categories"],
  orders:            (f?: object)      => f ? ["orders", f] : ["orders"],
  consultation: {
    templates: ()                      => ["consultation", "templates"],
    template:  (id: string)            => ["consultation", "templates", id],
    records:   (f?: object)            => f ? ["consultation", "records", f] : ["consultation", "records"],
    record:    (id: string)            => ["consultation", "records", id],
  },
  treatmentPlans: {
    templates: ()                      => ["treatment-plans", "templates"],
    template:  (id: string)            => ["treatment-plans", "templates", id],
    client:    (f?: object)            => f ? ["treatment-plans", "client", f] : ["treatment-plans", "client"],
    clientById:(id: string)            => ["treatment-plans", "client", id],
  },
  reports:     (type: string, from: string, to: string) => ["reports", type, from, to],
  dashboard:   (f: object)            => ["reports", "dashboard", f],
  settings:    (key?: string)         => key ? ["settings", key] : ["settings"],
  notifications: ()                   => ["notifications"],
  profiles:    ()                     => ["profiles"],
  profile:     (id: string)           => ["profiles", id],
  chatConversations: ()               => ["chat", "conversations"],
  chatMessages: (convId: string)      => ["chat", "messages", convId],
  chatRecipients: ()                  => ["chat", "recipients"],
  aiConversations: ()                 => ["ai", "conversations"],
  aiMessages: (convId: string)        => ["ai", "messages", convId],
} as const;
