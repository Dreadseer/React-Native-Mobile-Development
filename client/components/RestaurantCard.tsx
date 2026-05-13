import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

type Restaurant = {
  id: number;
  name: string;
  rating: number;
  price_range: string | number;
  image_url: string | null;
};

type Props = {
  restaurant: Restaurant;
  onPress: () => void;
};

// Maps numeric price range (1, 2, 3) to dollar signs in case the API returns numbers.
// If the API already returns '$', '$$', '$$$', this returns the value unchanged.
function formatPrice(price: string | number): string {
  if (typeof price === 'number') {
    return '$'.repeat(price);
  }
  return price;
}

export default function RestaurantCard({ restaurant, onPress }: Props) {
  const starCount = Math.round(restaurant.rating);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {restaurant.image_url ? (
        <Image source={{ uri: restaurant.image_url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{restaurant.name}</Text>
        <Text style={styles.price}>{formatPrice(restaurant.price_range)}</Text>
        <View style={styles.stars}>
          {Array.from({ length: starCount }).map((_, i) => (
            <FontAwesomeIcon key={i} icon={faStar} color="#F0CB67" size={14} />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 110,
    backgroundColor: '#CCCCCC',
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    color: '#851919',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
});
