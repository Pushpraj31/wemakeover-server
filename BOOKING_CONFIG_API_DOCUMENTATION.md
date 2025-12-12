# Booking Config API Documentation

## Overview
This API allows admins to manage booking configuration settings like Minimum Order Value (MOV), reschedule limits, cancellation windows, etc.

**Base URL:** `http://localhost:3000/api/admin/booking-config`

**Authentication:** All endpoints require:
- Valid JWT access token (in cookies)
- Admin role

---

## API Endpoints

### 1. Seed Initial Configs (Run this first!)

**Endpoint:** `POST /api/admin/booking-config/seed`

**Description:** Creates initial booking configs including MINIMUM_ORDER_VALUE (₹999)

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
Content-Type: application/json
```

**Request Body:** None required

**Response (201 Created):**
```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "config": {
        "_id": "673f1234567890abcdef1234",
        "configKey": "MINIMUM_ORDER_VALUE",
        "value": 999,
        "currency": "INR",
        "description": "Minimum order value required to place a booking",
        "isActive": true,
        "lastUpdatedBy": "673e1234567890abcdef5678",
        "metadata": {
          "unit": "rupees",
          "displayName": "Minimum Order Value",
          "helpText": "Users must add services worth at least this amount to place a booking.",
          "validationRules": {
            "min": 0,
            "max": 10000,
            "step": 1
          }
        },
        "auditLog": [],
        "createdAt": "2025-11-23T10:00:00.000Z",
        "updatedAt": "2025-11-23T10:00:00.000Z"
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

**Note:** If configs already exist, they will be skipped.

---

### 2. Get All Active Configs

**Endpoint:** `GET /api/admin/booking-config`

**Description:** Retrieves all active booking configs

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f1234567890abcdef1234",
      "configKey": "MINIMUM_ORDER_VALUE",
      "value": 999,
      "currency": "INR",
      "description": "Minimum order value required to place a booking",
      "isActive": true,
      "lastUpdatedBy": {
        "_id": "673e1234567890abcdef5678",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "metadata": {
        "unit": "rupees",
        "displayName": "Minimum Order Value",
        "helpText": "Users must add services worth at least this amount...",
        "validationRules": {
          "min": 0,
          "max": 10000,
          "step": 1
        }
      },
      "formattedValue": "₹999",
      "createdAt": "2025-11-23T10:00:00.000Z",
      "updatedAt": "2025-11-23T10:00:00.000Z"
    },
    ...
  ],
  "count": 4,
  "message": "Active configs retrieved successfully"
}
```

---

### 3. Get Specific Config by Key

**Endpoint:** `GET /api/admin/booking-config/:configKey`

**Description:** Retrieves a specific config (with caching)

**Example:** `GET /api/admin/booking-config/MINIMUM_ORDER_VALUE`

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "673f1234567890abcdef1234",
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 999,
    "currency": "INR",
    "description": "Minimum order value required to place a booking",
    "isActive": true,
    "lastUpdatedBy": "673e1234567890abcdef5678",
    "metadata": {
      "unit": "rupees",
      "displayName": "Minimum Order Value",
      "helpText": "Users must add services worth at least this amount...",
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
  "source": "cache",
  "message": "Config retrieved successfully"
}
```

**Note:** `source` can be "cache" or "database"

---

### 4. Update Config Value

**Endpoint:** `PUT /api/admin/booking-config/:configKey`

**Description:** Updates the value of a config

