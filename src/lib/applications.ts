import { createClient } from "@supabase/supabase-js";
import type { HelpRequest, RequestCategory } from "../data/requests";

export type ApplicationStatus = "new" | "published" | "rejected";

export type ApplicationRecord = {
  id: string;
  created_at?: string;
  status: ApplicationStatus;
  full_name: string;
  birth_date: string;
  city: string;
  family_status: string;
  dependents: number;
  telegram: string;
  contact_time: string;
  category: RequestCategory;
  creditor: string;
  contract_number: string;
  contract_date: string;
  debt_reason: string;
  target_amount: number;
  urgency: HelpRequest["urgency"];
  deadline: string;
  story: string;
  recipient_name: string;
  bank: string;
  card: string;
  sbp_phone: string;
  documents: string[];
  admin_note?: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const LOCAL_APPLICATIONS_KEY = "100spasibo:applications";

export const isBackendConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const supabase = isBackendConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

function readLocalApplications() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_APPLICATIONS_KEY) ?? "[]") as ApplicationRecord[];
  } catch {
    return [];
  }
}

function writeLocalApplications(items: ApplicationRecord[]) {
  window.localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(items));
}

function getFormText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getFormNumber(formData: FormData, key: string) {
  const raw = getFormText(formData, key).replace(/[^\d]/g, "");
  return raw ? Number(raw) : 0;
}

function getDocumentNames(formData: FormData) {
  return formData
    .getAll("documents")
    .filter((item): item is File => item instanceof File && item.size > 0)
    .map((file) => file.name);
}

export function buildApplicationPayload(form: HTMLFormElement): Omit<ApplicationRecord, "id" | "created_at"> {
  const formData = new FormData(form);
  return {
    status: "new",
    full_name: getFormText(formData, "full_name"),
    birth_date: getFormText(formData, "birth_date"),
    city: getFormText(formData, "city"),
    family_status: getFormText(formData, "family_status"),
    dependents: getFormNumber(formData, "dependents"),
    telegram: getFormText(formData, "telegram"),
    contact_time: getFormText(formData, "contact_time"),
    category: getFormText(formData, "category") as RequestCategory,
    creditor: getFormText(formData, "creditor"),
    contract_number: getFormText(formData, "contract_number"),
    contract_date: getFormText(formData, "contract_date"),
    debt_reason: getFormText(formData, "debt_reason"),
    target_amount: getFormNumber(formData, "target_amount"),
    urgency: getFormText(formData, "urgency") as HelpRequest["urgency"],
    deadline: getFormText(formData, "deadline"),
    story: getFormText(formData, "story"),
    recipient_name: getFormText(formData, "recipient_name"),
    bank: getFormText(formData, "bank"),
    card: getFormText(formData, "card"),
    sbp_phone: getFormText(formData, "sbp_phone"),
    documents: getDocumentNames(formData),
  };
}

export async function createApplication(form: HTMLFormElement) {
  const payload = buildApplicationPayload(form);

  if (!supabase) {
    const localRecord: ApplicationRecord = {
      ...payload,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    writeLocalApplications([localRecord, ...readLocalApplications()]);
    return localRecord;
  }

  const { data, error } = await supabase
    .from("applications")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as ApplicationRecord;
}

export async function listApplications(status?: ApplicationStatus) {
  if (!supabase) {
    const items = readLocalApplications();
    return status ? items.filter((item) => item.status === status) : items;
  }

  let query = supabase.from("applications").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ApplicationRecord[];
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  if (!supabase) {
    const updated = readLocalApplications().map((item) => (item.id === id ? { ...item, status } : item));
    writeLocalApplications(updated);
    return updated.find((item) => item.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as ApplicationRecord;
}

function getPublicName(fullName: string) {
  return fullName.trim().split(/\s+/)[1] ?? fullName.trim().split(/\s+/)[0] ?? "Заявка";
}

function getAgeFromDate(value: string) {
  if (!value) return 30;
  const [day, month, year] = value.split(".").map(Number);
  const birthDate = new Date(year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) return 30;
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday = now.getMonth() < birthDate.getMonth() || (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(18, age);
}

export function applicationToRequest(application: ApplicationRecord): HelpRequest {
  const publicName = getPublicName(application.full_name);
  const safeId = application.id.replace(/[^a-zA-Z0-9-]/g, "-");
  return {
    id: `app-${safeId}`,
    name: publicName,
    age: getAgeFromDate(application.birth_date),
    city: application.city,
    category: application.category,
    reason: application.debt_reason || application.story.slice(0, 96),
    story: application.story,
    targetAmount: application.target_amount,
    collectedAmount: 0,
    verified: true,
    urgency: application.urgency,
    daysLeft: 30,
    documents: application.documents.length ? application.documents : ["Документы предоставлены на проверку"],
    recipient: {
      name: application.recipient_name,
      bank: application.bank,
      card: application.card,
      sbpPhone: application.sbp_phone,
    },
    updates: [
      { date: "Сегодня", text: "Заявка прошла модерацию и опубликована в мини-приложении." },
    ],
  };
}

export async function listPublishedRequests() {
  const published = await listApplications("published");
  return published.map(applicationToRequest);
}
