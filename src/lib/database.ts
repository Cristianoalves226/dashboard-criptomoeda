import { supabase, isSupabaseConfigured } from './supabase';
import type { Holding, Transaction } from '../data';

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  role: 'admin' | 'user';
  created_at: string;
}

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: number;
};

function mapProfile(row: Profile): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    role: row.role,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    console.error('getProfile error', error);
    return null;
  }

  return mapProfile(data as Profile);
}

export async function updateProfile(
  userId: string,
  updates: { name?: string; email?: string }
): Promise<UserProfile | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.email !== undefined ? { email: updates.email } : {}),
    })
    .eq('id', userId)
    .select('*')
    .maybeSingle();

  if (error || !data) {
    console.error('updateProfile error', error);
    return null;
  }

  return mapProfile(data as Profile);
}

export async function listAllProfiles(): Promise<UserProfile[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('listAllProfiles error', error);
    return [];
  }

  return (data as Profile[]).map(mapProfile);
}

export async function deleteProfile(userId: string): Promise<boolean> {
  if (!supabase) return false;

  // Soft approach: we only remove the profile row.
  // Auth user deletion requires service role (not available on client).
  const { error } = await supabase.from('profiles').delete().eq('id', userId);

  if (error) {
    console.error('deleteProfile error', error);
    return false;
  }
  return true;
}

// ---------- Holdings ----------

export async function fetchHoldings(userId: string): Promise<Holding[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('holdings')
    .select('asset_id, amount')
    .eq('user_id', userId);

  if (error || !data) {
    console.error('fetchHoldings error', error);
    return [];
  }

  return data.map((row) => ({
    id: row.asset_id as string,
    amount: Number(row.amount),
  }));
}

export async function upsertHolding(
  userId: string,
  assetId: string,
  amount: number
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('holdings').upsert(
    {
      user_id: userId,
      asset_id: assetId,
      amount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,asset_id' }
  );

  if (error) {
    console.error('upsertHolding error', error);
    return false;
  }
  return true;
}

export async function applyHoldingDelta(
  userId: string,
  assetId: string,
  delta: number
): Promise<boolean> {
  if (!supabase) return false;

  // Read current
  const { data: current, error: readError } = await supabase
    .from('holdings')
    .select('amount')
    .eq('user_id', userId)
    .eq('asset_id', assetId)
    .maybeSingle();

  if (readError) {
    console.error('applyHoldingDelta read error', readError);
    return false;
  }

  const currentAmount = current ? Number(current.amount) : 0;
  const nextAmount = Math.max(0, currentAmount + delta);

  if (nextAmount === 0 && current) {
    const { error } = await supabase
      .from('holdings')
      .delete()
      .eq('user_id', userId)
      .eq('asset_id', assetId);
    if (error) {
      console.error('applyHoldingDelta delete error', error);
      return false;
    }
    return true;
  }

  return upsertHolding(userId, assetId, nextAmount);
}

export async function resetUserWallet(userId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error: hError } = await supabase.from('holdings').delete().eq('user_id', userId);
  const { error: tError } = await supabase.from('transactions').delete().eq('user_id', userId);

  if (hError || tError) {
    console.error('resetUserWallet error', hError || tError);
    return false;
  }
  return true;
}

// ---------- Transactions ----------

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    type: row.type,
    assetId: row.asset_id,
    amount: Number(row.amount),
    toAssetId: row.to_asset_id ?? undefined,
    toAmount: row.to_amount != null ? Number(row.to_amount) : undefined,
    fiatAmount: row.fiat_amount != null ? Number(row.fiat_amount) : undefined,
    paymentMethod: row.payment_method ?? undefined,
    counterparty: row.counterparty ?? undefined,
    hash: row.hash,
    status: row.status,
    timestamp: new Date(row.occurred_at).getTime(),
  };
}

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false });

  if (error || !data) {
    console.error('fetchTransactions error', error);
    return [];
  }

  return data.map(mapTransaction);
}

export async function insertTransaction(
  userId: string,
  tx: Omit<Transaction, 'id'> & { id?: string }
): Promise<Transaction | null> {
  if (!supabase) return null;

  const payload = {
    user_id: userId,
    client_id: tx.id ?? null,
    type: tx.type,
    asset_id: tx.assetId,
    amount: tx.amount,
    to_asset_id: tx.toAssetId ?? null,
    to_amount: tx.toAmount ?? null,
    fiat_amount: tx.fiatAmount ?? null,
    payment_method: tx.paymentMethod ?? null,
    counterparty: tx.counterparty ?? null,
    hash: tx.hash,
    status: tx.status,
    occurred_at: new Date(tx.timestamp).toISOString(),
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select('*')
    .maybeSingle();

  if (error || !data) {
    console.error('insertTransaction error', error);
    return null;
  }

  return mapTransaction(data);
}

export async function deleteTransaction(txId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('transactions').delete().eq('id', txId);

  if (error) {
    console.error('deleteTransaction error', error);
    return false;
  }
  return true;
}

export { isSupabaseConfigured };