**Example:** `PUT /api/admin/booking-config/MINIMUM_ORDER_VALUE`

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "value": 1299,
  "reason": "Increased MOV to improve service quality"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "673f1234567890abcdef1234",
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 1299,
    "currency": "INR",
    "description": "Minimum order value required to place a booking",
    "isActive": true,
    "lastUpdatedBy": "673e1234567890abcdef5678",
    "metadata": {
      "unit": "rupees",
      "displayName": "Minimum Order Value",
      "helpText": "Users must add services worth at least this amount...",
      "validationRules": {
        "min": 0,
        "max": 10000,
        "step": 1
      }
    },
    "auditLog": [
      {
        "updatedBy": "673e1234567890abcdef5678",
        "previousValue": 999,
        "newValue": 1299,
        "updatedAt": "2025-11-23T11:30:00.000Z",
        "reason": "Increased MOV to improve service quality"
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

**Error Response (400 Bad Request) - Value too low:**
```json
{
  "success": false,
  "message": "Value must be at least 0",
  "error": "VALUE_TOO_LOW"
}
```

**Error Response (400 Bad Request) - Value too high:**
```json
{
  "success": false,
  "message": "Value cannot exceed 10000",
  "error": "VALUE_TOO_HIGH"
}
```

---

### 5. Toggle Config Active Status

**Endpoint:** `PATCH /api/admin/booking-config/:configKey/toggle`

**Description:** Activates or deactivates a config

**Example:** `PATCH /api/admin/booking-config/MINIMUM_ORDER_VALUE/toggle`

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
```

**Request Body:** None required

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "673f1234567890abcdef1234",
    "configKey": "MINIMUM_ORDER_VALUE",
    "value": 999,
    "currency": "INR",
    "description": "Minimum order value required to place a booking",
    "isActive": false,
    "lastUpdatedBy": "673e1234567890abcdef5678",
    ...
  },
  "message": "Config MINIMUM_ORDER_VALUE deactivated successfully",
  "previousStatus": true,
  "newStatus": false
}
```

**Note:** When deactivated, the MOV check will be skipped in booking validation.

---

### 6. Create New Config

**Endpoint:** `POST /api/admin/booking-config`

**Description:** Creates a new booking config

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "configKey": "MAX_SERVICES_PER_BOOKING",
  "value": 10,
  "currency": "INR",
  "description": "Maximum number of services allowed in a single booking",
  "metadata": {
    "unit": "count",
    "displayName": "Max Services Per Booking",
    "helpText": "Limits the number of services a customer can book at once.",
    "validationRules": {
      "min": 1,
      "max": 20,
      "step": 1
    }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "673f5678901234abcdef5678",
    "configKey": "MAX_SERVICES_PER_BOOKING",
    "value": 10,
    "currency": "INR",
    "description": "Maximum number of services allowed in a single booking",
    "isActive": true,
    "lastUpdatedBy": "673e1234567890abcdef5678",
    "metadata": {
      "unit": "count",
      "displayName": "Max Services Per Booking",
      "helpText": "Limits the number of services a customer can book at once.",
      "validationRules": {
        "min": 1,
        "max": 20,
        "step": 1
      }
    },
    "auditLog": [],
    "createdAt": "2025-11-23T12:00:00.000Z",
    "updatedAt": "2025-11-23T12:00:00.000Z"
  },
  "message": "Config MAX_SERVICES_PER_BOOKING created successfully"
}
```

---

### 7. Get Config Audit Log

**Endpoint:** `GET /api/admin/booking-config/:configKey/audit-log`

**Description:** Retrieves the change history for a config

**Example:** `GET /api/admin/booking-config/MINIMUM_ORDER_VALUE/audit-log`

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
```

**Response (200 OK):**
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
        "reason": "Increased MOV to improve service quality"
      },
      {
        "updatedBy": {
          "_id": "673e1234567890abcdef5678",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "previousValue": 1299,
        "newValue": 1499,
        "updatedAt": "2025-11-23T14:00:00.000Z",
        "reason": "Further increase based on market analysis"
      }
    ]
  },
  "message": "Audit log retrieved successfully"
}
```

---

### 8. Delete Config

**Endpoint:** `DELETE /api/admin/booking-config/:configKey`

**Description:** Deletes a config (critical configs cannot be deleted)

**Example:** `DELETE /api/admin/booking-config/MAX_SERVICES_PER_BOOKING`

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Config MAX_SERVICES_PER_BOOKING deleted successfully",
  "deletedConfig": {
    "_id": "673f5678901234abcdef5678",
    "configKey": "MAX_SERVICES_PER_BOOKING",
    "value": 10,
    ...
  }
}
```

