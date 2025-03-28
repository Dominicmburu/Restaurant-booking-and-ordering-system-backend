Here's a comprehensive set of test data for all the controllers in your TurkNazz restaurant application. You can use this in Postman to test your API endpoints.

## Authentication Test Data

### Register User
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "Password123!",
  "phone": "07700900000"
}
```

### Login
```json
{
  "email": "testuser@example.com",
  "password": "Password123!"
}
```

### Admin Login
```json
{
  "email": "admin@turknazz.com",
  "password": "adminpassword"
}
```

## User Management Test Data

### Create User (Admin)
```json
{
  "name": "Staff Member",
  "email": "staff@turknazz.com",
  "password": "StaffPass123!",
  "phone": "07700900001",
  "role": "STAFF"
}
```

### Update User
```json
{
  "name": "Updated Name",
  "phone": "07700900002"
}
```

### Update Password
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

### Forgot Password
```json
{
  "email": "testuser@example.com"
}
```

### Reset Password
```json
{
  "password": "ResetPassword123!"
}
```

## Restaurant Test Data

### Create Restaurant (Admin)
```json
{
  "name": "TurkNazz Edgbaston",
  "address": "45 High Street",
  "city": "Birmingham",
  "postcode": "B15 3DP",
  "phone": "01212345681",
  "email": "edgbaston@turknazz.com",
  "maxSeating": 55,
  "openTime": "11:00",
  "closeTime": "23:00"
}
```

### Update Restaurant
```json
{
  "openTime": "10:00",
  "closeTime": "23:30",
  "phone": "01212345682"
}
```

## Menu Test Data

### Create Menu Item
```json
{
  "name": "Iskender Kebab",
  "description": "Sliced döner kebab meat served on pieces of pita bread with yogurt and tomato sauce",
  "price": 16.99,
  "image": "https://i.pinimg.com/736x/a1/a2/a3/a1a2a3f4a5a6a7a8a9a0b1b2b3b4b5b6.jpg",
  "category": "kebabs",
  "isPopular": true,
  "isVegetarian": false,
  "isVegan": false,
  "isGlutenFree": false,
  "restaurantId": "<<restaurant_id>>"
}
```

### Update Menu Item
```json
{
  "price": 17.99,
  "isPopular": true,
  "description": "Tender sliced döner kebab meat served on pieces of freshly baked pita bread with creamy yogurt and rich tomato sauce"
}
```

## Table Test Data

### Create Table
```json
{
  "tableNumber": 15,
  "capacity": 6,
  "restaurantId": "<<restaurant_id>>"
}
```

### Update Table
```json
{
  "capacity": 8,
  "isAvailable": true
}
```

## Booking Test Data

### Check Availability
```json
{
  "restaurantId": "<<restaurant_id>>",
  "date": "2025-04-10", 
  "time": "19:00",
  "guests": 4
}
```

### Create Booking (Unauthenticated)
```json
{
  "restaurantId": "<<restaurant_id>>",
  "date": "2025-04-10",
  "time": "19:00",
  "guests": 4,
  "tableId": "<<table_id>>",
  "specialRequests": "Window seat if possible",
  "customer": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "07700900003"
  }
}
```

### Create Booking (Authenticated)
```json
{
  "restaurantId": "<<restaurant_id>>",
  "date": "2025-04-10",
  "time": "19:00",
  "guests": 4,
  "tableId": "<<table_id>>",
  "specialRequests": "Window seat if possible"
}
```

### Update Booking Status (Admin)
```json
{
  "status": "CONFIRMED"
}
```

### Cancel Booking
```json
{} 
```

## Order Test Data

### Create Order (Unauthenticated)
```json
{
  "restaurantId": "<<restaurant_id>>",
  "orderType": "DELIVERY",
  "deliveryFee": 2.99,
  "tip": 3.00,
  "address": "123 Main Street",
  "addressDetails": "Apartment 4B",
  "city": "Birmingham",
  "postcode": "B1 1AA",
  "notes": "Please ring doorbell twice",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "07700900004"
  },
  "items": [
    {
      "menuItemId": "<<menu_item_id_1>>",
      "quantity": 2,
      "notes": "Extra sauce please"
    },
    {
      "menuItemId": "<<menu_item_id_2>>",
      "quantity": 1
    },
    {
      "menuItemId": "<<menu_item_id_3>>",
      "quantity": 3
    }
  ]
}
```

### Create Order (Pickup)
```json
{
  "restaurantId": "<<restaurant_id>>",
  "orderType": "PICKUP",
  "scheduledTime": "2025-04-10T18:30:00.000Z",
  "notes": "Will arrive at 6:30pm",
  "customer": {
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "07700900005"
  },
  "items": [
    {
      "menuItemId": "<<menu_item_id_1>>",
      "quantity": 1
    },
    {
      "menuItemId": "<<menu_item_id_2>>",
      "quantity": 2
    }
  ]
}
```

### Update Order Status (Admin/Staff)
```json
{
  "status": "CONFIRMED"
}
```

## Setting Up Postman

To use these test data in Postman, follow these steps:

1. **Create a Collection**: Create a new collection named "TurkNazz API"

2. **Create Environment Variables**: Set up an environment with these variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (leave empty initially, will be set after login)
   - `restaurant_id`: (leave empty initially)
   - `table_id`: (leave empty initially)
   - `menu_item_id_1`: (leave empty initially)
   - `menu_item_id_2`: (leave empty initially)
   - `menu_item_id_3`: (leave empty initially)
   - `booking_id`: (leave empty initially)
   - `order_id`: (leave empty initially)

3. **Create Request Folders**: Organize your requests into folders like:
   - Auth
   - Users
   - Restaurants
   - Menu
   - Tables
   - Bookings
   - Orders

4. **Set Authentication**: For protected routes, use Bearer Token authentication with the variable `{{token}}`

5. **Create Pre-request Script**: For the login request, add this pre-request script to automatically save the token:
```javascript
pm.test("Set auth token", function () {
    var jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
    }
});
```

6. **Create Scripts for IDs**: For GET requests, add this script to save IDs:
```javascript
// For getting restaurant ID
pm.test("Set restaurant ID", function () {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.length > 0) {
        pm.environment.set("restaurant_id", jsonData.data[0].id);
    }
});

