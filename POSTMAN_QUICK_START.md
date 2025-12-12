# 🚀 Postman Quick Start Guide - Booking Config API

## Prerequisites
✅ Server running on `http://localhost:3000`  
✅ Logged in as Admin (accessToken cookie set)  
✅ MongoDB connected  
✅ Redis connected (optional, but recommended)

---

## 🎯 Quick Test - Seed MOV=999

### Request
```
POST http://localhost:3000/api/admin/booking-config/seed
```

### Headers
```
Cookie: accessToken=<your_token_here>
```

### Expected Response
```json
{
  "success": true,
  "summary": {
    "total": 4,
    "created": 4,
    "skipped": 0
  },
  "message": "Seeding complete: 4 configs created, 0 already existed"
}
```

### What This Does
✅ Creates `MINIMUM_ORDER_VALUE = 999`  
✅ Creates `MAX_RESCHEDULE_COUNT = 3`  
✅ Creates `CANCELLATION_WINDOW_HOURS = 2`  
✅ Creates `RESCHEDULE_WINDOW_HOURS = 4`

---

## 📋 Postman Collection Setup

### 1. Create New Collection
- Name: `Booking Config API`
- Base URL: `http://localhost:3000/api/admin/booking-config`

### 2. Set Collection Variables
- `baseUrl`: `http://localhost:3000`
- `adminToken`: `<your_admin_jwt_token>`

### 3. Add Requests

#### Request 1: Seed Configs ⭐ (RUN THIS FIRST)
```
POST {{baseUrl}}/api/admin/booking-config/seed
Headers: Cookie: accessToken={{adminToken}}
Body: None
```

#### Request 2: Get All Active Configs
```
GET {{baseUrl}}/api/admin/booking-config
Headers: Cookie: accessToken={{adminToken}}
```

#### Request 3: Get MOV Config
```
GET {{baseUrl}}/api/admin/booking-config/MINIMUM_ORDER_VALUE
Headers: Cookie: accessToken={{adminToken}}
```

#### Request 4: Update MOV
```
PUT {{baseUrl}}/api/admin/booking-config/MINIMUM_ORDER_VALUE
Headers: 
  Cookie: accessToken={{adminToken}}
  Content-Type: application/json
Body (JSON):
{
  "value": 1299,
  "reason": "Testing update"
}
```

#### Request 5: Get Audit Log
```
GET {{baseUrl}}/api/admin/booking-config/MINIMUM_ORDER_VALUE/audit-log
Headers: Cookie: accessToken={{adminToken}}
```

#### Request 6: Toggle MOV Status
```
PATCH {{baseUrl}}/api/admin/booking-config/MINIMUM_ORDER_VALUE/toggle
Headers: Cookie: accessToken={{adminToken}}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Initial Setup
1. ✅ Seed configs → Should create 4 configs
2. ✅ Get all configs → Should return 4 active configs
3. ✅ Get MOV → Should return value=999

### Scenario 2: Update MOV
1. ✅ Update MOV to 1299
2. ✅ Get MOV → Should return value=1299
3. ✅ Check audit log → Should show change from 999 to 1299

### Scenario 3: Deactivate MOV
1. ✅ Toggle MOV status → isActive becomes false
2. ✅ Get all active configs → MOV should not appear
3. ✅ Toggle again → isActive becomes true

### Scenario 4: Validation Tests
1. ❌ Update MOV to -100 → Should fail (negative value)
2. ❌ Update MOV to 15000 → Should fail (exceeds max)
3. ✅ Update MOV to 1500 → Should succeed

---

## 🔑 Getting Admin Token

### Method 1: Login via Postman
```
POST http://localhost:3000/auth/login
Body (JSON):
{
  "email": "your_admin_email@example.com",
  "password": "your_admin_password"
}
```
Response will set `accessToken` cookie automatically.

### Method 2: Copy from Browser
1. Login to admin panel in browser
2. Open DevTools → Application → Cookies
3. Copy `accessToken` value
4. Paste in Postman Cookie header

---

## 📊 Expected Database State After Seeding

### Collection: `bookingconfigs`

| configKey | value | isActive | unit | description |
|-----------|-------|----------|------|-------------|
| MINIMUM_ORDER_VALUE | 999 | true | rupees | Minimum order value required |
| MAX_RESCHEDULE_COUNT | 3 | true | count | Max reschedules allowed |
| CANCELLATION_WINDOW_HOURS | 2 | true | hours | Hours before cancellation allowed |
| RESCHEDULE_WINDOW_HOURS | 4 | true | hours | Hours before reschedule allowed |

---

## 🐛 Troubleshooting

### Error: "Admin access required"
**Solution:** Ensure you're logged in as admin with role='admin'

### Error: "Config already exists"
**Solution:** Configs already seeded. Use GET to view them.

### Error: "No access & refresh token"
**Solution:** Login first to get accessToken cookie

### Error: "Redis connection error"
**Solution:** Redis is optional. API will work without it (no caching).

### Error: "Cannot delete critical config"
**Solution:** Use toggle to deactivate instead of delete

---

## ✅ Success Checklist

- [ ] Server running on port 3000
- [ ] MongoDB connected
- [ ] Logged in as admin
- [ ] Seeded configs successfully
- [ ] Can view all configs
- [ ] Can get MOV config (value=999)
- [ ] Can update MOV value
- [ ] Can view audit log
- [ ] Can toggle config status

---

## 🎉 Next Steps

Once Phase 1 is complete:

**Phase 2:** Create `checkMinimumOrderValue` middleware  
**Phase 3:** Integrate middleware into booking routes  
**Phase 4:** Update frontend to fetch MOV  
**Phase 5:** Test end-to-end booking flow

---

## 📝 Notes

- **Cache TTL:** 1 hour (configs cached in Redis)
- **Audit Trail:** All updates logged automatically
- **Fail-Safe:** If MOV not found/inactive, bookings proceed
- **Critical Configs:** Cannot be deleted (only deactivated)

---

## 🆘 Need Help?

Check the full documentation: `BOOKING_CONFIG_API_DOCUMENTATION.md`

