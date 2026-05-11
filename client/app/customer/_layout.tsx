// Customer Tab Navigator — bottom tab bar with Restaurants and Order History tabs.
import { Tabs } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUtensils, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

export default function CustomerLayout() {
  return (
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
  );
}