// Similar scripts for other IDs
```

7. **Test Chain**: Create a test chain (collection runner) that:
   - Registers a user
   - Logs in 
   - Gets restaurants
   - Gets menu items
   - Creates a booking
   - Creates an order
   - etc.

This comprehensive test data will help you verify that all your API endpoints are working correctly. You can extend or modify the data as needed to test specific edge cases or business requirements.



# TurkNazz API Test Data for Stripe Integration

Here's a comprehensive set of test data for testing the Stripe payment integration in your TurkNazz restaurant application:

## 1. Create Order with Card Payment

**Endpoint**: `POST /api/orders`  
**Method**: `POST`  

**Request Body**:
```json
{
  "items": [
    {
      "menuItemId": "00e8da92-c27a-4a4d-a4e1-98d7c83e1b95",
      "quantity": 2,
      "notes": "Extra spicy please"
    },
    {
      "menuItemId": "12d93f5c-511a-4cf9-a90c-e8504d6b7f01",
      "quantity": 1,
      "notes": "No onions"
    }
  ],
  "restaurantId": "8f42e61b-817a-4333-95a3-c99b3b177f4a",
  "orderType": "DELIVERY",
  "deliveryFee": 2.99,
  "tip": 2.50,
  "address": "123 Main Street",
  "addressDetails": "Apartment 4B",
  "city": "Birmingham",
  "postcode": "B1 1AA",
  "notes": "Please ring doorbell twice",
  "paymentMethod": "CARD",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "07700900004"
  }
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62",
      "orderNumber": "ORD-1234567",
      "status": "PENDING",
      "total": "27.97",
      "deliveryFee": "2.99",
      "tip": "2.50",
      "orderType": "DELIVERY",
      "address": "123 Main Street",
      "addressDetails": "Apartment 4B",
      "city": "Birmingham",
      "postcode": "B1 1AA",
      "notes": "Please ring doorbell twice",
      "paymentMethod": "CARD",
      "paymentStatus": "PENDING",
      "stripeSessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
      "restaurant": {
        "id": "8f42e61b-817a-4333-95a3-c99b3b177f4a",
        "name": "TurkNazz Shirley",
        "address": "148-150 Stratford Road",
        "city": "Birmingham",
        "postcode": "B90 3BD"
      },
      "orderItems": [
        {
          "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
          "quantity": 2,
          "price": "11.24",
          "notes": "Extra spicy please",
          "menuItem": {
            "id": "00e8da92-c27a-4a4d-a4e1-98d7c83e1b95",
            "name": "Adana Kebab",
            "description": "Juicy minced lamb kebab, grilled to perfection and served with rice and grilled vegetables."
          }
        },
        {
          "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
          "quantity": 1,
          "price": "11.24",
          "notes": "No onions",
          "menuItem": {
            "id": "12d93f5c-511a-4cf9-a90c-e8504d6b7f01",
            "name": "Chicken Shish Kebab",
            "description": "Succulent marinated chicken cubes grilled on skewers, served with pita bread and a side of salad."
          }
        }
      ]
    },
    "payment": {
      "requiresAction": true,
      "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
      "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
    }
  }
}
```

## 2. Create Order with Cash Payment

**Endpoint**: `POST /api/orders`  
**Method**: `POST`  

**Request Body**:
```json
{
  "items": [
    {
      "menuItemId": "00e8da92-c27a-4a4d-a4e1-98d7c83e1b95",
      "quantity": 1,
      "notes": ""
    },
    {
      "menuItemId": "5f9a2b88-7c63-4f1d-9e19-b8a52d3af01c",
      "quantity": 2,
      "notes": "Extra cheese"
    }
  ],
  "restaurantId": "8f42e61b-817a-4333-95a3-c99b3b177f4a",
  "orderType": "PICKUP",
  "deliveryFee": 0,
  "tip": 1.00,
  "notes": "Will pick up at 7:30pm",
  "paymentMethod": "CASH",
  "customer": {
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "07700900005"
  }
}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "cd5e2d9b-6da2-5e8c-c0ed-g84d4c6e8e73",
      "orderNumber": "ORD-2345678",
      "status": "CONFIRMED",
      "total": "24.22",
      "deliveryFee": "0",
      "tip": "1.00",
      "orderType": "PICKUP",
      "notes": "Will pick up at 7:30pm",
      "paymentMethod": "CASH",
      "paymentStatus": "PAID",
      "restaurant": {
        "id": "8f42e61b-817a-4333-95a3-c99b3b177f4a",
        "name": "TurkNazz Shirley",
        "address": "148-150 Stratford Road",
        "city": "Birmingham",
        "postcode": "B90 3BD"
      },
      "orderItems": [
        {
          "id": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
          "quantity": 1,
          "price": "11.24",
          "notes": "",
          "menuItem": {
            "id": "00e8da92-c27a-4a4d-a4e1-98d7c83e1b95",
            "name": "Adana Kebab",
            "description": "Juicy minced lamb kebab, grilled to perfection and served with rice and grilled vegetables."
          }
        },
        {
          "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
          "quantity": 2,
          "price": "11.99",
          "notes": "Extra cheese",
          "menuItem": {
            "id": "5f9a2b88-7c63-4f1d-9e19-b8a52d3af01c",
            "name": "Turkish Pide",
            "description": "A Turkish-style pizza with a soft, thin crust, topped with your choice of meat, cheese, and vegetables."
          }
        }
      ]
    },
    "payment": {
      "requiresAction": false
    }
  }
}
```

## 3. Verify Payment Session

**Endpoint**: `GET /api/payments/verify-session/:sessionId`  
**Method**: `GET`  
**Example**: `GET /api/payments/verify-session/cs_test_a1b2c3d4e5f6g7h8i9j0`  

**Expected Response (Payment Pending)**:
```json
{
  "success": true,
  "data": {
    "paymentStatus": "unpaid",
    "isComplete": false,
    "customer": null,
    "orderId": "ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62"
  }
}
```

**Expected Response (Payment Complete)**:
```json
{
  "success": true,
  "data": {
    "paymentStatus": "paid",
    "isComplete": true,
    "customer": {
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "07700900004"
    },
    "orderId": "ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62",
    "order": {
      "id": "ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62",
      "orderNumber": "ORD-1234567",
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "total": "27.97",
      "orderType": "DELIVERY",
      "restaurant": {
        "name": "TurkNazz Shirley",
        "address": "148-150 Stratford Road",
        "city": "Birmingham",
        "postcode": "B90 3BD"
      },
      "orderItems": [
        // Order items data
      ]
    }
  }
}
```

## 4. Handle Payment Success Redirect

**Endpoint**: `POST /api/orders/:id/payment-success`  
**Method**: `POST`  
**Example**: `POST /api/orders/ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62/payment-success`  

**Request Body**:
```json
{
  "session_id": "cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Payment redirect received, please verify session status",
  "data": {
    "orderId": "ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62",
    "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0"
  }
}
```

## 5. Handle Payment Cancel

**Endpoint**: `POST /api/orders/:id/payment-cancel`  
**Method**: `POST`  
**Example**: `POST /api/orders/ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62/payment-cancel`  

**Request Body**:
```json
{}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Payment cancelled",
  "data": {
    "id": "ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62",
    "orderNumber": "ORD-1234567",
    "status": "CANCELLED",
    "paymentStatus": "FAILED",
    "total": "27.97",
    "deliveryFee": "2.99",
    "tip": "2.50",
    "orderType": "DELIVERY",
    "paymentMethod": "CARD",
    "stripeSessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0"
  }
}
```

## 6. Get Order Details

**Endpoint**: `GET /api/orders/:id`  
**Method**: `GET`  
**Example**: `GET /api/orders/ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62`  
**Authorization**: Bearer Token required  

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62",
    "orderNumber": "ORD-1234567",
    "status": "CONFIRMED",
    "total": "27.97",
    "deliveryFee": "2.99",
    "tip": "2.50",
    "orderType": "DELIVERY",
    "address": "123 Main Street",
    "addressDetails": "Apartment 4B",
    "city": "Birmingham",
    "postcode": "B1 1AA",
    "notes": "Please ring doorbell twice",
    "paymentMethod": "CARD",
    "paymentStatus": "PAID",
    "stripeSessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
    "createdAt": "2025-03-26T14:32:15.123Z",
    "updatedAt": "2025-03-26T14:35:22.456Z",
    "restaurant": {
      "id": "8f42e61b-817a-4333-95a3-c99b3b177f4a",
      "name": "TurkNazz Shirley",
      "address": "148-150 Stratford Road",
      "city": "Birmingham",
      "postcode": "B90 3BD",
      "phone": "01212345678"
    },
    "orderItems": [
      {
        "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
        "quantity": 2,
        "price": "11.24",
        "notes": "Extra spicy please",
        "menuItem": {
          "id": "00e8da92-c27a-4a4d-a4e1-98d7c83e1b95",
          "name": "Adana Kebab",
          "description": "Juicy minced lamb kebab, grilled to perfection and served with rice and grilled vegetables."
        }
      },
      {
        "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
        "quantity": 1,
        "price": "11.24",
        "notes": "No onions",
        "menuItem": {
          "id": "12d93f5c-511a-4cf9-a90c-e8504d6b7f01",
          "name": "Chicken Shish Kebab",
          "description": "Succulent marinated chicken cubes grilled on skewers, served with pita bread and a side of salad."
        }
      }
    ]
  }
}
```

