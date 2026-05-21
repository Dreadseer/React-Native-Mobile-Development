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

  const data = await response.json();
  console.log('=== AUTH RESPONSE ===', JSON.stringify(data, null, 2));
  return data;
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
// Endpoint: GET /api/products?restaurant={id}  (NOT /api/restaurants/:id/products)
// Maps API field 'cost' → 'price' so components don't need to know the API name.
export async function getRestaurantProducts(id: string, token: string) {
  const url = `${BASE_URL}/api/products?restaurant=${id}`;
  console.log('Fetching menu from:', url);

  const response = await fetch(url, {
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
  console.log('Menu API response:', JSON.stringify(json, null, 2));

  // API returns 'cost' — map to 'price' to match component expectations
  return json.data.map((p: any) => ({ ...p, price: p.cost }));
}

type OrderProduct = { product_id: number; quantity: number };

type OrderPayload = {
  customer_id: number;
  restaurant_id: number;
  products: OrderProduct[];
};

export async function getCustomerOrders(customerId: number, token: string) {
  const response = await fetch(`${BASE_URL}/api/orders?type=customer&id=${customerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const json = await response.json();
  return json.data;
}

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

export async function getOrderStatuses(token: string) {
  const response = await fetch(`${BASE_URL}/api/order-statuses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch order statuses');
  }

  const json = await response.json();
  return json.data;
}

export async function getPendingOrders(token: string) {
  const response = await fetch(`${BASE_URL}/api/orders/pending`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pending orders');
  }

  const json = await response.json();
  return json.data;
}

export async function getCourierOrders(courierId: number, token: string) {
  const response = await fetch(`${BASE_URL}/api/orders?type=courier&id=${courierId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch courier orders');
  }

  const json = await response.json();
  return json.data;
}

export async function updateOrderStatus(orderId: number, statusName: string, token: string) {
  const response = await fetch(`${BASE_URL}/api/order/${orderId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: statusName }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }

  return text ? JSON.parse(text) : null;
}

export async function getAccountDetails(userId: number, token: string) {
  const response = await fetch(`${BASE_URL}/api/account/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch account details');
  }

  const json = await response.json();
  console.log('=== ACCOUNT RESPONSE ===', JSON.stringify(json, null, 2));
  return json.data;
}

export async function updateAccountDetails(
  userId: number,
  type: string,
  email: string,
  phone: string,
  token: string
) {
  const response = await fetch(`${BASE_URL}/api/account/${userId}?type=${type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, phone }),
  });

  if (!response.ok) {
    throw new Error('Failed to update account details');
  }

  return response.json();
}
