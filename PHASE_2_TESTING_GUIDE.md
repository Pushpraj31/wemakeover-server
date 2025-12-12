# 🧪 Phase 2 Testing Guide - MOV Middleware

## ✅ Phase 2 Complete!

The `checkMinimumOrderValue` middleware is now integrated into the booking creation flow.

---

## 🎯 What Was Implemented

### 1. Middleware Created
**File:** `server/src/middlewares/booking.middleware.js`

**Function:** `checkMinimumOrderValue`

**Features:**
- ✅ Fetches MOV from cache/database
- ✅ Calculates order subtotal from services
- ✅ Compares subtotal with MOV
- ✅ Returns semantic error if MOV not met
- ✅ Allows booking if MOV is met
- ✅ Fail-safe design (allows booking if config missing)

### 2. Route Integration
**File:** `server/src/routes/booking.routes.js`

**Route:** `POST /api/bookings`

**Middleware Chain:**
```javascript
router.post('/',
  sanitizeBookingData,        // Clean input
  validateBookingCreation,    // Validate fields
  checkMinimumOrderValue,     // ⬅️ NEW: Check MOV
  createBooking               // Create booking
);
```

---

## 🧪 How to Test

### Test 1: Order Below MOV (Should Fail) ❌

**Request:**
```
POST http://localhost:3000/api/bookings
```

**Headers:**
```
Cookie: accessToken=<your_token>
Content-Type: application/json
```

**Body:**
```json
{
  "services": [
    {
      "name": "Basic Facial",
      "description": "Simple facial treatment",
      "price": 500,
      "quantity": 1,
      "category": "Regular",
      "duration": 45
    }
  ],
  "bookingDetails": {
    "date": "2025-12-01",
    "slot": "10:00 AM",
    "duration": 45,
    "address": {
      "houseFlatNumber": "123",
      "streetAreaName": "MG Road",
      "completeAddress": "123, MG Road, Gaya, Bihar, 823001",
      "city": "Gaya",
      "state": "Bihar",
      "pincode": "823001",
      "phone": "9876543210"
    }
  },
  "pricing": {
    "subtotal": 500,
    "taxAmount": 90,
    "totalAmount": 590,
    "currency": "INR"
  }
}
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Minimum order value of ₹999 is required to place a booking.",
  "error": "MINIMUM_ORDER_VALUE_NOT_MET",
  "details": {
    "currentOrderValue": 500,
    "minimumOrderValue": 999,
    "shortfall": 499,
    "currency": "INR",
    "message": "Please add services worth ₹499 more to proceed with your booking."
  }
}
```

**Server Logs:**
```
🔍 [MOV CHECK] Starting minimum order value validation...
✅ [MOV CHECK] MOV config loaded: ₹999 (source: cache)
💰 [MOV CHECK] Order subtotal: ₹500
❌ [MOV CHECK] Order rejected - Subtotal (₹500) < MOV (₹999)
```

---

### Test 2: Order Exactly at MOV (Should Pass) ✅

**Request:**
```
POST http://localhost:3000/api/bookings
```

**Body:**
```json
{
  "services": [
    {
      "name": "Premium Facial",
      "description": "Luxury facial treatment",
      "price": 999,
      "quantity": 1,
      "category": "Regular",
      "duration": 60
    }
  ],
  "bookingDetails": {
    "date": "2025-12-01",
    "slot": "10:00 AM",
    "duration": 60,
    "address": {
      "houseFlatNumber": "123",
      "streetAreaName": "MG Road",
      "completeAddress": "123, MG Road, Gaya, Bihar, 823001",
      "city": "Gaya",
      "state": "Bihar",
      "pincode": "823001",
      "phone": "9876543210"
    }
  },
  "pricing": {
    "subtotal": 999,
    "taxAmount": 180,
    "totalAmount": 1179,
    "currency": "INR"
  }
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "orderNumber": "BOOK-2025-...",
    "services": [...],
    "bookingDetails": {...},
    "pricing": {
      "subtotal": 999,
      "taxAmount": 180,
      "totalAmount": 1179,
      "currency": "INR"
    },
    "status": "pending",
    "paymentStatus": "pending",
    ...
  },
  "message": "Booking created successfully"
}
```

**Server Logs:**
```
🔍 [MOV CHECK] Starting minimum order value validation...
✅ [MOV CHECK] MOV config loaded: ₹999 (source: cache)
💰 [MOV CHECK] Order subtotal: ₹999
✅ [MOV CHECK] Validation passed - Subtotal (₹999) >= MOV (₹999)
```

---

### Test 3: Order Above MOV (Should Pass) ✅

**Request:**
```
POST http://localhost:3000/api/bookings
```

