import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useSubscription } from '../../features/subscription/SubscriptionContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export function PaywallScreen() {
  const { packages, purchasePackage, checkTesterBypass } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const handlePurchase = async (pkg: any) => {
    setLoading(true);
    const success = await purchasePackage(pkg);
    setLoading(false);
    if (success) {
      router.back();
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;
    setLoading(true);
    const success = await checkTesterBypass(promoCode.trim());
    setLoading(false);
    if (success) {
      Alert.alert('Success', 'Lifetime tester access granted!');
      router.back();
    } else {
      Alert.alert('Error', 'Invalid promo code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Unlock Plumb Line Pro</Text>
        <Text style={styles.subtitle}>
          Support the app, cover AI backend costs, and keep your daily habit going with full cloud sync.
        </Text>

        <View style={styles.packagesContainer}>
          {packages.map((pkg) => (
            <TouchableOpacity 
              key={pkg.identifier} 
              style={styles.packageCard}
              onPress={() => handlePurchase(pkg)}
              disabled={loading}
            >
              <Text style={styles.packageName}>{pkg.product.title}</Text>
              <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
              <Text style={styles.packageDesc}>{pkg.product.description}</Text>
            </TouchableOpacity>
          ))}
          {packages.length === 0 && !loading && (
            <Text style={{ textAlign: 'center', margin: 20, color: '#666' }}>
              Loading subscription options... Make sure you have an active Offering in the RevenueCat dashboard.
            </Text>
          )}
        </View>

        {loading && <ActivityIndicator size="large" color="#000" style={{ marginVertical: 20 }} />}

        <View style={styles.promoContainer}>
          <Text style={styles.promoLabel}>Have a tester code?</Text>
          <View style={styles.promoInputRow}>
            <TextInput 
              style={styles.promoInput}
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter code"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.promoButton} onPress={handlePromoCode}>
              <Text style={styles.promoButtonText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F4' },
  content: { padding: 20, flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 40, lineHeight: 22 },
  packagesContainer: { gap: 16 },
  packageCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  packageName: { fontSize: 18, fontWeight: '600' },
  packagePrice: { fontSize: 22, fontWeight: 'bold', marginVertical: 8 },
  packageDesc: { fontSize: 14, color: '#666' },
  promoContainer: { marginTop: 40, alignItems: 'center' },
  promoLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  promoInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promoInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  promoButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
  },
  promoButtonText: { color: '#fff', fontWeight: 'bold' }
});
