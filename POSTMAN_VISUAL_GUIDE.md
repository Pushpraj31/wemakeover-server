# 📸 Postman Visual Guide - What You'll See

## 🎯 Request 1: Seed Initial Configs

### URL
```
POST http://localhost:3000/api/admin/booking-config/seed
```

### What You'll See ✅
```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "config": {
        "_id": "673f1a2b3c4d5e6f7g8h9i0j",
        "configKey": "MINIMUM_ORDER_VALUE",
        "value": 999,
        "currency": "INR",
        "description": "Minimum order value required to place a booking",
        "isActive": true,
        "lastUpdatedBy": "673e1234567890abcdef5678",
        "metadata": {
          "unit": "rupees",
          "displayName": "Minimum Order Value",
          "helpText": "Users must add services worth at least this amount to place a booking. This ensures service quality and operational efficiency.",
          "validationRules": {
            "min": 0,
            "max": 10000,
            "step": 1
          }
        },
        "auditLog": [],
        "createdAt": "2025-11-23T10:00:00.000Z",
        "updatedAt": "2025-11-23T10:00:00.000Z",
        "formattedValue": "₹999"
      }
    },
    {
      "success": true,
      "config": {
        "configKey": "MAX_RESCHEDULE_COUNT",
        "value": 3,
        ...
      }
    },
    {
      "success": true,
      "config": {
        "configKey": "CANCELLATION_WINDOW_HOURS",
        "value": 2,
        ...
      }
    },
    {
      "success": true,
      "config": {
        "configKey": "RESCHEDULE_WINDOW_HOURS",
        "value": 4,
        ...
      }
    }
  ],
  "summary": {
    "total": 4,
    "created": 4,
    "skipped": 0
  },
  "message": "Seeding complete: 4 configs created, 0 already existed"
}
```

### Status Code
```
201 Created
```

---

## 🎯 Request 2: Get All Active Configs

### URL
```
GET http://localhost:3000/api/admin/booking-config
```

