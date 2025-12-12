# City Validation - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Seed the Database (1 minute)

```bash
cd server
node src/scripts/seedServiceableCities.js
```

**Expected Output:**
```
✅ [Seed] Successfully seeded serviceable cities:
   ✓ Gaya, Bihar (Priority: 10)
   ✓ Patna, Bihar (Priority: 9)
```

---

### Step 2: Start the Server (1 minute)

```bash
npm run dev
```

---

### Step 3: Test Public Endpoints (1 minute)

#### Get Serviceable Cities
```bash
curl http://localhost:3000/api/bookings/serviceable-cities
```

#### Check if City is Serviceable
```bash
# Valid city
curl -X POST http://localhost:3000/api/bookings/check-serviceability \
  -H "Content-Type: application/json" \
  -d '{"city": "Gaya"}'

# Invalid city
curl -X POST http://localhost:3000/api/bookings/check-serviceability \
  -H "Content-Type: application/json" \
  -d '{"city": "Mumbai"}'
```

---

### Step 4: Test Middleware Protection (2 minutes)

#### Create a Test Booking (Valid City - Gaya)

```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "services": [{"serviceId": "test", "name": "Facial", "description": "Test", "price": 500, "quantity": 1, "category": "facial", "duration": "60"}],
    "pricing": {"subtotal": 500, "taxAmount": 90, "totalAmount": 590, "currency": "INR"},
    "booking": {
      "date": "2024-12-25",
      "slot": "10:00 AM",
      "duration": 60,
      "address": {"street": "Test St", "city": "Gaya", "state": "Bihar", "pincode": "823001", "phone": "9876543210"}
    }
  }'
```

**Expected:** ✅ Payment order created

#### Try Booking with Invalid City (Mumbai)

```bash
# Same request but change city to "Mumbai"
```

**Expected:** ❌ Error with message:
```json
{
  "success": false,
  "code": "CITY_NOT_SERVICEABLE",
  "message": "We're coming to Mumbai soon! Currently, our services are available in Gaya and Patna only."
}
```

---

## 📋 Key Files Reference

| File | Purpose |
|------|---------|
| `models/serviceableCity.model.js` | Database schema |
| `utils/cityValidator.js` | Validation logic & caching |
| `middleware/validateServiceableCity.js` | Request validation |
| `controllers/serviceableCity.controller.js` | Public API endpoints |
| `controllers/admin/serviceableCity.admin.controller.js` | Admin CRUD |
| `routes/booking.routes.js` | Public routes |
| `routes/payment.routes.js` | Protected with middleware |
| `routes/admin/serviceableCity.admin.routes.js` | Admin routes |

---

## 🔧 Common Admin Operations

### Add New City
```bash
curl -X POST http://localhost:3000/api/admin/serviceable-cities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "city": "Ranchi",
    "state": "Jharkhand",
    "displayName": "Ranchi, Jharkhand",
    "priority": 5,
    "description": "Capital of Jharkhand",
    "coveragePincodes": ["834001", "834002"]
  }'
```

### List All Cities (Admin View)
```bash
curl -X GET http://localhost:3000/api/admin/serviceable-cities \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Toggle City Status (Activate/Deactivate)
```bash
curl -X PATCH http://localhost:3000/api/admin/serviceable-cities/CITY_ID/toggle \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🎯 Validation Flow

```
User Request
    ↓
Middleware: validateServiceableCity
    ├─ Extract city from request
    ├─ Check cache (< 10ms if cached)
    ├─ Query database if cache miss
    ├─ Validate city is active
    └─ Block if not serviceable
    ↓
Continue to payment/booking
```

---

## 📊 Monitoring

### Check Logs for Validation
```bash
# Success
✅ [City Validation Middleware] City "Gaya" validated successfully

# Blocked
⚠️ [City Validation Middleware] Booking blocked for non-serviceable city: Mumbai

# Cache
✅ [City Cache] Returning cached serviceable cities
🔄 [City Cache] Fetching fresh serviceable cities from database
```

---

## 🐛 Troubleshooting

### Issue: Middleware not blocking invalid cities
**Solution:** Check if middleware is added to route in `payment.routes.js`

### Issue: Cache not updating after admin changes
**Solution:** Verify `invalidateCityCache()` is called in admin controller

### Issue: "CITY_REQUIRED" error
**Solution:** Ensure `city` field exists in `booking.address.city` or `bookingDetails.address.city`

---

## 🔗 Quick Links

- **Full Testing Guide:** `CITY_VALIDATION_TESTING.md`
- **Implementation Summary:** `PHASE1_IMPLEMENTATION_SUMMARY.md`
- **Seed Script:** `scripts/seedServiceableCities.js`

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Database has 2 cities (Gaya, Patna)
- [ ] Public endpoint returns city list
- [ ] Check serviceability works for valid/invalid cities
- [ ] Payment route blocks non-serviceable cities
- [ ] COD route blocks non-serviceable cities
- [ ] Cache is working (check logs)
- [ ] Admin routes are accessible (with auth)

---

## 🎉 You're Ready!

The city validation system is now:
- ✅ Protecting booking routes
- ✅ Providing clear error messages
- ✅ Admin-configurable via API
- ✅ Performance-optimized with caching

**Next:** Integrate with frontend (Phase 2)




