import axios from "axios";
import { getBrowserClient } from "./supabase";
import { config } from "@/config/config";

const http = axios.create({
  baseURL: config.app.backend_url,
  headers: { "Content-Type": "application/json" },
  timeout: 4000, // fail fast when offline so offline-queue kicks in quickly
});

http.interceptors.request.use(async (config) => {
  const supabase = getBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default http;
