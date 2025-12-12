# 📚 Booking Config System - Complete Guide

## 🎯 Overview

This system allows admins to dynamically manage booking business rules (like Minimum Order Value) without code changes. All configurations are stored in MongoDB and cached in Redis for performance.

---

## 📁 Files Created

### Core System Files
```
server/src/
├── models/
│   └── bookingConfig.model.js          # Database schema
├── services/
│   └── bookingConfig.service.js        # Business logic + caching
├── controllers/
│   └── bookingConfig.controller.js     # API request handlers
└── routes/
    └── bookingConfig.routes.js         # API endpoints

server/src/server.js                     # Updated with new routes
```

### Documentation Files
```
server/
├── BOOKING_CONFIG_API_DOCUMENTATION.md  # Complete API reference
├── POSTMAN_QUICK_START.md               # Quick testing guide
├── POSTMAN_VISUAL_GUIDE.md              # What you'll see in Postman
├── PHASE_1_CHECKLIST.md                 # Step-by-step checklist
├── PHASE_1_COMPLETION_SUMMARY.md        # Detailed summary
└── README_BOOKING_CONFIG.md             # This file
```

---

## 🚀 Quick Start (3 Steps)

### 1. Start Server
```bash
cd server
npm run dev
```

### 2. Login as Admin
```
POST http://localhost:3000/auth/login
Body: { "email": "admin@example.com", "password": "..." }
```

### 3. Seed Configs
```
POST http://localhost:3000/api/admin/booking-config/seed
```

**Done!** MOV of ₹999 is now in your database.

---

## 📖 Documentation Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [PHASE_1_CHECKLIST.md](PHASE_1_CHECKLIST.md) | Step-by-step guide | **Start here!** |
| [POSTMAN_QUICK_START.md](POSTMAN_QUICK_START.md) | Quick Postman setup | Testing in Postman |
| [POSTMAN_VISUAL_GUIDE.md](POSTMAN_VISUAL_GUIDE.md) | Expected responses | Know what to expect |
| [BOOKING_CONFIG_API_DOCUMENTATION.md](BOOKING_CONFIG_API_DOCUMENTATION.md) | Complete API docs | Deep dive into APIs |
| [PHASE_1_COMPLETION_SUMMARY.md](PHASE_1_COMPLETION_SUMMARY.md) | Technical details | Understanding the system |

---

## 🎯 What Was Built

### ✅ Phase 1: Config Management System (COMPLETE)

**Features:**
- ✅ Admin can create/read/update/delete booking configs
- ✅ Initial configs seeded (MOV=₹999, etc.)
- ✅ Redis caching for performance
- ✅ Complete audit trail
- ✅ Validation rules enforcement
- ✅ Protection for critical configs

**API Endpoints:**
- `POST /api/admin/booking-config/seed` - Seed initial configs ⭐
- `GET /api/admin/booking-config` - Get all active configs
- `GET /api/admin/booking-config/:key` - Get specific config
- `PUT /api/admin/booking-config/:key` - Update config value
- `PATCH /api/admin/booking-config/:key/toggle` - Toggle status
- `DELETE /api/admin/booking-config/:key` - Delete config
- `GET /api/admin/booking-config/:key/audit-log` - View history

---

## 🔮 Future Phases

### Phase 2: Middleware Integration (NEXT)
- [ ] Create `checkMinimumOrderValue` middleware
- [ ] Add to booking creation route
- [ ] Test with orders below/above MOV

### Phase 3: Frontend Integration
- [ ] Fetch MOV on checkout page
- [ ] Display warning if below MOV
- [ ] Disable checkout if not met

### Phase 4: End-to-End Testing
- [ ] Test complete booking flow
- [ ] Test with MOV active/inactive
- [ ] Verify error messages

---

## 🗄️ Database

### Collection: `bookingconfigs`

**Initial Configs:**
| Key | Value | Unit | Description |
|-----|-------|------|-------------|
| MINIMUM_ORDER_VALUE | 999 | rupees | Min booking amount |
| MAX_RESCHEDULE_COUNT | 3 | count | Max reschedules |
| CANCELLATION_WINDOW_HOURS | 2 | hours | Cancel window |
| RESCHEDULE_WINDOW_HOURS | 4 | hours | Reschedule window |

---

## 🔐 Security

- ✅ All endpoints require authentication
- ✅ All endpoints require admin role
- ✅ Input validation on all requests
- ✅ Mongoose schema validation
- ✅ Critical configs cannot be deleted

---

## ⚡ Performance

- ✅ Redis caching (1-hour TTL)
- ✅ Automatic cache invalidation
- ✅ Database indexes on configKey
- ✅ Lean queries for read operations

