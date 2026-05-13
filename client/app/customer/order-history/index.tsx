import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import OrderHistoryModal from '../../../components/OrderHistoryModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { getCustomerOrders } from '../../../services/api';

type OrderProduct = {
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  product_id: number;
};

type Order = {
  id: number;
  restaurant_name: string;
  status: string;
  created_on: string;
  courier_name: string | null;
  products: OrderProduct[];
  total_cost: number;
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const storedToken = await AsyncStorage.getItem('token');

      if (!storedToken) {
        router.replace('/');
        return;
      }

      const customerRaw = await AsyncStorage.getItem('customer');
      const customer = customerRaw ? JSON.parse(customerRaw) : null;
      const customerId: number = customer?.id ?? 0;

      try {
        const data = await getCustomerOrders(customerId, storedToken);
        setOrders(data);
      } catch {
        setError('Failed to load orders. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
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
      <Text style={styles.heading}>MY ORDERS</Text>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerCell}>ORDER</Text>
        <Text style={styles.headerCellStatus}>STATUS</Text>
        <Text style={styles.headerCellView}>VIEW</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders yet.</Text>
        </View>
      ) : (
        <ScrollView>
          {orders.map((order, index) => (
            <View
              key={order.id}
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
              <Text style={styles.rowCell} numberOfLines={2}>{order.restaurant_name}</Text>
              <Text style={styles.rowCellStatus}>{order.status}</Text>
              <TouchableOpacity
                style={styles.rowCellView}
                onPress={() => handleViewOrder(order)}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} size={18} color="#222126" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <OrderHistoryModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
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
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222126',
    letterSpacing: 1,
    marginBottom: 12,
  },
  errorText: {
    color: '#DA583B',
    fontSize: 15,
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#222126',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  headerCell: {
    flex: 2,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  headerCellStatus: {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  headerCellView: {
    width: 50,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  tableRowAlt: {
    backgroundColor: '#F9F9F9',
  },
  rowCell: {
    flex: 2,
    fontSize: 13,
    color: '#222126',
  },
  rowCellStatus: {
    flex: 1,
    fontSize: 13,
    color: '#222126',
  },
  rowCellView: {
    width: 50,
    alignItems: 'center',
  },
});
