# City Validation Testing Guide

## Overview
This guide provides comprehensive testing scenarios for the city validation system.

## Prerequisites
1. MongoDB running with seeded serviceable cities (Gaya, Patna)
2. Server running on port 3000
3. Valid authentication token (for protected routes)

---

## Setup

### 1. Seed Database
```bash
cd server
node src/scripts/seedServiceableCities.js
```

### 2. Start Server
```bash
npm run dev
```

---

## Test Scenarios

### Scenario 1: Get Serviceable Cities (Public)

**Endpoint:** `GET /api/bookings/serviceable-cities`
**Auth:** Not required
**Expected:** List of active serviceable cities

```bash
curl -X GET http://localhost:3000/api/bookings/serviceable-cities
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "city": "Gaya",
      "state": "Bihar",
      "displayName": "Gaya, Bihar",
      "priority": 10
    },
    {
      "city": "Patna",
      "state": "Bihar",
      "displayName": "Patna, Bihar",
      "priority": 9
    }
  ],
  "count": 2,
  "message": "We currently serve 2 cities"
}
```

---

### Scenario 2: Check Serviceable City (Public)

#### Test 2A: Valid City (Gaya)

```bash
curl -X POST http://localhost:3000/api/bookings/check-serviceability \
  -H "Content-Type: application/json" \
  -d '{"city": "Gaya"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isServiceable": true,
    "requestedCity": "Gaya",
    "serviceableCities": ["Gaya", "Patna"],
    "serviceableCitiesDisplay": "Gaya and Patna",
    "message": "Great! We provide services in Gaya.",
    "totalServiceableCities": 2
  },
  "message": "Great! We provide services in Gaya."
}
```

#### Test 2B: Valid City (Patna, lowercase)

```bash
curl -X POST http://localhost:3000/api/bookings/check-serviceability \
  -H "Content-Type: application/json" \
  -d '{"city": "patna"}'
```

**Expected:** Same as 2A (case-insensitive matching)

#### Test 2C: Non-Serviceable City (Delhi)

```bash
curl -X POST http://localhost:3000/api/bookings/check-serviceability \
  -H "Content-Type: application/json" \
  -d '{"city": "Delhi"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isServiceable": false,
    "requestedCity": "Delhi",
    "serviceableCities": ["Gaya", "Patna"],
    "serviceableCitiesDisplay": "Gaya and Patna",
    "message": "We're coming to Delhi soon! Currently, our services are available in Gaya and Patna only.",
    "totalServiceableCities": 2
  },
  "message": "We're coming to Delhi soon! Currently, our services are available in Gaya and Patna only."
}
```

#### Test 2D: Missing City

```bash
curl -X POST http://localhost:3000/api/bookings/check-serviceability \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Please provide a valid city name",
  "code": "INVALID_CITY"
}
```

---

### Scenario 3: Online Payment with City Validation (Protected)

#### Test 3A: Valid City (Gaya) - Should Succeed

```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "services": [
      {
        "serviceId": "service123",
        "name": "Facial",
        "description": "Luxury facial treatment",
        "price": 500,
        "quantity": 1,
        "category": "facial",
        "duration": "60"
      }
    ],
    "pricing": {
      "subtotal": 500,
      "taxAmount": 90,
      "totalAmount": 590,
      "currency": "INR"
    },
    "booking": {
      "date": "2024-12-25",
      "slot": "10:00 AM",
      "duration": 60,
      "address": {
        "street": "MG Road",
        "city": "Gaya",
        "state": "Bihar",
        "pincode": "823001",
        "phone": "9876543210"
      }
    }
  }'
```

**Expected:** Payment order created successfully (200 OK)

#### Test 3B: Non-Serviceable City (Mumbai) - Should Fail

```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "services": [...],
    "pricing": {...},
    "booking": {
      "date": "2024-12-25",
      "slot": "10:00 AM",
      "duration": 60,
      "address": {
        "street": "Marine Drive",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "phone": "9876543210"
      }
    }
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "code": "CITY_NOT_SERVICEABLE",
  "error": "CITY_NOT_SERVICEABLE",
  "message": "We're coming to Mumbai soon! Currently, our services are available in Gaya and Patna only.",
  "data": {
    "requestedCity": "Mumbai",
    "isServiceable": false,
    "serviceableCities": ["Gaya", "Patna"],
    "serviceableCitiesDisplay": "Gaya and Patna",
    "totalServiceableCities": 2
  }
}
```

#### Test 3C: Missing City - Should Fail

```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "services": [...],
    "pricing": {...},
    "booking": {
      "date": "2024-12-25",
      "slot": "10:00 AM",
      "duration": 60,
      "address": {
        "street": "Some Street",
        "state": "Bihar",
        "pincode": "823001",
        "phone": "9876543210"
      }
    }
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "City information is required for booking. Please select or add a valid address.",
  "code": "CITY_REQUIRED",
  "error": "CITY_REQUIRED"
}
```

---

### Scenario 4: COD Order with City Validation (Protected)

#### Test 4A: Valid City (Patna) - Should Succeed

