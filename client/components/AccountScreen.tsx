import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { getAccountDetails, updateAccountDetails } from '../services/api';
import { Fonts } from '../constants/fonts';

// Confirmed GET /api/account/{id} response shape:
// { id, name, email, customer: { id, email, phone, address } }
// For courier: { id, name, email, courier: { id, email, phone, ... } }
// data.email          → primary login email (read-only)
// data[type].email    → role-specific email (editable)
// data[type].phone    → role-specific phone (editable)

type Props = {
  type: 'customer' | 'courier';
  userId: number;
  token: string;
};

const roleLabel = { customer: 'Customer', courier: 'Courier' };

export default function AccountScreen({ type, userId, token }: Props) {
  const [primaryEmail, setPrimaryEmail] = useState('');
  const [typeEmail, setTypeEmail] = useState('');
  const [typePhone, setTypePhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const label = roleLabel[type];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAccountDetails(userId, token);
        const roleData = data[type]; // data.customer or data.courier
        setPrimaryEmail(data.email ?? '');
        setTypeEmail(roleData?.email ?? '');
        setTypePhone(roleData?.phone ?? '');
      } catch {
        setErrorMessage('Failed to load account details.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId, token]);

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleUpdate = async () => {
    if (!typeEmail.trim() || !typePhone.trim()) {
      setErrorMessage('Email and phone are required.');
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      await updateAccountDetails(userId, type, typeEmail, typePhone, token);
      setSuccessMessage('Account updated successfully.');
    } catch {
      setErrorMessage('Failed to update account. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DA583B" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>MY ACCOUNT</Text>
      <Text style={styles.subheading}>Logged In As: {label}</Text>

      {/* Primary Email — read only */}
      <Text style={styles.label}>Primary Email (Read Only)</Text>
      <TextInput
        style={[styles.input, styles.inputReadOnly]}
        value={primaryEmail}
        editable={false}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.helper}>Email used to log in to the application.</Text>

      {/* Role email */}
      <Text style={styles.label}>{label} Email</Text>
      <TextInput
        style={styles.input}
        value={typeEmail}
        onChangeText={(v) => { setTypeEmail(v); clearMessages(); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.helper}>Email used for your {label} account.</Text>

      {/* Role phone */}
      <Text style={styles.label}>{label} Phone</Text>
      <TextInput
        style={styles.input}
        value={typePhone}
        onChangeText={(v) => { setTypePhone(v); clearMessages(); }}
        keyboardType="phone-pad"
      />
      <Text style={styles.helper}>Phone number for your {label} account.</Text>

      <TouchableOpacity
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={handleUpdate}
        disabled={isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving ? 'SAVING…' : 'UPDATE ACCOUNT'}
        </Text>
      </TouchableOpacity>

      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: '#222126',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#888',
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222126',
    marginBottom: 6,
  },
  inputReadOnly: {
    backgroundColor: '#F0F0F0',
    color: '#888',
  },
  helper: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#DA583B',
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  successText: {
    color: '#609475',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    color: '#DA583B',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
