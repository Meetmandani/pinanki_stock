import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ycoikgjqvqkaofdfxcrh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inljb2lrZ2pxdnFrYW9mZGZ4Y3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNzg5MzYsImV4cCI6MjA5NDY1NDkzNn0.9ChsyPVGwhe9X88mqWeySB0GTUPEgqDSgXWmKId3kdQ";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);