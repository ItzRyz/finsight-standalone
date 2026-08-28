import { createClient } from "@/lib/supabase/client";

export async function uploadReceipt(file: File, userId: string, expenseId?: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${userId}/${expenseId ?? "tmp"}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from("receipts").upload(key, file, { upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadAvatar(file: File, userId: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${userId}/avatar-${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from("avatars").upload(key, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.path);
  return urlData.publicUrl;
}
