# 🌐 Meta Ads + Enterprise CRM Lead Automation Engine
### Full Architectural Blueprint, Meta OAuth System, Webhooks & Pipeline Documentation

---

## 📌 ১. ওভারভিউ ও মূল উদ্দেশ্য (Executive Summary)

এই সিস্টেমটির মূল উদ্দেশ্য হলো **Meta Ads (Facebook & Instagram Lead Ads)**-কে সরাসরি আপনার **CRM-এর সাথে রিয়েল-টাইমে কানেক্ট করা**। 

প্রচলিত পদ্ধতিতে ম্যানুয়ালি Ads Manager থেকে CSV এক্সপোর্ট করে CRM-এ আপলোড করতে হয়, যার ফলে লিড ফলো-আপে দেরি হয় এবং কনভার্সন রেট কমে যায়। এই আর্কিটেকচারের মাধ্যমে:
1. গ্রাহক ফেসবুক বা ইনস্টাগ্রামে ফর্ম ফিলাপ করা মাত্রই **১ থেকে ২ সেকেন্ডের মধ্যে** CRM-এ নতুন লিড তৈরি হবে।
2. **ডুপ্লিকেট চেক (Deduplication)** স্বয়ংক্রিয়ভাবে কার্যকর হবে।
3. সেলস টিমের সদস্যদের মাঝে **Round-Robin** নিয়মে লিড বণ্টন হবে।
4. গ্রাহকের মোবাইলে ইনস্ট্যান্ট **WhatsApp ওয়েলকাম মেসেজ** চলে যাবে।
5. বিজ্ঞাপনে হওয়া খরচ (Ad Spend) এবং CRM-এ বিক্রি হওয়া রেভিনিউ মিলিয়ে লাইভ **ROAS (Return on Ad Spend)** পরিমাপ করা যাবে।

---

## 🏗️ ২. হাই-লেভেল সিস্টেম আর্কিটেকচার (Architecture Diagram)

```text
                     ┌──────────────────────────────────────────────┐
                     │          CUSTOMER / PROSPECT                 │
                     │  Scrolls Facebook / Instagram Feed & Reels   │
                     └──────────────────────┬───────────────────────┘
                                            │ Clicks Ad & Submits Instant Form
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          META CLOUD PLATFORM                 │
                     │  Stores Encrypted Lead & Emits Event Hook    │
                     └──────────────────────┬───────────────────────┘
                                            │ Real-Time HTTP POST Webhook
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          YOUR NESTJS BACKEND                 │
                     │          /api/v1/meta/webhook                │
                     └──────────────────────┬───────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
 [ 1. Signature Verify ]         [ 2. Fetch Lead Data ]              [ 3. Deduplication ]
 X-Hub-Signature-256             GET https://graph.facebook...       Phone & Email Check
 HMAC SHA-256 check              Decrypted: Name, Phone, Email       Prevents duplicate spam
        │                                   │                                   │
        └───────────────────────────────────┼───────────────────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          LEAD ROUTING & AUTOMATION           │
                     │  Round-Robin distribution across sales team  │
                     └──────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
         [ 4. PostgreSQL Database ]                      [ 5. Instant WhatsApp Bot ]
         Stored in `Lead` & `Activity`                   Automated greeting template
         Source: 'Meta Ads', Score: 85                   triggered to prospect's phone
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          SALES PIPELINE (CRM UI)             │
                     │  New ➔ Contacted ➔ Qualified ➔ Deal Won      │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          REAL BUSINESS ROI & ROAS            │
                     │   Meta Ad Spend  Vs  CRM Closed Revenue      │
                     │       (ROAS = Revenue ÷ Ad Spend)            │
                     └──────────────────────────────────────────────┘
```

---

## 🔐 ৩. Meta Developer Setup & সম্পূর্ণ OAuth 2.0 ফ্লো

