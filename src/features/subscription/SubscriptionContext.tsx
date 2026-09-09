import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { supabase } from '../../infrastructure/sync/supabaseClient';

const API_KEY_APPLE = process.env.EXPO_PUBLIC_RC_APPLE || 'placeholder-apple';
const API_KEY_GOOGLE = process.env.EXPO_PUBLIC_RC_GOOGLE || 'placeholder-google';

interface SubscriptionContextType {
  isPro: boolean;
  packages: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  checkTesterBypass: (code: string) => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLifetimeTester, setIsLifetimeTester] = useState(false);

  useEffect(() => {
    initRevenueCat();
    checkTesterStatus();
  }, []);

  const checkTesterStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('is_lifetime_tester')
        .eq('id', session.user.id)
        .single();
      
      if (!error && data?.is_lifetime_tester) {
        setIsLifetimeTester(true);
        setIsPro(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initRevenueCat = async () => {
    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEY_APPLE });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEY_GOOGLE });
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // Assume "plumbline_pro" is the entitlement identifier in RevenueCat
      if (typeof customerInfo.entitlements.active['plumbline_pro'] !== 'undefined') {
        setIsPro(true);
      }
      
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (e) {
      console.error("Error initializing RevenueCat", e);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (typeof customerInfo.entitlements.active['plumbline_pro'] !== 'undefined') {
        setIsPro(true);
        return true;
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Error', e.message);
      }
    }
    return false;
  };

  const checkTesterBypass = async (code: string) => {
    // If the user enters the secret code, update their profile
    if (code === 'TESTER_FREE_FOREVER') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase
          .from('profiles')
          .update({ is_lifetime_tester: true, entitlement_status: 'lifetime' })
          .eq('id', session.user.id);
      }
      setIsLifetimeTester(true);
      setIsPro(true);
      return true;
    }
    return false;
  };

  // If they are a lifetime tester, force isPro to true regardless of RevenueCat
  const effectiveIsPro = isPro || isLifetimeTester;

  return (
    <SubscriptionContext.Provider value={{ isPro: effectiveIsPro, packages, purchasePackage, checkTesterBypass }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