---

## 📊 Monitoring

### Audit Trail
Every config change is logged with:
- Who made the change (admin ID)
- When it was changed (timestamp)
- What changed (previous → new value)
- Why it was changed (reason)

### Cache Metrics
Responses include `source` field:
- `"source": "cache"` - Cache hit ✅
- `"source": "database"` - Cache miss ⚠️

---

## 🧪 Testing

### Manual Testing (Postman)
Follow: [PHASE_1_CHECKLIST.md](PHASE_1_CHECKLIST.md)

### Automated Testing (Future)
```javascript
// Example test
describe('Booking Config API', () => {
  it('should seed initial configs', async () => {
    const res = await request(app)
      .post('/api/admin/booking-config/seed')
      .set('Cookie', adminToken);
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.summary.created).toBe(4);
  });
});
```

---

## 🐛 Common Issues

### Issue: "Admin access required"
**Fix:** Login as admin with `role: 'admin'`

### Issue: "Config already exists"
**Fix:** Already seeded! Use GET to view.

### Issue: "Redis connection error"
**Fix:** Redis is optional. API works without it.

### Issue: "Cannot delete critical config"
**Fix:** Use toggle to deactivate instead.

---

## 💡 Usage Examples

### Get Current MOV
```javascript
const response = await fetch(
  'http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE',
  { credentials: 'include' }
);
const { data } = await response.json();
console.log(`Current MOV: ₹${data.value}`);
```

### Update MOV
```javascript
const response = await fetch(
  'http://localhost:3000/api/admin/booking-config/MINIMUM_ORDER_VALUE',
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      value: 1299,
      reason: 'Seasonal adjustment'
    })
  }
);
```

### Check if MOV is Active
```javascript
const { data } = await getConfig('MINIMUM_ORDER_VALUE');
if (data.isActive && orderTotal < data.value) {
  alert(`Minimum order value is ₹${data.value}`);
}
```

---

## 🎨 Admin UI (Future)

```
┌─────────────────────────────────────────┐
│ Booking Configuration                   │
├─────────────────────────────────────────┤
│                                         │
│ Minimum Order Value                     │
│ ┌─────────────────────────────────────┐ │
│ │ ₹ [999]                             │ │
│ └─────────────────────────────────────┘ │
│ ☑ Active                                │
│                                         │
│ Last Updated: Nov 23, 2025 by Admin    │
│ Changes: 0 updates                      │
│                                         │
│ [Update] [View History] [Deactivate]   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ Max Reschedule Count                    │
│ ┌─────────────────────────────────────┐ │
│ │ [3]                                 │ │
│ └─────────────────────────────────────┘ │
│ ☑ Active                                │
│                                         │
│ [Update] [View History]                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🤝 Contributing

### Adding New Config Type

1. **Add to enum in model:**
```javascript
// bookingConfig.model.js
enum: [
  'MINIMUM_ORDER_VALUE',
  'YOUR_NEW_CONFIG',  // Add here
  ...
]
```

2. **Seed initial value:**
```javascript
// bookingConfig.model.js - seedInitialConfigs
{
  configKey: 'YOUR_NEW_CONFIG',
  value: 100,
  description: 'Your config description',
  metadata: {
    unit: 'count',
    displayName: 'Your Config',
    validationRules: { min: 0, max: 1000 }
  }
}
```

3. **Use in middleware:**
```javascript
const config = await BookingConfigService.getConfigByKey('YOUR_NEW_CONFIG');
if (config.success && config.data.isActive) {
  // Use config.data.value
}
```

---

## 📞 Support

### Questions?
1. Check documentation files above
2. Review API responses for error details
3. Check server logs for debugging
4. Verify MongoDB and Redis are running

### Bugs?
1. Check linter errors: `npm run lint`
2. Check server logs for stack traces
3. Verify request format matches docs
4. Test with Postman first

---

## 🎉 Success Checklist

- [ ] Server running without errors
- [ ] MongoDB connected
- [ ] Redis connected (optional)
- [ ] Logged in as admin
- [ ] Configs seeded successfully
- [ ] Can view MOV via GET API
- [ ] MOV value is 999
- [ ] All 4 configs exist in database

**If all checked:** Phase 1 Complete! ✅

---

## 📚 Additional Resources

- **Mongoose Docs:** https://mongoosejs.com/
- **Redis Docs:** https://redis.io/docs/
- **Express Docs:** https://expressjs.com/
- **Postman Docs:** https://learning.postman.com/

---

**Version:** 1.0.0  
**Last Updated:** November 23, 2025  
**Status:** Phase 1 Complete ✅