**Body:**
```json
{
  "services": [
    {
      "name": "Cleanup",
      "description": "Deep cleansing facial",
      "price": 599,
      "quantity": 1,
      "category": "Regular",
      "duration": 45
    },
    {
      "name": "Anti-Ageing Facial",
      "description": "Premium anti-ageing treatment",
      "price": 810,
      "quantity": 1,
      "category": "Regular",
      "duration": 60
    }
  ],
  "bookingDetails": {
    "date": "2025-12-01",
    "slot": "10:00 AM",
    "duration": 105,
    "address": {
      "houseFlatNumber": "123",
      "streetAreaName": "MG Road",
      "completeAddress": "123, MG Road, Gaya, Bihar, 823001",
      "city": "Gaya",
      "state": "Bihar",
      "pincode": "823001",
      "phone": "9876543210"
    }
  },
  "pricing": {
    "subtotal": 1409,
    "taxAmount": 254,
    "totalAmount": 1663,
    "currency": "INR"
  }
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "orderNumber": "BOOK-2025-...",
    "services": [
      {
        "name": "Cleanup",
        "price": 599,
        "quantity": 1,
        ...
      },
      {
        "name": "Anti-Ageing Facial",
        "price": 810,
        "quantity": 1,
        ...
      }
    ],
    "pricing": {
      "subtotal": 1409,
      "taxAmount": 254,
      "totalAmount": 1663,
      "currency": "INR"
    },
    ...
  },
  "message": "Booking created successfully"
}
```

**Server Logs:**
```
🔍 [MOV CHECK] Starting minimum order value validation...
✅ [MOV CHECK] MOV config loaded: ₹999 (source: cache)
💰 [MOV CHECK] Order subtotal: ₹1409
✅ [MOV CHECK] Validation passed - Subtotal (₹1409) >= MOV (₹999)
```

---

### Test 4: MOV Deactivated (Should Pass Even if Below) ✅

**Step 1: Deactivate MOV**
```
PATCH http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE/toggle
```

**Step 2: Try booking with low amount**
```
POST http://localhost:3000/api/bookings
Body: { services with subtotal = 500 }
```

**Expected:** Booking created successfully (MOV check skipped)

**Server Logs:**
```
🔍 [MOV CHECK] Starting minimum order value validation...
⚠️ [MOV CHECK] MOV config not found or inactive, skipping validation
```

**Step 3: Reactivate MOV**
```
PATCH http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE/toggle
```

---

### Test 5: Multiple Services (Should Calculate Correctly) ✅

**Request:**
```json
{
  "services": [
    {
      "name": "Service A",
      "price": 300,
      "quantity": 2,
      ...
    },
    {
      "name": "Service B",
      "price": 200,
      "quantity": 2,
      ...
    }
  ],
  ...
}
```

**Calculation:**
- Service A: 300 × 2 = 600
- Service B: 200 × 2 = 400
- **Total: 1000**

**Expected:** ✅ Booking created (1000 >= 999)

---

## 📊 Test Results Matrix

| Test Case | Subtotal | MOV | MOV Active | Expected Result | Status Code |
|-----------|----------|-----|------------|-----------------|-------------|
| Below MOV | ₹500 | ₹999 | Yes | ❌ Rejected | 400 |
| Exactly MOV | ₹999 | ₹999 | Yes | ✅ Created | 201 |
| Above MOV | ₹1409 | ₹999 | Yes | ✅ Created | 201 |
| Below MOV (Inactive) | ₹500 | ₹999 | No | ✅ Created | 201 |
| Multiple Services | ₹1000 | ₹999 | Yes | ✅ Created | 201 |

---

## 🔍 What to Check

### In Server Logs
```
✅ MOV config loaded: ₹999 (source: cache)
✅ Order subtotal: ₹1409
✅ Validation passed
```

### In Postman Response
```json
{
  "success": false,
  "error": "MINIMUM_ORDER_VALUE_NOT_MET",
  "details": {
    "currentOrderValue": 500,
    "minimumOrderValue": 999,
    "shortfall": 499
  }
}
```

### In MongoDB
```javascript
// Check if booking was created
db.bookings.find().sort({ createdAt: -1 }).limit(1)

// If MOV not met, no booking should exist
// If MOV met, booking should exist with correct pricing
```

---

## 🎯 Success Criteria

- [ ] Test 1 (Below MOV) returns 400 error
- [ ] Test 2 (Exactly MOV) creates booking
- [ ] Test 3 (Above MOV) creates booking
- [ ] Test 4 (MOV inactive) allows booking
- [ ] Test 5 (Multiple services) calculates correctly
- [ ] Error messages are clear and actionable
- [ ] Server logs show MOV validation steps
- [ ] Cache is being used (source: "cache")

---

## 🐛 Troubleshooting

### Problem: MOV check not running
**Solution:**
1. Check middleware is imported in routes
2. Check middleware is in correct order
3. Restart server

### Problem: Always getting "MOV not found"
**Solution:**
1. Verify configs were seeded
2. Check `db.bookingconfigs.find()`
3. Verify `isActive: true`

### Problem: Cache always misses
**Solution:**
1. Check Redis is running
2. First request will always be cache miss
3. Second request should be cache hit

### Problem: Calculation wrong
**Solution:**
1. Check service prices are numbers
2. Check quantities are integers
3. Verify middleware calculates: price × quantity

---

## 🎉 Phase 2 Complete When...

✅ All 5 test cases pass  
✅ Error messages are clear  
✅ Server logs show validation  
✅ Bookings blocked when below MOV  
✅ Bookings allowed when above MOV  

---

## 📝 Next Steps

Once Phase 2 testing is complete:

**Phase 3:** Frontend Integration
- Fetch MOV on checkout page load
- Display warning if order below MOV
- Disable "Pay Now" button if not met
- Show shortfall amount to user

---

**Ready to test? Start with Test 1!** 🚀

