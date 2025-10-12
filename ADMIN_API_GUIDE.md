# Admin API Guide - Social Media Account Marketplace

## Overview
This guide shows you how to upload social media accounts for sale using the admin API endpoint.

## Admin API Endpoint

**Endpoint:** `POST /api/admin/products`  
**Authentication:** Requires `x-api-key` header with your `ADMIN_API_KEY`

## API Key Setup

Your admin API key is stored in the environment variable: `ADMIN_API_KEY`

To check your current key value:
1. Go to your Replit Secrets panel
2. Find `ADMIN_API_KEY`
3. Use this value in your API requests

## Request Format

### Using cURL

```bash
curl -X POST https://your-replit-app.replit.dev/api/admin/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ADMIN_API_KEY_HERE" \
  -d '{
    "title": "Instagram Account - 10K Followers",
    "description": "Verified account with active engagement. Fashion niche.",
    "price": 15000,
    "category": "instagram",
    "images": ["https://example.com/screenshot1.jpg"],
    "accountUsername": "fashion_guru_10k",
    "accountPassword": "SecurePassword123!",
    "accountEmail": "account@email.com",
    "additionalInfo": "Recovery email: recovery@email.com, 2FA disabled"
  }'
```

### Using JavaScript/Fetch

```javascript
const response = await fetch('https://your-app.replit.dev/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_ADMIN_API_KEY_HERE'
  },
  body: JSON.stringify({
    title: "TikTok Account - 50K Followers",
    description: "Comedy content creator with high engagement rate",
    price: 25000,
    category: "tiktok",
    images: ["https://example.com/tiktok-screenshot.jpg"],
    accountUsername: "comedy_king_50k",
    accountPassword: "TikTok@Pass2024",
    accountEmail: "tiktok@email.com",
    additionalInfo: "Email verified, phone number: +234..."
  })
});

const data = await response.json();
console.log('Product created:', data);
```

## Required Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `title` | string | Product title | ✅ Yes |
| `description` | string | Product description | ✅ Yes |
| `price` | number | Price in Naira (integer) | ✅ Yes |
| `category` | string | Category (instagram, twitter, tiktok, facebook, linkedin, etc.) | ✅ Yes |
| `images` | array | Array of image URLs | ✅ Yes |
| `accountUsername` | string | Social media username | ✅ Yes |
| `accountPassword` | string | Social media password | ✅ Yes |
| `accountEmail` | string | Account email (valid format) | ❌ Optional |
| `additionalInfo` | string | Recovery info, 2FA status, etc. | ❌ Optional |
| `status` | string | Product status (default: "available") | ❌ Optional |

## Example Test Accounts

### Example 1: Instagram Account
```json
{
  "title": "Instagram Business Account - 15K Followers",
  "description": "Food blogger account with high engagement. Verified badge included.",
  "price": 20000,
  "category": "instagram",
  "images": ["https://picsum.photos/400/300"],
  "accountUsername": "foodie_paradise_15k",
  "accountPassword": "SecurePass2024!",
  "accountEmail": "foodie@gmail.com",
  "additionalInfo": "Recovery email: backup@gmail.com, 2FA: Disabled",
  "status": "available"
}
```

### Example 2: Twitter Account
```json
{
  "title": "Twitter Account - 8K Followers",
  "description": "Tech news and commentary. Active daily engagement.",
  "price": 12000,
  "category": "twitter",
  "images": ["https://picsum.photos/400/301"],
  "accountUsername": "tech_insights_8k",
  "accountPassword": "Twitter@2024Pass",
  "accountEmail": "tech@email.com",
  "additionalInfo": "Email verified, account created in 2020"
}
```

### Example 3: TikTok Account
```json
{
  "title": "TikTok Creator - 50K Followers",
  "description": "Dance and lifestyle content. Monetization enabled.",
  "price": 35000,
  "category": "tiktok",
  "images": ["https://picsum.photos/400/302"],
  "accountUsername": "dance_queen_50k",
  "accountPassword": "TikTok!Pass123",
  "accountEmail": "danceq@gmail.com",
  "additionalInfo": "Creator Fund approved, Phone: +234..."
}
```

## Quick Test Script

Create a file called `upload-account.js`:

