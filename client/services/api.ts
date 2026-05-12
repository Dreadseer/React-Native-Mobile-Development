import { API_BASE_URL } from '@env';

export async function loginCustomer(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}
