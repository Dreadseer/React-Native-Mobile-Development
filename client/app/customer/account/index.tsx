import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import AccountScreen from '../../../components/AccountScreen';

export default function CustomerAccountPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const t = await AsyncStorage.getItem('token');
      if (!t) { router.replace('/'); return; }
      const userRaw = await AsyncStorage.getItem('user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      setToken(t);
      setUserId(user?.id ?? null);
    };
    load();
  }, []);

  if (!token || userId === null) {
    return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
  }

  return <AccountScreen type="customer" userId={userId} token={token} />;
}
