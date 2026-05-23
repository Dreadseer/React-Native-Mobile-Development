// Central API service — all fetch calls go through here using the Ngrok tunnel URL
const BASE_URL = process.env.EXPO_PUBLIC_NGROK_URL;

// Ngrok's free tier shows a browser interstitial unless this header is present.
// Safe to send on all platforms — React Native ignores unknown headers.
const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

export async function loginCustomer(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { ...BASE_HEADERS },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  return data;
}

// All endpoints return { message, data } — unwrap .data before returning.

export async function getRestaurants(token: string) {
  const response = await fetch(`${BASE_URL}/api/restaurants`, {
    method: 'GET',
    headers: {
      ...BASE_HEADERS,
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
      ...BASE_HEADERS,
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

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch menu items');
  }

  const json = await response.json();

  // API returns 'cost' — map to 'price' to match component expectations
  return json.data.map((p: any) => ({ ...p, price: p.cost }));
}

type OrderProduct = { product_id: number; quantity: number };

type OrderPayload = {
  customer_id: number;
  restaurant_id: number;
  products: OrderProduct[];
  sendSMS: boolean;
  sendEmail: boolean;
};

export async function getCustomerOrders(customerId: number, token: string) {
  const response = await fetch(`${BASE_URL}/api/orders?type=customer&id=${customerId}`, {
    method: 'GET',
    headers: {
      ...BASE_HEADERS,
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
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  return response.json();
}

export async function getPendingOrders(token: string) {
  const response = await fetch(`${BASE_URL}/api/orders/pending`, {
    method: 'GET',
    headers: {
      ...BASE_HEADERS,
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
      ...BASE_HEADERS,
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
      ...BASE_HEADERS,
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
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch account details');
  }

  const json = await response.json();
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
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, phone }),
  });

  if (!response.ok) {
    throw new Error('Failed to update account details');
  }

  return response.json();
}
