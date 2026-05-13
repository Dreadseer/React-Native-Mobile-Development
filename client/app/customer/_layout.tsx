// Customer Tab Navigator — renders the Header above the bottom tab bar on every customer screen.
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUtensils, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import Header from '../../components/Header';

export default function CustomerLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#222126' },
          tabBarActiveTintColor: '#DA583B',
          tabBarInactiveTintColor: '#FFFFFF',
        }}
      >
        <Tabs.Screen
          name="restaurant"
          options={{
            title: 'Restaurants',
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faUtensils} color={color} size={20} />
            ),
          }}
        />
        <Tabs.Screen
          name="order-history"
          options={{
            title: 'Order History',
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faClockRotateLeft} color={color} size={20} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
