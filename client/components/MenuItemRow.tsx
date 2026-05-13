import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getRestaurantImage } from '../constants/restaurantImages';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number | string;
};

type Props = {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export default function MenuItemRow({ product, quantity, onIncrement, onDecrement }: Props) {
  // Price may come back as a string from the API — parse it before formatting.
  const formattedPrice = `$ ${parseFloat(String(product.price)).toFixed(2)}`;
  const atZero = quantity === 0;

  return (
    <View style={styles.row}>
      <Image source={getRestaurantImage(product.id)} style={styles.image} />

      <View style={styles.details}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formattedPrice}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
      </View>

      <View style={styles.stepper}>
        <TouchableOpacity
          style={[styles.stepButton, atZero && styles.stepButtonMuted]}
          onPress={onDecrement}
        >
          <Text style={styles.stepButtonText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.quantity}>{quantity}</Text>

        <TouchableOpacity style={styles.stepButton} onPress={onIncrement}>
          <Text style={styles.stepButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 2,
  },
  price: {
    fontSize: 13,
    color: '#851919',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#888',
  },
  stepper: {
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 6,
  },
  stepButton: {
    backgroundColor: '#DA583B',
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonMuted: {
    backgroundColor: '#AAAAAA',
  },
  stepButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222126',
    minWidth: 24,
    textAlign: 'center',
  },
});
