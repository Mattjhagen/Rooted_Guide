import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSubscription } from '../../features/subscription/SubscriptionContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import RevenueCatUI from 'react-native-purchases-ui';

export function PaywallScreen() {
  const { checkTesterBypass } = useSubscription();
  const [promoCode, setPromoCode] = useState('');
  const [showPromo, setShowPromo] = useState(false);

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;
    const success = await checkTesterBypass(promoCode.trim());
    if (success) {
      Alert.alert('Success', 'Lifetime tester access granted!');
      router.back();
    } else {
      Alert.alert('Error', 'Invalid promo code');
    }
  };

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall 
        onPurchaseCompleted={(customerInfo) => {
          if (typeof customerInfo.entitlements.active['plumbline_pro'] !== 'undefined') {
            router.back();
          }
        }}
        onRestoreCompleted={(customerInfo) => {
          if (typeof customerInfo.entitlements.active['plumbline_pro'] !== 'undefined') {
            Alert.alert('Restored!', 'Your subscription was successfully restored.');
            router.back();
          }
        }}
        onDismiss={() => {
          router.back();
        }}
      />
      
      {/* Secret Tester Code Section overlayed at the very bottom */}
      {!showPromo ? (
        <TouchableOpacity style={styles.secretButton} onLongPress={() => setShowPromo(true)}>
          <Text style={styles.secretButtonText}> </Text>
        </TouchableOpacity>
      ) : (
        <SafeAreaView edges={['bottom']} style={styles.promoContainer}>
          <View style={styles.promoInputRow}>
            <TextInput 
              style={styles.promoInput}
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter tester code"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.promoButton} onPress={handlePromoCode}>
              <Text style={styles.promoButtonText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  secretButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'transparent'
  },
  secretButtonText: {
    color: 'transparent'
  },
  promoContainer: { 
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderColor: '#333'
  },
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
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
  },
  promoButtonText: { color: '#fff', fontWeight: 'bold' }
});
