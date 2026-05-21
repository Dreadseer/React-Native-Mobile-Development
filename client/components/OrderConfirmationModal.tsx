import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleCheck, faCircleXmark, faSquare, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { createOrder } from '../services/api';
import { Fonts } from '../constants/fonts';

type Product = {
  id: number;
  name: string;
  price: number | string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  products: Product[];
  quantities: { [productId: number]: number };
  token: string;
  customerId: number;
  restaurantId: number;
};

type OrderStatus = 'idle' | 'processing' | 'success' | 'failure';

export default function OrderConfirmationModal({
  visible,
  onClose,
  products,
  quantities,
  token,
  customerId,
  restaurantId,
}: Props) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('idle');
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);

  // Only items the user actually ordered
  const orderedItems = products.filter((p) => (quantities[p.id] ?? 0) > 0);

  const orderTotal = orderedItems.reduce((sum, p) => {
    return sum + parseFloat(String(p.price)) * (quantities[p.id] ?? 0);
  }, 0);

  const handleClose = () => {
    if (orderStatus === 'processing') return;
    setOrderStatus('idle');
    setSendEmail(false);
    setSendSMS(false);
    onClose();
  };

  const handleConfirm = async () => {
    setOrderStatus('processing');

    const payload = {
      customer_id: customerId,
      restaurant_id: restaurantId,
      products: Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => ({
          product_id: parseInt(productId),
          quantity: qty,
        })),
      sendSMS,
      sendEmail,
    };

    try {
      await createOrder(payload, token);
      setOrderStatus('success');
    } catch {
      setOrderStatus('failure');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order Confirmation</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={orderStatus === 'processing'}
              style={{ opacity: orderStatus === 'processing' ? 0.4 : 1 }}
            >
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Order summary — always visible */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            <Text style={styles.summaryHeading}>Order Summary</Text>

            {orderedItems.map((product) => (
              <View key={product.id} style={styles.row}>
                <Text style={styles.rowName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.rowQty}>x{quantities[product.id]}</Text>
                <Text style={styles.rowPrice}>
                  $ {(parseFloat(String(product.price)) * quantities[product.id]).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalAmount}>$ {orderTotal.toFixed(2)}</Text>
            </View>

            {/* Notification opt-in — idle state only */}
            {orderStatus === 'idle' && (
              <View style={styles.notificationSection}>
                <Text style={styles.notificationText}>
                  Would you like to receive your order confirmation by email and/or text?
                </Text>
                <View style={styles.checkboxRow}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setSendEmail(prev => !prev)}
                  >
                    <FontAwesomeIcon
                      icon={sendEmail ? faSquareCheck : faSquare}
                      size={20}
                      color={sendEmail ? '#DA583B' : '#222126'}
                    />
                    <Text style={styles.checkboxLabel}>By Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setSendSMS(prev => !prev)}
                  >
                    <FontAwesomeIcon
                      icon={sendSMS ? faSquareCheck : faSquare}
                      size={20}
                      color={sendSMS ? '#DA583B' : '#222126'}
                    />
                    <Text style={styles.checkboxLabel}>By Phone</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* State-based UI */}
            {orderStatus === 'success' && (
              <View style={styles.statusContainer}>
                <FontAwesomeIcon icon={faCircleCheck} color="#609475" size={48} />
                <Text style={styles.successText}>
                  Thank you! Your order has been received.
                </Text>
              </View>
            )}

            {orderStatus === 'failure' && (
              <View style={styles.statusContainer}>
                <FontAwesomeIcon icon={faCircleXmark} color="#851919" size={48} />
                <Text style={styles.failureText}>
                  Your order was not processed successfully. Please try again.
                </Text>
              </View>
            )}

            {/* CONFIRM ORDER button — shown in idle and failure, hidden on success */}
            {orderStatus !== 'success' && (
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  orderStatus === 'processing' && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={orderStatus === 'processing'}
              >
                <Text style={styles.confirmButtonText}>
                  {orderStatus === 'processing' ? 'PROCESSING ORDER…' : 'CONFIRM ORDER'}
                </Text>
              </TouchableOpacity>
            )}
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
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#222126',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Fonts.heading,
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 24,
    paddingHorizontal: 4,
    fontFamily: Fonts.body,
  },
  closeButtonDisabled: {
    opacity: 0.3,
  },
  body: {
    padding: 16,
  },
  summaryHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 12,
    fontFamily: Fonts.body,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowName: {
    flex: 1,
    fontSize: 13,
    color: '#222126',
    fontFamily: Fonts.body,
  },
  rowQty: {
    fontSize: 13,
    color: '#888',
    marginHorizontal: 8,
    minWidth: 28,
    textAlign: 'center',
    fontFamily: Fonts.body,
  },
  rowPrice: {
    fontSize: 13,
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222126',
    fontFamily: Fonts.body,
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222126',
    fontFamily: Fonts.body,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  successText: {
    color: '#609475',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: Fonts.body,
  },
  failureText: {
    color: '#851919',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: Fonts.body,
  },
  confirmButton: {
    backgroundColor: '#DA583B',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: Fonts.body,
  },
  notificationSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 13,
    color: '#222126',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Fonts.body,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#222126',
    fontFamily: Fonts.body,
  },
});