**Error Response (403 Forbidden) - Critical config:**
```json
{
  "success": false,
  "message": "Cannot delete critical config MINIMUM_ORDER_VALUE. Consider deactivating it instead.",
  "error": "CRITICAL_CONFIG"
}
```

**Note:** Critical configs that cannot be deleted:
- MINIMUM_ORDER_VALUE
- CANCELLATION_WINDOW_HOURS
- RESCHEDULE_WINDOW_HOURS

---

### 9. Get All Configs (Including Inactive)

**Endpoint:** `GET /api/admin/booking-config/all`

**Description:** Retrieves all configs including inactive ones

**Headers:**
```
Cookie: accessToken=<your_admin_jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f1234567890abcdef1234",
      "configKey": "MINIMUM_ORDER_VALUE",
      "value": 999,
      "isActive": true,
      ...
    },
    {
      "_id": "673f5678901234abcdef5678",
      "configKey": "PLATFORM_FEE",
      "value": 60,
      "isActive": false,
      ...
    }
  ],
  "count": 5,
  "message": "All configs retrieved successfully"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "loggedIn": false,
  "message": "No access & refresh token"
}
```

### 403 Forbidden (Not Admin)
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Config INVALID_KEY not found or inactive",
  "error": "CONFIG_NOT_FOUND"
}
```

### 409 Conflict (Duplicate)
```json
{
  "success": false,
  "message": "Config MINIMUM_ORDER_VALUE already exists",
  "error": "CONFIG_ALREADY_EXISTS",
  "data": {
    ...existing config...
  }
}
```

---

## Testing Workflow in Postman

### Step 1: Login as Admin
```
POST http://localhost:3000/auth/login
Body: {
  "email": "admin@example.com",
  "password": "your_admin_password"
}
```
This will set the `accessToken` cookie automatically.

### Step 2: Seed Initial Configs
```
POST http://localhost:3000/api/admin/booking-config/seed
```
This creates MINIMUM_ORDER_VALUE=999 and other configs.

### Step 3: Verify Configs Created
```
GET http://localhost:3000/api/admin/booking-config
```
You should see all 4 configs.

### Step 4: Get Minimum Order Value
```
GET http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE
```
Verify it's 999.

### Step 5: Update MOV (Optional)
```
PUT http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE
Body: {
  "value": 1299,
  "reason": "Testing update functionality"
}
```

### Step 6: Check Audit Log
```
GET http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE/audit-log
```
You should see your update in the history.

---

## Caching Behavior

- **Cache Key Format:** `booking:config:{CONFIG_KEY}`
- **TTL:** 3600 seconds (1 hour)
- **Cache Invalidation:** Automatic on create/update/delete/toggle operations
- **Cache Hit:** Response includes `"source": "cache"`
- **Cache Miss:** Response includes `"source": "database"`

---

## Notes

1. **Admin Authentication Required:** All endpoints require valid admin JWT token
2. **Automatic Audit Trail:** All value updates are logged with admin ID, timestamp, and reason
3. **Validation Rules:** Each config can have min/max/step validation rules
4. **Critical Configs:** Cannot be deleted (only deactivated)
5. **Cache Performance:** First request fetches from DB, subsequent requests use Redis cache
6. **Fail-Safe Design:** If config not found or inactive, booking validation will proceed (fail open)

---

## Next Steps (Phase 2)

After seeding configs, you'll need to:
1. Create `checkMinimumOrderValue` middleware
2. Add middleware to booking creation route
3. Update frontend to fetch and display MOV
4. Test end-to-end booking flow with MOV validation

---

## Support

For issues or questions, contact the development team.