### What You'll See ✅
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f1a2b3c4d5e6f7g8h9i0j",
      "configKey": "CANCELLATION_WINDOW_HOURS",
      "value": 2,
      "currency": "INR",
      "description": "Minimum hours before booking time when cancellation is allowed",
      "isActive": true,
      "lastUpdatedBy": {
        "_id": "673e1234567890abcdef5678",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "metadata": {
        "unit": "hours",
        "displayName": "Cancellation Window",
        "helpText": "Customers can cancel their booking only if it is more than this many hours away.",
        "validationRules": {
          "min": 0,
          "max": 72,
          "step": 1
        }
      },
      "formattedValue": "2 hours",
      "createdAt": "2025-11-23T10:00:00.000Z",
      "updatedAt": "2025-11-23T10:00:00.000Z"
    },
    {
      "configKey": "MAX_RESCHEDULE_COUNT",
      "value": 3,
      "formattedValue": "3",
      ...
    },
    {
      "configKey": "MINIMUM_ORDER_VALUE",
      "value": 999,
      "formattedValue": "₹999",
      ...
    },
    {
      "configKey": "RESCHEDULE_WINDOW_HOURS",
      "value": 4,
      "formattedValue": "4 hours",
      ...
    }
  ],
  "count": 4,
  "message": "Active configs retrieved successfully"
}
```

### Status Code
```
200 OK
```

---

## 🎯 Request 3: Get Minimum Order Value

### URL
```
GET http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE
```

### What You'll See ✅ (First Time - Cache Miss)
```json
{
  "success": true,
  "data": {
    "_id": "673f1a2b3c4d5e6f7g8h9i0j",
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 999,
    "currency": "INR",
    "description": "Minimum order value required to place a booking",
    "isActive": true,
    "lastUpdatedBy": "673e1234567890abcdef5678",
    "metadata": {
      "unit": "rupees",
      "displayName": "Minimum Order Value",
      "helpText": "Users must add services worth at least this amount to place a booking. This ensures service quality and operational efficiency.",
      "validationRules": {
        "min": 0,
        "max": 10000,
        "step": 1
      }
    },
    "auditLog": [],
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  },
  "source": "database"  ⬅️ Fetched from database
}
```

### What You'll See ✅ (Second Time - Cache Hit)
```json
{
  "success": true,
  "data": {
    "_id": "673f1a2b3c4d5e6f7g8h9i0j",
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 999,
    ...
  },
  "source": "cache"  ⬅️ Fetched from Redis cache
}
```

### Status Code
```
200 OK
```

---

## 🎯 Request 4: Update MOV to ₹1299

### URL
```
PUT http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE
```

### Request Body
```json
{
  "value": 1299,
  "reason": "Increased MOV to improve service quality and profitability"
}
```

### What You'll See ✅
```json
{
  "success": true,
  "data": {
    "_id": "673f1a2b3c4d5e6f7g8h9i0j",
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 1299,  ⬅️ Updated value
    "currency": "INR",
    "description": "Minimum order value required to place a booking",
    "isActive": true,
    "lastUpdatedBy": "673e1234567890abcdef5678",
    "metadata": {
      "unit": "rupees",
      "displayName": "Minimum Order Value",
      "helpText": "Users must add services worth at least this amount to place a booking. This ensures service quality and operational efficiency.",
      "validationRules": {
        "min": 0,
        "max": 10000,
        "step": 1
      }
    },
    "auditLog": [
      {
        "updatedBy": "673e1234567890abcdef5678",
        "previousValue": 999,  ⬅️ Old value
        "newValue": 1299,      ⬅️ New value
        "updatedAt": "2025-11-23T11:30:00.000Z",
        "reason": "Increased MOV to improve service quality and profitability",
        "_id": "673f2b3c4d5e6f7g8h9i0j1k"
      }
    ],
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T11:30:00.000Z"
  },
  "message": "Config MINIMUM_ORDER_VALUE updated successfully",
  "previousValue": 999,
  "newValue": 1299
}
```

### Status Code
```
200 OK
```

---

## 🎯 Request 5: Get Audit Log

### URL
```
GET http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE/audit-log
```

### What You'll See ✅
```json
{
  "success": true,
  "data": {
    "configKey": "MINIMUM_ORDER_VALUE",
    "currentValue": 1299,
    "auditLog": [
      {
        "updatedBy": {
          "_id": "673e1234567890abcdef5678",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "previousValue": 999,
        "newValue": 1299,
        "updatedAt": "2025-11-23T11:30:00.000Z",
        "reason": "Increased MOV to improve service quality and profitability",
        "_id": "673f2b3c4d5e6f7g8h9i0j1k"
      }
    ]
  },
  "message": "Audit log retrieved successfully"
}
```

### Status Code
```
200 OK
```

---

## 🎯 Request 6: Toggle MOV Status (Deactivate)

### URL
```
PATCH http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE/toggle
```

### What You'll See ✅
```json
{
  "success": true,
  "data": {
    "_id": "673f1a2b3c4d5e6f7g8h9i0j",
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 1299,
    "currency": "INR",
    "description": "Minimum order value required to place a booking",
    "isActive": false,  ⬅️ Now deactivated
    "lastUpdatedBy": "673e1234567890abcdef5678",
    ...
  },
  "message": "Config MINIMUM_ORDER_VALUE deactivated successfully",
  "previousStatus": true,
  "newStatus": false
}
```

### Status Code
```
200 OK
```

---

## ❌ Error Scenarios

### Error 1: Not Logged In
```json
{
  "success": false,
  "loggedIn": false,
  "message": "No access & refresh token"
}
```
**Status:** `401 Unauthorized`

---

### Error 2: Not Admin
```json
{
  "success": false,
  "message": "Admin access required"
}
```
**Status:** `403 Forbidden`

---

### Error 3: Config Not Found
```json
{
  "success": false,
  "message": "Config INVALID_KEY not found or inactive",
  "error": "CONFIG_NOT_FOUND"
}
```
**Status:** `404 Not Found`

---

### Error 4: Value Too Low
```json
{
  "success": false,
  "message": "Value must be at least 0",
  "error": "VALUE_TOO_LOW"
}
```
**Status:** `400 Bad Request`

---

### Error 5: Value Too High
```json
{
  "success": false,
  "message": "Value cannot exceed 10000",
  "error": "VALUE_TOO_HIGH"
}
```
**Status:** `400 Bad Request`

---

### Error 6: Cannot Delete Critical Config
```json
{
  "success": false,
  "message": "Cannot delete critical config MINIMUM_ORDER_VALUE. Consider deactivating it instead.",
  "error": "CRITICAL_CONFIG"
}
```
**Status:** `403 Forbidden`

---

### Error 7: Config Already Exists
```json
{
  "success": false,
  "message": "Config MINIMUM_ORDER_VALUE already exists",
  "error": "CONFIG_ALREADY_EXISTS",
  "data": {
    "_id": "673f1a2b3c4d5e6f7g8h9i0j",
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 999,
    ...
  }
}
```
**Status:** `409 Conflict`

---

## 🎨 Postman Tips

### 1. Save Responses as Examples
After each successful request, click "Save Response" → "Save as Example"

### 2. Use Environment Variables
Create environment with:
- `baseUrl`: `http://localhost:3000`
- `adminEmail`: `your_admin@example.com`
- `adminPassword`: `your_password`

### 3. Create Tests
Add to "Tests" tab:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success=true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});
```

### 4. Use Pre-request Scripts
For login:
```javascript
pm.sendRequest({
    url: pm.environment.get("baseUrl") + "/auth/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json',
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: pm.environment.get("adminEmail"),
            password: pm.environment.get("adminPassword")
        })
    }
}, function (err, res) {
    // Token is set in cookies automatically
});
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

1. ✅ **Status Code:** 200 OK or 201 Created
2. ✅ **success:** true
3. ✅ **data:** Contains config object(s)
4. ✅ **message:** Descriptive success message
5. ✅ **No errors in server logs**

---

## 🔍 What to Check in MongoDB

### Using MongoDB Compass or Shell

```javascript
// Connect to database
use makeover

// View all configs
db.bookingconfigs.find().pretty()

// View only MOV
db.bookingconfigs.findOne({ configKey: "MINIMUM_ORDER_VALUE" })

// Check audit log
db.bookingconfigs.findOne(
  { configKey: "MINIMUM_ORDER_VALUE" },
  { auditLog: 1 }
)
```

### Expected Document Structure
```javascript
{
  _id: ObjectId("673f1a2b3c4d5e6f7g8h9i0j"),
  configKey: "MINIMUM_ORDER_VALUE",
  value: 999,
  currency: "INR",
  description: "Minimum order value required to place a booking",
  isActive: true,
  lastUpdatedBy: ObjectId("673e1234567890abcdef5678"),
  metadata: {
    unit: "rupees",
    displayName: "Minimum Order Value",
    helpText: "Users must add services worth at least this amount...",
    validationRules: {
      min: 0,
      max: 10000,
      step: 1
    }
  },
  auditLog: [],
  createdAt: ISODate("2025-11-23T10:00:00.000Z"),
  updatedAt: ISODate("2025-11-23T10:00:00.000Z"),
  __v: 0
}
```

---

## 🎉 You're Ready!

Once you see these responses in Postman, Phase 1 is complete and you can move to Phase 2!

