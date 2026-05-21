import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getRestaurants } from '../../../services/api';
import RestaurantCard from '../../../components/RestaurantCard';
import { Fonts } from '../../../constants/fonts';

type Restaurant = {
  id: number;
  name: string;
  rating: number;
  price_range: string | number;
  image_url: string | null;
};

const RATING_OPTIONS = [1, 2, 3, 4, 5];
const PRICE_OPTIONS = ['$', '$$', '$$$'];

export default function RestaurantListScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/');
        return;
      }

      try {
        const data = await getRestaurants(token);
        setRestaurants(data);
      } catch {
        setError('Failed to load restaurants. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Derive filtered list from the full restaurants array — never mutates the original
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const ratingMatch = selectedRating === null || r.rating >= selectedRating;

      // Normalise price to dollar signs before comparing
      const priceStr = typeof r.price_range === 'number'
        ? '$'.repeat(r.price_range)
        : r.price_range;
      const priceMatch = selectedPrice === null || priceStr === selectedPrice;

      return ratingMatch && priceMatch;
    });
  }, [restaurants, selectedRating, selectedPrice]);

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

  return (
    <View style={styles.screen}>
      <Text style={styles.sectionHeading}>NEARBY RESTAURANTS</Text>

      {/* Filter row */}
      <View style={styles.filterRow}>
        {/* Rating dropdown */}
        <View style={styles.filterWrapper}>
          <Text style={styles.filterLabel}>Rating</Text>
          <TouchableOpacity
            style={[styles.filterButton, selectedRating !== null && styles.filterActive]}
            onPress={() => { setRatingOpen(!ratingOpen); setPriceOpen(false); }}
          >
            <Text style={[styles.filterButtonText, selectedRating !== null && styles.filterActiveText]}>
              {selectedRating !== null ? `${selectedRating}★` : '-- Rating --'}
            </Text>
          </TouchableOpacity>

          {ratingOpen && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { setSelectedRating(null); setRatingOpen(false); }}
              >
                <Text style={styles.dropdownItemText}>-- Select --</Text>
              </TouchableOpacity>
              {RATING_OPTIONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedRating(r); setRatingOpen(false); }}
                >
                  <Text style={styles.dropdownItemText}>{r}★</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Price dropdown */}
        <View style={styles.filterWrapper}>
          <Text style={styles.filterLabel}>Price</Text>
          <TouchableOpacity
            style={[styles.filterButton, selectedPrice !== null && styles.filterActive]}
            onPress={() => { setPriceOpen(!priceOpen); setRatingOpen(false); }}
          >
            <Text style={[styles.filterButtonText, selectedPrice !== null && styles.filterActiveText]}>
              {selectedPrice !== null ? selectedPrice : '-- Price --'}
            </Text>
          </TouchableOpacity>

          {priceOpen && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { setSelectedPrice(null); setPriceOpen(false); }}
              >
                <Text style={styles.dropdownItemText}>-- Select --</Text>
              </TouchableOpacity>
              {PRICE_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={styles.dropdownItem}
                  onPress={() => { setSelectedPrice(p); setPriceOpen(false); }}
                >
                  <Text style={styles.dropdownItemText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <Text style={styles.sectionHeading}>RESTAURANTS</Text>

      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/customer/restaurant/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No restaurants match your filters.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  centered: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#DA583B',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: Fonts.body,
  },
  sectionHeading: {
    color: '#222126',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
    fontFamily: Fonts.heading,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    zIndex: 10,
  },
  filterWrapper: {
    flex: 1,
    zIndex: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 4,
    fontFamily: Fonts.body,
  },
  filterButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  filterActive: {
    backgroundColor: '#DA583B',
  },
  filterButtonText: {
    color: '#222126',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: Fonts.body,
  },
  filterActiveText: {
    color: '#FFFFFF',
  },
  dropdown: {
    position: 'absolute',
    top: 62,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 20,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#222126',
    fontFamily: Fonts.body,
  },
  grid: {
    paddingBottom: 20,
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
});
