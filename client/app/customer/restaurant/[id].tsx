import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { getRestaurant, getRestaurantProducts } from '../../../services/api';
import MenuItemRow from '../../../components/MenuItemRow';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  image_url: string | null;
};

type Restaurant = {
  id: number;
  name: string;
  rating: number;
  price_range: string | number;
};

// Maps numeric price range to dollar signs if the API returns a number.
function formatPrice(price: string | number): string {
  if (typeof price === 'number') return '$'.repeat(price);
  return price;
}

export default function RestaurantMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [productId: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/');
        return;
      }

      try {
        const [restaurantData, productsData] = await Promise.all([
          getRestaurant(id, token),
          getRestaurantProducts(id, token),
        ]);

        setRestaurant(restaurantData);
        setProducts(productsData);

        // Initialize all quantities to 0 — resets on every mount (fresh restaurant visit)
        const initialQuantities: { [key: number]: number } = {};
        productsData.forEach((p: Product) => { initialQuantities[p.id] = 0; });
        setQuantities(initialQuantities);
      } catch {
        setError('Failed to load menu. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleIncrement = (productId: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  };

  const handleDecrement = (productId: number) => {
    setQuantities((prev) => {
      if ((prev[productId] ?? 0) === 0) return prev;
      return { ...prev, [productId]: prev[productId] - 1 };
    });
  };

  const allZero = Object.values(quantities).every((q) => q === 0);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DA583B" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const starCount = Math.round(restaurant?.rating ?? 0);

  return (
    <View style={styles.screen}>
      {/* Restaurant info + CREATE ORDER button */}
      <View style={styles.restaurantHeader}>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant?.name}</Text>
          <Text style={styles.restaurantPrice}>{formatPrice(restaurant?.price_range ?? '')}</Text>
          <View style={styles.stars}>
            {Array.from({ length: starCount }).map((_, i) => (
              <FontAwesomeIcon key={i} icon={faStar} color="#F0CB67" size={14} />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.orderButton, allZero && styles.orderButtonDisabled]}
          onPress={() => setIsModalVisible(true)}
          disabled={allZero}
        >
          <Text style={styles.orderButtonText}>CREATE ORDER</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.screenHeading}>RESTAURANT MENU</Text>

      <ScrollView contentContainerStyle={styles.menuList}>
        {products.map((product) => (
          <MenuItemRow
            key={product.id}
            product={product}
            quantity={quantities[product.id] ?? 0}
            onIncrement={() => handleIncrement(product.id)}
            onDecrement={() => handleDecrement(product.id)}
          />
        ))}
      </ScrollView>

      {/* TODO: replace with full OrderConfirmationModal in Feature 06 */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Order Confirmation</Text>
            <Text style={styles.modalPlaceholder}>Order modal coming in Feature 06.</Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#222126',
    padding: 12,
  },
  centered: {
    flex: 1,
    backgroundColor: '#222126',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#DA583B',
    fontSize: 15,
    textAlign: 'center',
  },
  screenHeading: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 12,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantPrice: {
    color: '#F0CB67',
    fontSize: 14,
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  orderButton: {
    backgroundColor: '#DA583B',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  orderButtonDisabled: {
    backgroundColor: '#851919',
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  menuList: {
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222126',
    marginBottom: 12,
  },
  modalPlaceholder: {
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalClose: {
    backgroundColor: '#DA583B',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
