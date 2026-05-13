import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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

type Props = {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
};

export default function OrderHistoryModal({ visible, onClose, order }: Props) {
  if (!order) return null;

  const orderTotal = order.products.reduce(
    (sum, p) => sum + p.unit_cost * p.quantity,
    0
  );

  const formattedDate = new Date(order.created_on).toLocaleDateString();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {order.restaurant_name}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.metaText}>Order Date: {formattedDate}</Text>
            <Text style={styles.metaText}>Status: {order.status}</Text>
            <Text style={styles.metaText}>Courier: {order.courier_name ?? 'Not assigned'}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            {/* Product line items */}
            {order.products.map((p) => (
              <View key={p.product_id} style={styles.productRow}>
                <Text style={styles.productName} numberOfLines={1}>{p.product_name}</Text>
                <Text style={styles.productQty}>x{p.quantity}</Text>
                <Text style={styles.productPrice}>$ {p.unit_cost.toFixed(2)}</Text>
              </View>
            ))}

            {/* Divider + Total */}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL: $ {orderTotal.toFixed(2)}</Text>
            </View>
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 24,
    overflow: 'hidden',
    maxHeight: '80%',
    width: '88%',
  },
  header: {
    backgroundColor: '#222126',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    flex: 1,
    color: '#DA583B',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 22,
    paddingLeft: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 3,
  },
  body: {
    padding: 16,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#222126',
  },
  productQty: {
    fontSize: 14,
    color: '#222126',
    marginHorizontal: 8,
  },
  productPrice: {
    fontSize: 14,
    color: '#222126',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalRow: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222126',
  },
});
