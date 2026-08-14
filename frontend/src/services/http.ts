import axios from "axios";
import { getBrowserClient } from "./supabase";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
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