```javascript
const ADMIN_API_KEY = 'your-admin-key-here';
const API_URL = 'https://your-app.replit.dev/api/admin/products';

async function uploadAccount(accountData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_API_KEY
      },
      body: JSON.stringify(accountData)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error:', error);
      return;
    }

    const product = await response.json();
    console.log('✅ Account uploaded successfully!');
    console.log('Product ID:', product.id);
    console.log('Title:', product.title);
    console.log('Price: ₦' + product.price.toLocaleString());
  } catch (error) {
    console.error('Failed to upload:', error);
  }
}

// Example account
const testAccount = {
  title: "Instagram Growth Account - 5K Followers",
  description: "General content account with steady growth",
  price: 5000,
  category: "instagram",
  images: ["https://picsum.photos/400/300"],
  accountUsername: "test_account_5k",
  accountPassword: "TestPass123!",
  accountEmail: "test@example.com",
  additionalInfo: "Good for resale or personal use"
};

uploadAccount(testAccount);
```

Run with: `node upload-account.js`

## Error Responses

### Invalid API Key (403)
```json
{
  "message": "Forbidden: Invalid API key"
}
```

### Missing Required Fields (400)
```json
{
  "message": "Invalid product data",
  "errors": [
    {
      "path": ["accountPassword"],
      "message": "Account password is required"
    }
  ]
}
```

### Invalid Email Format (400)
```json
{
  "message": "Invalid product data",
  "errors": [
    {
      "path": ["accountEmail"],
      "message": "Valid email is required"
    }
  ]
}
```

## Purchase Flow & Race Condition Handling

### How It Works

When a user purchases an account:

1. **Product Check** - System verifies product exists and is available
2. **Balance Check** - Verifies user has sufficient funds
3. **Atomic Update** - Marks product as "sold" ONLY if still "available"
4. **Wallet Deduction** - Deducts amount from buyer's wallet
5. **Purchase Record** - Creates purchase with credentials
6. **Transaction Log** - Records the transaction

### Race Condition Protection ✅

**Scenario:** Two users try to buy the same account simultaneously

```
User A clicks "Buy" → Transaction A starts
User B clicks "Buy" → Transaction B starts

Transaction A: Check status = "available" ✅
Transaction B: Check status = "available" ✅

Transaction A: UPDATE products SET status='sold' WHERE id=X AND status='available' → SUCCESS (1 row)
Transaction B: UPDATE products SET status='sold' WHERE id=X AND status='available' → FAIL (0 rows)

Transaction A: Proceeds → Wallet deducted → Purchase created ✅
Transaction B: Stops → Returns "Product was just purchased by another user" ❌
```

**Result:** User A gets the account, User B gets a clear error message.

### Account Visibility After Purchase

Once an account is purchased:
- ❌ Removed from public product listings (`/api/products`)
- ❌ Not shown to other buyers
- ✅ Available to buyer in "My Purchases" with full credentials
- ✅ Status changed to "sold"

## Testing the Complete Flow

### Step 1: Upload a Test Account

```bash
curl -X POST https://your-app.replit.dev/api/admin/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{
    "title": "Test Account - 1K Followers",
    "description": "For testing purchase flow",
    "price": 1000,
    "category": "instagram",
    "images": ["https://picsum.photos/400/300"],
    "accountUsername": "test_user_1k",
    "accountPassword": "TestPassword123",
    "accountEmail": "test@test.com"
  }'
```

Save the returned `product.id`

### Step 2: Check Public Listing

Visit: `https://your-app.replit.dev/api/products`

You should see your test account listed (without credentials).

### Step 3: Make a Purchase

1. Log into the app as a user
2. Deposit at least ₦1000 to your wallet
3. Click "Buy" on the test account
4. Purchase should succeed

### Step 4: Verify Purchase

1. Go to "My Purchases" page
2. You should see the account with FULL credentials:
   - Username: `test_user_1k`
   - Password: `TestPassword123`
   - Email: `test@test.com`

### Step 5: Verify Removal

Visit: `https://your-app.replit.dev/api/products`

The test account should NO LONGER appear in the listing.

### Step 6: Test Race Condition (Optional)

Try to purchase the same account with a second user → Should get error:
```json
{
  "message": "Product not available"
}
```

## Security Notes

- ✅ Credentials are NEVER exposed in public product listings
- ✅ Only the buyer can see credentials in their purchases
- ✅ Admin API requires secret key authentication
- ✅ Race conditions are handled atomically
- ✅ Paystack payment verification happens server-side
- ✅ Wallet deductions are atomic and cannot be double-spent

## Support

For issues or questions, check the application logs or contact support.
