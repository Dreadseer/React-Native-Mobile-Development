import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Fonts } from '../constants/fonts';

// Field names confirmed from API console log
type OrderProduct = {
  product_name: string;
  quantity: number;
  unit_cost: number;
  product_id: number;
};

type Order = {
  id: number;
  status: string;
  customer_address: string;
  restaurant_name: string;
  created_on: string;
  products: OrderProduct[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
};

export default function DeliveryDetailsModal({ visible, onClose, order }: Props) {
  if (!order) return null;

  const total = order.products.reduce((sum, p) => sum + p.unit_cost * p.quantity, 0);
  const formattedDate = new Date(order.created_on).toLocaleDateString();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>DELIVERY DETAILS</Text>
                <Text style={styles.headerStatus}>Status: {order.status}</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.bodyText}>Delivery Address: {order.customer_address}</Text>
            <Text style={styles.bodyText}>Restaurant: {order.restaurant_name}</Text>
            <Text style={styles.bodyText}>Order Date: {formattedDate}</Text>

            <Text style={styles.detailsLabel}>Order Details:</Text>

            {order.products.map((p, index) => (
              <View key={index} style={styles.productRow}>
                <Text style={styles.productName} numberOfLines={1}>{p.product_name}</Text>
                <Text style={styles.productQty}>x{p.quantity}</Text>
                <Text style={styles.productPrice}>$ {p.unit_cost.toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL: $ {total.toFixed(2)}</Text>
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
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: Fonts.heading,
    color: '#DA583B',
    fontSize: 18,
  },
  headerStatus: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 4,
    fontFamily: Fonts.body,
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 22,
    paddingLeft: 12,
    fontFamily: Fonts.body,
  },
  body: {
    padding: 16,
  },
  bodyText: {
    fontSize: 14,
    color: '#222126',
    marginBottom: 6,
    fontFamily: Fonts.body,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222126',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: Fonts.body,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#222126',
    fontFamily: Fonts.body,
  },
  productQty: {
    fontSize: 14,
    color: '#222126',
    marginHorizontal: 8,
    fontFamily: Fonts.body,
  },
  productPrice: {
    fontSize: 14,
    color: '#222126',
    minWidth: 60,
    textAlign: 'right',
    fontFamily: Fonts.body,
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
    fontFamily: Fonts.body,
  },
});
