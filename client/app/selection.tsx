import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faCar } from '@fortawesome/free-solid-svg-icons';
import { Fonts } from '../constants/fonts';
import { faTaxi } from '@fortawesome/free-solid-svg-icons/faTaxi';

export default function SelectionScreen() {
  const handleSelectCustomer = async () => {
    await AsyncStorage.setItem('role', 'customer');
    router.replace('/customer');
  };

  const handleSelectCourier = async () => {
    await AsyncStorage.setItem('role', 'courier');
    router.replace('/courier');
  };

  return (
    <View style={styles.screen}>
      <Image
        source={require('../assets/images/logo2.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.middle}>
        <Text style={styles.heading}>Select Account Type</Text>

        <View style={styles.cardsRow}>
          <TouchableOpacity style={styles.card} onPress={handleSelectCustomer}>
            <FontAwesomeIcon icon={faUser} size={160} color="#DA583B" />
            <Text style={styles.cardLabel}>Customer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={handleSelectCourier}>
            <FontAwesomeIcon icon={faTaxi} size={160} color="#222126" />
            <Text style={styles.cardLabel}>Courier</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    padding: 24,
  },
  middle: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 240,
  },
  logo: {
    width: 220,
    height: 100,
    marginBottom: 40,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: '#222126',
    marginBottom: 32,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardLabel: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: '#222126',
    marginTop: 12,
  },
});
