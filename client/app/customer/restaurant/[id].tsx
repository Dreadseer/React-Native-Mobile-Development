import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function RestaurantMenuScreen() {
  const { id } = useLocalSearchParams();
  console.log('Restaurant ID:', id);

  return (
    <View>
      <Text>Restaurant Menu — ID: {id}</Text>
    </View>
  );
}