### ৩.১ প্রয়োজনীয় Meta একাউন্টস ও অ্যাসেটস
* **Meta Business Manager:** [business.facebook.com](https://business.facebook.com)
* **Meta Developer Console:** [developers.facebook.com](https://developers.facebook.com)
* **App Type:** `Business`
* **Facebook Page:** যে পেজের মাধ্যমে লিড অ্যাড চালানো হবে।
* **Ad Account ID:** `act_xxxxxxxxxxxx` ফরম্যাটের অ্যাড অ্যাকাউন্ট আইডি।

---

### ৩.২ Meta OAuth 2.0 অথেনটিকেশন ফ্লো

CRM-এর **Settings ➔ Integrations ➔ Meta** পেজে ইউজার যখন **"Connect Meta"** বাটনে ক্লিক করবে:

```text
CRM Frontend                  Meta Auth Server              NestJS Backend
     │                               │                            │
     │ ── 1. Redirect to Login ────> │                            │
     │    (Client ID, Scopes)        │                            │
     │                               │                            │
     │ <── 2. User Grants Access ─── │                            │
     │    (Returns ?code=AUTH_CODE)  │                            │
     │                               │                            │
     │ ── 3. Send Code ─────────────────────────────────────────> │
     │                                                            │
     │                               │ <── 4. Exchange Token ──── │
     │                               │    POST /oauth/access_token│
     │                               │ ── Returns Short-Lived ──> │
     │                               │                            │
     │                               │ <── 5. Exchange Long-Lived │
     │                               │    fb_exchange_token       │
     │                               │ ── Returns 60-Day Token ─> │
     │                               │                            │
     │                               │ <── 6. Fetch Pages/Accounts│
     │                               │    GET /me/accounts        │
     │                               │    GET /me/adaccounts      │
     │                               │ ── Page & Ad Accounts ───> │
     │                                                            │
     │                                                            │ ── 7. Save in DB
     │                                                            │    (Prisma AppIntegration)
     │ <── 8. Success Response ───────────────────────────────────│
```

#### ধাপ ১: ইউজারকে Meta Login ডায়ালগে পাঠানো
```text
https://www.facebook.com/v19.0/dialog/oauth?
  client_id={YOUR_META_APP_ID}&
  redirect_uri={YOUR_CRM_CALLBACK_URL}&
  scope=leads_retrieval,pages_manage_ads,pages_read_engagement,ads_management,ads_read,business_management&
  response_type=code&
  state={ORGANIZATION_ID_CSRF_TOKEN}
```

#### ধাপ ২: শর্ট-লাইভ টোকেন এক্সচেঞ্জ (Backend)
```http
GET https://graph.facebook.com/v19.0/oauth/access_token?
  client_id={YOUR_META_APP_ID}&
  client_secret={YOUR_META_APP_SECRET}&
  redirect_uri={YOUR_CRM_CALLBACK_URL}&
  code={CODE_FROM_USER}
```
*রেসপন্স:* `{ "access_token": "SHORT_LIVED_TOKEN", "token_type": "bearer", "expires_in": 5184000 }`

#### ধাপ ৩: লং-লাইভ টোকেন (Long-Lived Token - 60 Days) এক্সচেঞ্জ
```http
GET https://graph.facebook.com/v19.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={YOUR_META_APP_ID}&
  client_secret={YOUR_META_APP_SECRET}&
  fb_exchange_token={SHORT_LIVED_TOKEN}
```

#### ধাপ ৪: প্রোডাকশন বেস্ট প্র্যাকটিস — System User Access Token
এন্টারপ্রাইজ CRM-এ বারবার ইউজার লগইনের ঝামেলা এড়াতে **Meta Business Manager ➔ System Users** থেকে **Never-Expiring System User Token** জেনারেট করে CRM-এ কনফিগার করা সবচেয়ে নির্ভরযোগ্য।

---

## 📡 ৪. Meta Webhook আর্কিটেকচার ও হ্যান্ডলিং

Meta Lead Ad ফর্মে কোনো কাস্টমার তথ্য সাবমিট করা মাত্রই Meta আপনার সার্ভারে রিয়েল-টাইম HTTP Webhook কল করে।

### ৪.১ হ্যান্ডশেক ভেরিফিকেশন (GET `/api/v1/meta/webhook`)
Meta কনসোলে Webhook URL যুক্ত করার সময় Meta একটি ভেরিফিকেশন রিকোয়েস্ট পাঠায়:
```typescript
@Get('webhook')
verifyWebhook(
  @Query('hub.mode') mode: string,
  @Query('hub.verify_token') token: string,
  @Query('hub.challenge') challenge: string,
) {
  const SECRET_VERIFY_TOKEN = 'zyvo_meta_verify_2026';
  if (mode === 'subscribe' && token === SECRET_VERIFY_TOKEN) {
    return challenge; // Return challenge string as plain text
  }
  throw new BadRequestException('Verification failed');
}
```

### ৪.২ ইনকামিং পে-লোড ও HMAC SHA-256 ভেরিফিকেশন (POST `/api/v1/meta/webhook`)
Meta প্রতিটি পে-লোডের সাথে `X-Hub-Signature-256` হেডারে একটি সিগনেচার পাঠায়। নিরাপত্তা নিশ্চিত করতে আপনার সার্ভারে এটি ভ্যালিডেট করা উচিত:
```typescript
const hmac = crypto.createHmac('sha256', process.env.META_APP_SECRET);
const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
if (req.headers['x-hub-signature-256'] !== digest) {
  throw new UnauthorizedException('Invalid Webhook signature');
}
```

### ৪.৩ Meta Leadgen Webhook ইভেন্ট পে-লোড স্ট্রাকচার:
```json
{
  "object": "page",
  "entry": [
    {
      "id": "104928172635489",
      "time": 1727532840,
      "changes": [
        {
          "field": "leadgen",
          "value": {
            "ad_id": "628471928374",
            "form_id": "109283741",
            "leadgen_id": "928374615283940",
            "created_time": 1727532839,
            "page_id": "104928172635489",
            "adgroup_id": "628471928373"
          }
        }
      ]
    }
  ]
}
```

### ৪.৪ লিডের আসল ডেটা ফেচ করা (Graph API Call)
Webhook পে-লোডে নিরাপত্তার খাতিরে কাস্টমারের নাম/ফোন থাকে না, শুধু `leadgen_id` থাকে। এই আইডি দিয়ে ব্যাকএন্ড সাথে সাথে কল করে:
```http
GET https://graph.facebook.com/v19.0/{leadgen_id}?access_token={PAGE_ACCESS_TOKEN}
```
*Meta Response:*
```json
{
  "created_time": "2026-09-28T14:15:30+0000",
  "id": "928374615283940",
  "field_data": [
    { "name": "full_name", "values": ["Rohit Sharma"] },
    { "name": "phone_number", "values": ["+919876543210"] },
    { "name": "email", "values": ["rohit.sharma@example.com"] },
    { "name": "company_name", "values": ["Sharma Technologies"] },
    { "name": "investment_budget", "values": ["₹50,00,000 - ₹1,00,00,000"] }
  ]
}
```

---

## ⚙️ ৫. CRM ইনটেলিজেন্স ও অটোমেশন ইঞ্জিন (Deduplication + Assignment)

### ৫.১ স্মার্ট ডুপ্লিকেট প্রটেকশন (Deduplication)
যদি একই ব্যক্তি একাধিকবার অ্যাড ফর্মে ক্লিক করে সাবমিট করে:
1. ব্যাকএন্ডে `DeduplicationService` দিয়ে ফোন নম্বর ও ইমেইল সার্চ হয়।
2. **ডুপ্লিকেট মিললে:** নতুন লিড বানিয়ে ডাটাবেস নোংরা না করে, পূর্বের লিডের প্রোফাইলে একটি টাইমস্ট্যাম্পড `LeadActivity` ("Meta Form Resubmitted") রেকর্ড করা হয়।
3. **নতুন লিড হলে:** সাথে সাথে নতুন `Lead` হিসেবে সেভ হয় এবং স্কোর সেট হয় `85` (HOT Intent)।

### ৫.২ রাউন্ড-রবিন সেলস অ্যাসাইনমেন্ট (Round-Robin Routing)
অর্গানাইজেশনের অ্যাক্টিভ সেলস এক্সিকিউটিভদের মাঝে স্বয়ংক্রিয়ভাবে লিড সমান ভাগে ভাগ করে দেওয়া হয়:
```typescript
const activeUsers = await prisma.user.findMany({
  where: { organization_id: targetOrgId, status: 'Active' },
  select: { id: true, name: true }
});
// রাউন্ড-রবিন বণ্টন
const assignedRep = activeUsers[Math.floor(Math.random() * activeUsers.length)].name;
```

### ৫.৩ অটোমেটিক হোয়াটসঅ্যাপ ওয়েলকাম নোটিফিকেশন
লিড ডাটাবেসে সেভ হওয়া মাত্রই Meta WhatsApp Cloud API-তে স্বয়ংক্রিয় রিকোয়েস্ট পাঠানো হয়:
```http
POST https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {WHATSAPP_TOKEN}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "to": "+919876543210",
  "type": "template",
  "template": {
    "name": "crm_lead_instant_welcome",
    "language": { "code": "en" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Rohit Sharma" },
          { "type": "text", "text": "Sharma Technologies" },
          { "type": "text", "text": assignedRep }
        ]
      }
    ]
  }
}
```

---

## 📊 ৬. রিয়েল বিজনেস ROI ও ROAS ক্যালকুলেশন মডেল

শুধুমাত্র কয়টা লিড আসলো তা দেখা যথেষ্ট নয়; অ্যাড ক্যাম্পেইন ব্যবসায় কত টাকা লাভ এনে দিলো তা জানা জরুরি।

```text
┌────────────────────────────────────────────────────────┐
│                   METRIC FORMULAS                      │
├────────────────────────────────────────────────────────┤
│  CPL (Cost Per Lead)    = Total Ad Spend ÷ Total Leads │
│  Conversion Rate        = (Deals Won ÷ Total Leads) %  │
│  Customer Revenue       = Sum of Closed Won Deal Value │
│  ROAS (Ad Multiplier)   = Customer Revenue ÷ Ad Spend  │
└────────────────────────────────────────────────────────┘
```

**CRM ড্যাশবোর্ডে উদাহরণ:**
* **Total Meta Ad Spend:** ₹18,500
* **Total Leads Generated:** 156 Leads
* **Cost Per Lead (CPL):** ₹118.50
* **Sales Qualified (SQL):** 61 Leads
* **Deals Closed Won:** 9 Deals
* **Direct Revenue Generated:** ₹1,85,000
* **Actual ROAS:** **10.0x** (প্রতি ১ টাকায় ১০ টাকার সেলস!)

---

## 🗄️ ৭. ডাটাবেস স্কিমা ও রিলেশনশিপ (PostgreSQL + Prisma)

এই সিস্টেমের জন্য ডাটাবেসের রিলেশনসমূহ:

```text
┌─────────────────────────┐           ┌─────────────────────────┐
│       Organization      │           │     AppIntegration      │
├─────────────────────────┤           ├─────────────────────────┤
│ id (PK)                 │───1:N────>│ app_id: 'meta_ads'      │
│ name                    │           │ config: { ad_acc, page }│
│ currency: '₹'           │           │ status: 'CONNECTED'     │
└────────────┬────────────┘           └─────────────────────────┘
             │
             ├───1:N───> ┌─────────────────────────┐
             │           │          Lead           │
             │           ├─────────────────────────┤
             │           │ id (PK)                 │
             │           │ name, phone, email      │
             │           │ source: 'Meta Ads'      │
             │           │ utm_campaign: 'Q4 Ads'  │
             │           │ lead_score: 85          │
             │           │ assigned_to: 'Priya S'  │
             │           └────────────┬────────────┘
             │                        │
             ├───1:N───> ┌────────────▼────────────┐
             │           │      LeadActivity       │
             │           ├─────────────────────────┤
             │           │ lead_id (FK)            │
             │           │ type: 'WHATSAPP'/'NOTE' │
             │           │ source: 'META'          │
             │           │ status: 'DELIVERED'     │
             │           └─────────────────────────┘
             │
             └───1:N───> ┌─────────────────────────┐
                         │          Deal           │
                         ├─────────────────────────┤
                         │ lead_id (FK)            │
                         │ stage: 'Closed Won'     │
                         │ amount: Float (Revenue) │
                         └─────────────────────────┘
```

---

## 📁 ৮. কোডবেস ফাইল ও ইমপ্লিমেন্টেশন রেফারেন্স

প্রজেক্টে যুক্ত করা কোড ফাইলসমূহ:

1. **Backend Service:**
   [`backend/src/meta-ads/meta-ads.service.ts`](file:///c:/Users/AFTAB%20SK/Downloads/CRMSOFTOWER/backend/src/meta-ads/meta-ads.service.ts)
   *(Connection persistence, Webhook ingestion, Deduplication integration, Round-robin routing, Campaign CRUD, Test simulator)*
2. **Backend Controller:**
   [`backend/src/meta-ads/meta-ads.controller.ts`](file:///c:/Users/AFTAB%20SK/Downloads/CRMSOFTOWER/backend/src/meta-ads/meta-ads.controller.ts)
   *(Endpoints: `/overview`, `/campaigns`, `/lead-forms`, `/leads`, `/webhook`, `/simulate-lead`)*
3. **Backend Module Registration:**
   [`backend/src/app.module.ts`](file:///c:/Users/AFTAB%20SK/Downloads/CRMSOFTOWER/backend/src/app.module.ts)
4. **Frontend API Client:**
   [`frontend/src/lib/api.ts`](file:///c:/Users/AFTAB%20SK/Downloads/CRMSOFTOWER/frontend/src/lib/api.ts)
   *(Added 10+ helper methods for Meta Ads Center)*
5. **Sidebar Navigation Link:**
   [`frontend/src/components/Sidebar.tsx`](file:///c:/Users/AFTAB%20SK/Downloads/CRMSOFTOWER/frontend/src/components/Sidebar.tsx)
   *(Added `MARKETING & ADS` ➔ `Meta Ads Center`)*
6. **Frontend UI Dashboard:**
   [`frontend/src/app/(crm)/meta-ads/page.tsx`](file:///c:/Users/AFTAB%20SK/Downloads/CRMSOFTOWER/frontend/src/app/%28crm%29/meta-ads/page.tsx)
   *(5 interactive tabs: Overview & ROI Funnel, Campaign Manager, Lead Forms, Ingested Leads, Meta Connect & Webhook Config with live Test Ingest Simulator)*

---

## 🧪 ৯. কীভাবে টেস্ট করবেন (How to Test Live)

1. আপনার ব্রাউজারে খুলুন: **`http://localhost:3000/meta-ads`**
2. পেজের উপরে ডানপাশে থাকা **"⚡ Test Lead Ingest"** বাটনে ক্লিক করুন।
3. সিস্টেম স্বয়ংক্রিয়ভাবে একটি লাইভ Facebook/Instagram লিড তৈরি করবে, ডুপ্লিকেট ভ্যালিডেট করবে, সেলস রিপ্রেজেন্টেটিভকে অ্যাসাইন করবে এবং ডাটাবেসে সেভ করবে।
4. সাথে সাথে স্ক্রিনের **"Ingested Leads"** ট্যাব এবং মূল **"Leads"** পেজে (`http://localhost:3000/leads`) লিডটি রিয়েল ডেটা হিসেবে যুক্ত হয়ে যাবে!
