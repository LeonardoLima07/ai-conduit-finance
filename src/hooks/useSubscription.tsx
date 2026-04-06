import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PlanType = "free" | "business" | "pro" | "master";

export interface PlanConfig {
  name: string;
  label: string;
  monthlyTransactionLimit: number | null; // null = unlimited
  features: {
    advancedReports: boolean;
    forecast: boolean;
    aiAdvisor: boolean;
    expenseAnalysis: boolean;
    profitPlanner: boolean;
    personalizedAI: boolean;
    strategicInsights: boolean;
  };
  price: string;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: "free",
    label: "Starter",
    monthlyTransactionLimit: 50,
    features: {
      advancedReports: false,
      forecast: false,
      aiAdvisor: false,
      expenseAnalysis: false,
      profitPlanner: false,
      personalizedAI: false,
      strategicInsights: false,
    },
    price: "Free",
  },
  business: {
    name: "business",
    label: "Business",
    monthlyTransactionLimit: null,
    features: {
      advancedReports: true,
      forecast: true,
      aiAdvisor: false,
      expenseAnalysis: false,
      profitPlanner: false,
      personalizedAI: false,
      strategicInsights: false,
    },
    price: "R$ 97/mês",
  },
  pro: {
    name: "pro",
    label: "Pro",
    monthlyTransactionLimit: null,
    features: {
      advancedReports: true,
      forecast: true,
      aiAdvisor: true,
      expenseAnalysis: true,
      profitPlanner: true,
      personalizedAI: false,
      strategicInsights: false,
    },
    price: "R$ 197/mês",
  },
  master: {
    name: "master",
    label: "Master",
    monthlyTransactionLimit: null,
    features: {
      advancedReports: true,
      forecast: true,
      aiAdvisor: true,
      expenseAnalysis: true,
      profitPlanner: true,
      personalizedAI: true,
      strategicInsights: true,
    },
    price: "R$ 397/mês",
  },
};

interface Subscription {
  id: string;
  plan: PlanType;
  status: string;
  transaction_count_this_month: number;
  current_period_end: string;
  month_reset_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreate = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) { console.error(error); setLoading(false); return; }

    if (data) {
      // Reset counter if month changed
      const resetDate = new Date(data.month_reset_at);
      const now = new Date();
      if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
        await supabase
          .from("subscriptions")
          .update({ transaction_count_this_month: 0, month_reset_at: now.toISOString().split("T")[0] })
          .eq("id", data.id);
        data.transaction_count_this_month = 0;
      }
      setSubscription(data as Subscription);
    } else {
      const { data: newSub } = await supabase
        .from("subscriptions")
        .insert({ user_id: user.id, plan: "free" })
        .select()
        .single();
      if (newSub) setSubscription(newSub as Subscription);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchOrCreate(); }, [fetchOrCreate]);

  const plan = subscription ? PLANS[subscription.plan] : PLANS.free;
  const planType = (subscription?.plan ?? "free") as PlanType;

  const canAddTransaction = () => {
    if (!plan.monthlyTransactionLimit) return true;
    return (subscription?.transaction_count_this_month ?? 0) < plan.monthlyTransactionLimit;
  };

  const incrementTransactionCount = async () => {
    if (!subscription) return;
    const newCount = (subscription.transaction_count_this_month ?? 0) + 1;
    await supabase
      .from("subscriptions")
      .update({ transaction_count_this_month: newCount })
      .eq("id", subscription.id);
    setSubscription({ ...subscription, transaction_count_this_month: newCount });
  };

  const hasFeature = (feature: keyof PlanConfig["features"]) => plan.features[feature];

  const transactionsUsed = subscription?.transaction_count_this_month ?? 0;
  const transactionsLimit = plan.monthlyTransactionLimit;

  return {
    subscription,
    plan,
    planType,
    loading,
    canAddTransaction,
    incrementTransactionCount,
    hasFeature,
    transactionsUsed,
    transactionsLimit,
    refetch: fetchOrCreate,
  };
}
