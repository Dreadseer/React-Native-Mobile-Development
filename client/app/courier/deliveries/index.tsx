import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import {
  getPendingOrders,
  getCourierOrders,
  updateOrderStatus,
} from '../../../services/api';
import DeliveryDetailsModal from '../../../components/DeliveryDetailsModal';
import { Fonts } from '../../../constants/fonts';

// Field names confirmed from API console log
type OrderProduct = {
  product_name: string;
  quantity: number;
  unit_cost: number;
  product_id: number;
};

type Order = {
  id: number;
  status: string;          // normalized to uppercase after fetch
  customer_address: string;
  restaurant_name: string;
  created_on: string;
  products: OrderProduct[];
};

const statusColors: { [key: string]: string } = {
  'PENDING': '#851919',
  'IN PROGRESS': '#DA583B',
  'DELIVERED': '#609475',
};

const nextStatusName: { [key: string]: string } = {
  'PENDING': 'IN PROGRESS',
  'IN PROGRESS': 'DELIVERED',
};

export default function CourierDeliveriesScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.replace('/');
      return;
    }

    const courierRaw = await AsyncStorage.getItem('courier');
    const courier = courierRaw ? JSON.parse(courierRaw) : null;
    const courierId: number = courier?.id;

    try {
      const [pendingOrders, courierOrders] = await Promise.all([
        getPendingOrders(token),
        getCourierOrders(courierId, token),
      ]);

      // API returns lowercase status — normalize to uppercase for consistent comparisons
      const normalize = (list: any[]): Order[] =>
        list.map(o => ({ ...o, status: (o.status as string).toUpperCase() }));

      const merged: Order[] = [
        ...normalize(pendingOrders),
        ...normalize(courierOrders).filter(o => o.status !== 'PENDING'),
      ];

      setOrders(merged);
    } catch {
      setError('Failed to load deliveries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusAdvance = async (order: Order) => {
    const next = nextStatusName[order.status];
    if (!next) return;

    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      await updateOrderStatus(order.id, next.toLowerCase(), token);
      setOrders(prev =>
        prev.map(o => (o.id === order.id ? { ...o, status: next } : o))
      );
    } catch (e) {
      console.log('=== UPDATE STATUS ERROR ===', e);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalVisible(false);
  };

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
      <Text style={styles.heading}>MY DELIVERIES</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colId]}>ORDER ID</Text>
          <Text style={[styles.headerCell, styles.colAddress]}>ADDRESS</Text>
          <Text style={[styles.headerCell, styles.colStatus]}>STATUS</Text>
          <Text style={[styles.headerCell, styles.colView]}>VIEW</Text>
        </View>

        {/* Table rows */}
        {orders.map(order => (
          <View key={order.id} style={styles.tableRow}>
            <Text style={[styles.cell, styles.colId]}>{order.id}</Text>
            <Text style={[styles.cell, styles.colAddress]} numberOfLines={1}>
              {order.customer_address}
            </Text>
            <View style={styles.colStatus}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: statusColors[order.status] ?? '#888' },
                ]}
                onPress={() => handleStatusAdvance(order)}
                disabled={order.status === 'DELIVERED'}
              >
                <Text style={styles.statusButtonText}>{order.status}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.colView} onPress={() => handleView(order)}>
              <FontAwesomeIcon icon={faMagnifyingGlass} size={18} color="#222126" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <DeliveryDetailsModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#DA583B',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
    fontFamily: Fonts.body,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: '#222126',
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#222126',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  headerCell: {
    color: '#FFFFFF',
    fontFamily: Fonts.subheading,
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  cell: {
    fontSize: 13,
    color: '#222126',
    fontFamily: Fonts.body,
  },
  colId: {
    width: 60,
  },
  colAddress: {
    flex: 1,
  },
  colStatus: {
    width: 120,
    alignItems: 'center',
  },
  colView: {
    width: 50,
    alignItems: 'center',
  },
  statusButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: Fonts.body,
  },
});