## 7. Get All Orders (Admin Only)

**Endpoint**: `GET /api/orders`  
**Method**: `GET`  
**Authorization**: Bearer Token with Admin privileges required  

**Expected Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "ad4e1c8a-5c91-4d7b-b9ed-f73c3b5e7d62",
      "orderNumber": "ORD-1234567",
      "status": "CONFIRMED",
      "total": "27.97",
      "paymentMethod": "CARD",
      "paymentStatus": "PAID",
      "orderType": "DELIVERY",
      "createdAt": "2025-03-26T14:32:15.123Z"
    },
    {
      "id": "cd5e2d9b-6da2-5e8c-c0ed-g84d4c6e8e73",
      "orderNumber": "ORD-2345678",
      "status": "CONFIRMED",
      "total": "24.22",
      "paymentMethod": "CASH",
      "paymentStatus": "PAID",
      "orderType": "PICKUP",
      "createdAt": "2025-03-26T15:42:10.789Z"
    }
  ]
}
```

## Postman Environment Variables

To use these test data effectively, set up the following environment variables in Postman:

```
base_url: http://localhost:5000/api
token: (set after login)
restaurant_id: 8f42e61b-817a-4333-95a3-c99b3b177f4a
menu_item_id_1: 00e8da92-c27a-4a4d-a4e1-98d7c83e1b95
menu_item_id_2: 12d93f5c-511a-4cf9-a90c-e8504d6b7f01
menu_item_id_3: 5f9a2b88-7c63-4f1d-9e19-b8a52d3af01c
order_id: (set after order creation)
session_id: (set after order creation with card payment)
```

## Test Workflow

1. Create an order with card payment
2. Save the order ID and session ID from the response
3. (Open the Stripe Checkout URL in a browser for manual testing)
4. Verify the payment session status using the session ID
5. Simulate payment success by calling the payment-success endpoint
6. Get the order details to confirm the status is updated to CONFIRMED and payment status is PAID
7. Create another order with cash payment
8. Verify the order status is immediately set to CONFIRMED and payment status is PAID

## Stripe Test Cards

When testing the Stripe checkout flow in a browser, use these test card numbers:

- **Successful payment**: 4242 4242 4242 4242
- **Authentication required**: 4000 0025 0000 3155
- **Payment declined**: 4000 0000 0000 9995

For all cards:
- Any future expiry date
- Any 3-digit CVC
- Any postal code

These test data should provide comprehensive coverage for testing your Stripe integration without webhooks. The flow relies on client-side redirects and server-side verification, making it simpler to test and debug.



{
  "orderCreateSample": {
    "restaurantId": "YOUR_RESTAURANT_UUID_HERE",
    "orderType": "DELIVERY",
    "items": [
      {
        "menuItemId": "MENU_ITEM_UUID_1",
        "quantity": 2,
        "notes": "Extra sauce please"
      },
      {
        "menuItemId": "MENU_ITEM_UUID_2", 
        "quantity": 1,
        "notes": "No onions"
      }
    ],
    "deliveryFee": 2.50,
    "tip": 3.00,
    "address": "123 Test Street",
    "addressDetails": "Apartment 4B",
    "city": "Birmingham",
    "postcode": "B13 8DD",
    "scheduledTime": "2024-04-15T18:30:00Z",
    "notes": "Please ring doorbell",
    "paymentMethod": "CARD",
    "customer": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "07123456789"
    }
  },
  "orderCreateCashSample": {
    "restaurantId": "YOUR_RESTAURANT_UUID_HERE",
    "orderType": "PICKUP",
    "items": [
      {
        "menuItemId": "MENU_ITEM_UUID_3",
        "quantity": 1
      }
    ],
    "total": 12.99,
    "paymentMethod": "CASH",
    "customer": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com"
    }
  }
}

when buying you have to order food that are specific to that restaurant. The restaurant has a menu that is specific to that restaurant. The menu items are specific to that restaurant. The restaurant has a specific location. The restaurant has a specific name. The restaurant has