```bash
curl -X POST http://localhost:3000/api/payment/create-cod \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "services": [...],
    "pricing": {...},
    "booking": {
      "date": "2024-12-25",
      "slot": "2:00 PM",
      "duration": 60,
      "address": {
        "street": "Station Road",
        "city": "Patna",
        "state": "Bihar",
        "pincode": "800001",
        "phone": "9876543210"
      }
    }
  }'
```

**Expected:** COD order created successfully (200 OK)

#### Test 4B: Non-Serviceable City - Should Fail

Same as Test 3B but with `/api/payment/create-cod` endpoint

---

## Admin CRUD Operations (Protected)

### Admin Test 1: Get All Cities

```bash
curl -X GET http://localhost:3000/api/admin/serviceable-cities \
  -H "Authorization: Bearer ADMIN_AUTH_TOKEN"
```

### Admin Test 2: Create New City

```bash
curl -X POST http://localhost:3000/api/admin/serviceable-cities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_AUTH_TOKEN" \
  -d '{
    "city": "Ranchi",
    "state": "Jharkhand",
    "displayName": "Ranchi, Jharkhand",
    "priority": 5,
    "description": "Capital city of Jharkhand",
    "coveragePincodes": ["834001", "834002"]
  }'
```

### Admin Test 3: Toggle City Status

```bash
curl -X PATCH http://localhost:3000/api/admin/serviceable-cities/CITY_ID/toggle \
  -H "Authorization: Bearer ADMIN_AUTH_TOKEN"
```

### Admin Test 4: Delete City

```bash
curl -X DELETE http://localhost:3000/api/admin/serviceable-cities/CITY_ID \
  -H "Authorization: Bearer ADMIN_AUTH_TOKEN"
```

---

## Cache Testing

### Test Cache Behavior

1. Get serviceable cities (cache miss - queries database)
```bash
curl -X GET http://localhost:3000/api/bookings/serviceable-cities
# Check server logs: "🔄 [City Cache] Fetching fresh serviceable cities from database"
```

2. Get serviceable cities again within 5 minutes (cache hit)
```bash
curl -X GET http://localhost:3000/api/bookings/serviceable-cities
# Check server logs: "✅ [City Cache] Returning cached serviceable cities"
```

3. Add new city via admin panel (cache invalidated)
```bash
curl -X POST http://localhost:3000/api/admin/serviceable-cities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_AUTH_TOKEN" \
  -d '{"city": "Ranchi", "state": "Jharkhand"}'
# Check server logs: "🗑️ [City Cache] Cache invalidated"
```

4. Next request will be a cache miss
```bash
curl -X GET http://localhost:3000/api/bookings/serviceable-cities
# Check server logs: "🔄 [City Cache] Fetching fresh serviceable cities from database"
```

---

## Expected Behaviors

### ✅ Correct Behaviors
- Case-insensitive city matching ("gaya", "GAYA", "Gaya" all work)
- Proper error messages for non-serviceable cities
- Cache invalidation after admin updates
- Proper middleware blocking on payment/COD routes
- Public endpoints work without authentication

### ❌ Edge Cases to Test
- Empty string city name
- Very long city name (>100 characters)
- Special characters in city name
- SQL injection attempts
- Concurrent requests (cache race conditions)
- Mixed case spellings

---

## Performance Benchmarks

### Expected Response Times
- Get serviceable cities (cached): < 10ms
- Get serviceable cities (uncached): < 100ms
- Check serviceability: < 50ms
- Middleware validation: < 30ms

### Load Testing
```bash
# Test with Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/bookings/serviceable-cities
```

---

## Monitoring & Logs

### Log Patterns to Monitor

**Success:**
```
✅ [City Validation Middleware] City "Gaya" validated successfully
✅ [City Cache] Returning cached serviceable cities
```

**Failures:**
```
⚠️ [City Validation Middleware] Booking blocked for non-serviceable city: Mumbai
❌ [City Validation Middleware] No city provided in request
```

**Cache Operations:**
```
🔄 [City Cache] Fetching fresh serviceable cities from database
🗑️ [City Cache] Cache invalidated
✅ [City Cache] Cached 2 serviceable cities
```

---

## Troubleshooting

### Common Issues

1. **Middleware not working**
   - Check if middleware is added to route
   - Verify import path is correct
   - Check request body structure

2. **Cache not invalidating**
   - Verify `invalidateCityCache()` is called after admin operations
   - Check cache TTL (default: 5 minutes)

3. **Case sensitivity issues**
   - Verify pre-save middleware is capitalizing city names
   - Check regex patterns in queries

---

## Next Steps

After testing Phase 1, proceed to:
- **Phase 2:** Frontend integration
- **Phase 3:** Checkout validation
- **Phase 4:** Enhanced UX
- **Phase 5:** Production monitoring

---

## Notes

- All tests assume server running on `localhost:3000`
- Replace `YOUR_AUTH_TOKEN` with actual JWT token
- Admin routes need admin middleware (to be implemented)
- Cache TTL can be configured in `cityValidator.js`




