const BASE_URL = process.env.EXPO_PUBLIC_NGROK_URL;

export async function loginCustomer(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

// All endpoints return { message, data } — unwrap .data before returning.

export async function getRestaurants(token: string) {
  const response = await fetch(`${BASE_URL}/api/restaurants`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch restaurants');
  }

  const json = await response.json();
  return json.data;
}

// Fetches the details (name, price_range, rating) for a single restaurant.
// Restaurant info is NOT embedded in the products response — it requires a separate call.
export async function getRestaurant(id: string, token: string) {
  const response = await fetch(`${BASE_URL}/api/restaurants/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch restaurant');
  }

  const json = await response.json();
  return json.data;
}

// Fetches the menu items (products) for a restaurant.
// Endpoint: GET /api/restaurants/:id/products
export async function getRestaurantProducts(id: string, token: string) {
  const response = await fetch(`${BASE_URL}/api/restaurants/${id}/products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }

  const json = await response.json();
  return json.data;
}

type OrderProduct = { product_id: number; quantity: number };

type OrderPayload = {
  customer_id: number;
  restaurant_id: number;
  products: OrderProduct[];
};

export async function createOrder(payload: OrderPayload, token: string) {
  const response = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
}
