# ✅ Phase 1 Checklist - Step by Step

## 🎯 Goal
Seed Minimum Order Value (MOV) of ₹999 into the database using Postman.

---

## 📋 Pre-Flight Checklist

### Server Setup
- [ ] MongoDB is running
- [ ] Redis is running (optional, but recommended)
- [ ] Server is running on `http://localhost:3000`
- [ ] No errors in server console

### Admin Account
- [ ] You have admin credentials
- [ ] Admin account has `role: 'admin'`
- [ ] You can login successfully

### Postman Setup
- [ ] Postman is installed
- [ ] You know how to make API requests
- [ ] You can view response JSON

---

## 🚀 Step-by-Step Execution

### Step 1: Start Server ✅
```bash
cd server
npm run dev
```

**Expected Output:**
```
Server is running on port 3000
MongoDB connected
Redis connected
```

**Status:** [ ] Complete

---

### Step 2: Login as Admin ✅

**Request:**
```
POST http://localhost:3000/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "your_admin_email@example.com",
  "password": "your_admin_password"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Cookie Set:** `accessToken` (automatically saved by Postman)

**Status:** [ ] Complete

---

### Step 3: Seed Booking Configs ⭐ (MOST IMPORTANT)

**Request:**
```
POST http://localhost:3000/api/admin/booking-config/seed
```

**Headers:**
```
Cookie: accessToken=<automatically_from_login>
```

**Body:** None required

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "config": {
        "configKey": "MINIMUM_ORDER_VALUE",
        "value": 999,
        ...
      }
    },
    ...
  ],
  "summary": {
    "total": 4,
    "created": 4,
    "skipped": 0
  },
  "message": "Seeding complete: 4 configs created, 0 already existed"
}
```

**Status Code:** `201 Created`

**Status:** [ ] Complete

---

### Step 4: Verify MOV Created ✅

**Request:**
```
GET http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE
```

**Headers:**
```
Cookie: accessToken=<from_login>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 999,
    "currency": "INR",
    "isActive": true,
    "formattedValue": "₹999",
    ...
  },
  "source": "database"
}
```

**Status Code:** `200 OK`

**Status:** [ ] Complete

---

### Step 5: Verify All Configs ✅

**Request:**
```
GET http://localhost:3000/api/admin/booking-config
```

**Headers:**
```
Cookie: accessToken=<from_login>
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    { "configKey": "CANCELLATION_WINDOW_HOURS", "value": 2, ... },
    { "configKey": "MAX_RESCHEDULE_COUNT", "value": 3, ... },
    { "configKey": "MINIMUM_ORDER_VALUE", "value": 999, ... },
    { "configKey": "RESCHEDULE_WINDOW_HOURS", "value": 4, ... }
  ],
  "count": 4,
  "message": "Active configs retrieved successfully"
}
```

**Status Code:** `200 OK`

**Status:** [ ] Complete

---

### Step 6: Test Cache (Optional) ✅

**First Request:**
```
GET http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE
```

**Expected:** `"source": "database"`

**Second Request (immediately after):**
```
GET http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE
```

**Expected:** `"source": "cache"`

**Status:** [ ] Complete

---

### Step 7: Test Update (Optional) ✅

**Request:**
```
PUT http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE
```

**Headers:**
```
Cookie: accessToken=<from_login>
Content-Type: application/json
```

**Body:**
```json
{
  "value": 1299,
  "reason": "Testing update functionality"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Config MINIMUM_ORDER_VALUE updated successfully",
  "previousValue": 999,
  "newValue": 1299
}
```

**Status Code:** `200 OK`

**Status:** [ ] Complete

---

### Step 8: Verify in Database (Optional) ✅

**MongoDB Compass or Shell:**
```javascript
use makeover
db.bookingconfigs.findOne({ configKey: "MINIMUM_ORDER_VALUE" })
```

**Expected:**
```javascript
{
  _id: ObjectId("..."),
  configKey: "MINIMUM_ORDER_VALUE",
  value: 999,  // or 1299 if you updated
  currency: "INR",
  isActive: true,
  ...
}
```

**Status:** [ ] Complete

---

## 🎉 Success Criteria

### All Must Be True:
- [x] Server running without errors
- [x] Logged in as admin successfully
- [x] Seed API returned `"created": 4`
- [x] GET MOV returns `"value": 999`
- [x] GET all configs returns 4 configs
- [x] All status codes are 200 or 201
- [x] No error messages in responses

---

## ❌ Troubleshooting

### Problem: "Admin access required"
**Solution:** 
1. Verify you're logged in as admin
2. Check `user.role === 'admin'` in login response
3. Ensure accessToken cookie is set

### Problem: "Config already exists"
**Solution:** 
- Configs already seeded! ✅
- Use GET to view them
- Use PUT to update values

### Problem: "No access & refresh token"
**Solution:**
1. Login first (Step 2)
2. Ensure Postman is saving cookies
3. Check Cookie header is being sent

### Problem: "Cannot connect to MongoDB"
**Solution:**
1. Start MongoDB: `mongod` or `brew services start mongodb-community`
2. Check connection string in `.env`
3. Verify MongoDB is running on correct port

### Problem: "Redis connection error"
**Solution:**
- Redis is optional for Phase 1
- API will work without it (no caching)
- To fix: Start Redis with `redis-server`

---

## 📊 What You Should See in Database

### Collection: `bookingconfigs`
**Document Count:** 4

**Documents:**
1. MINIMUM_ORDER_VALUE = 999
2. MAX_RESCHEDULE_COUNT = 3
3. CANCELLATION_WINDOW_HOURS = 2
4. RESCHEDULE_WINDOW_HOURS = 4

---

## 🎯 Phase 1 Complete When...

✅ All checkboxes above are checked  
✅ MOV of ₹999 exists in database  
✅ You can view it via GET API  
✅ No errors in any responses  

---

## 📝 Next Steps

Once Phase 1 is complete:

**Phase 2:** Create middleware to check MOV during booking  
**Phase 3:** Integrate middleware into booking routes  
**Phase 4:** Update frontend to show MOV warnings  
**Phase 5:** Test complete booking flow  

---

## 🆘 Need Help?

1. **API Documentation:** `BOOKING_CONFIG_API_DOCUMENTATION.md`
2. **Quick Start:** `POSTMAN_QUICK_START.md`
3. **Visual Guide:** `POSTMAN_VISUAL_GUIDE.md`
4. **Summary:** `PHASE_1_COMPLETION_SUMMARY.md`

---

**Good Luck! 🚀**

