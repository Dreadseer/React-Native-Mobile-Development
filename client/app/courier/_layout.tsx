// Courier Tab Navigator — mirrors the customer tab bar structure with courier-specific routes.
import { Tabs } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTruck, faUser } from '@fortawesome/free-solid-svg-icons';

export default function CourierLayout() {
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
        name="deliveries"
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faTruck} color={color} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faUser} color={color} size={20} />
          ),
        }}
      />
    </Tabs>
  );
}
