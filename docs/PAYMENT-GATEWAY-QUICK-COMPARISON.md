# Payment Gateway Quick Comparison - Adava University

**Last Updated:** January 21, 2026  
**Context:** Stripe temporary ban - need alternative for 2-step payment flow

---

## TL;DR - Which Should I Choose?

| Your Priority | Recommended Gateway | Why |
|---------------|---------------------|-----|
| **Speed** (need it working TODAY) | **Square** | Sandbox access in 5 mins, docs are excellent, simple API |
| **Trust** (customers recognize brand) | **PayPal/Braintree** | Everyone knows PayPal, increases conversion |
| **Global** (international students) | **Adyen** | Best multi-currency support, used by Uber/Spotify |
| **Long-term** (might scale big) | **Square or Adyen** | Square for US, Adyen for global |

**Our Recommendation: Start with Square, migrate later if needed.**

---

## Feature Comparison Matrix

| Feature | Square | PayPal/Braintree | Adyen | Authorize.Net |
|---------|--------|------------------|-------|---------------|
| **Setup Time** | 🚀 30 mins | ⏱️ 2-4 hours | 📅 1-2 days | ⏱️ 4 hours |
| **Sandbox Access** | ✅ Instant | ✅ Instant | ⚠️ May need approval | ✅ Instant |
| **Card Vaulting** | ✅ Customer + Card API | ✅ Vault API | ✅ Tokenization | ✅ CIM |
| **Delayed Charge** | ✅ Save card, charge later | ✅ Vault + charge | ✅ Token + charge | ✅ Customer profile |
| **Auth Window** | 7 days | Up to 29 days | Configurable | ~30 days |
| **PCI Compliance** | ✅ Handled | ✅ Handled | ✅ Handled | ✅ Handled |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Developer UX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **US Market Fit** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **International** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Pricing** | 2.9% + 30¢ | 2.9% + 30¢ | Custom (competitive) | 2.9% + 30¢ + gateway fee |
| **Monthly Fee** | None | None | Negotiable | $25 gateway fee |

---

## Pricing Breakdown

### Square
- **Per Transaction:** 2.9% + $0.30
- **Monthly Fee:** $0
- **Setup Fee:** $0
- **For $10 charge:** $0.59 (you keep $9.41)
- **For $580 charge:** $17.12 (you keep $562.88)
- **Total fees on $590:** $17.71 (3.0%)

### PayPal/Braintree
- **Per Transaction:** 2.9% + $0.30
- **Monthly Fee:** $0 (standard)
- **Setup Fee:** $0
- **For $10 charge:** $0.59
- **For $580 charge:** $17.12
- **Total fees on $590:** $17.71 (3.0%)

### Adyen
- **Per Transaction:** ~2.5-3.0% (negotiable)
- **Monthly Fee:** Varies (can be $0 at lower volume)
- **Setup Fee:** $0
- **For $590 total:** ~$15-18

### Authorize.Net
- **Per Transaction:** 2.9% + $0.30
- **Gateway Fee:** $25/month
- **Setup Fee:** $0
- **For $590 total:** $17.71 + $25/month = expensive for low volume

**Winner for pricing: Square or PayPal (tied), Adyen if high volume**

---

## Integration Complexity

### Lines of Code (Approximate)

| Gateway | Frontend LOC | Backend LOC | Config Files | Total |
|---------|--------------|-------------|--------------|-------|
| Square | 150 | 200 | 1 (.env) | 350 |
| PayPal | 180 | 250 | 2 (.env + config) | 430 |
| Adyen | 200 | 300 | 3 (.env + config + keys) | 500 |
| Authorize.Net | 250 | 350 | 2 | 600 |

**Winner for simplicity: Square**

---

## Security & Compliance

| Aspect | Square | PayPal | Adyen | Authorize.Net |
|--------|--------|--------|-------|---------------|
| **PCI Level** | Level 1 | Level 1 | Level 1 | Level 1 |
| **Tokenization** | ✅ | ✅ | ✅ | ✅ |
| **3D Secure** | ✅ | ✅ | ✅ | ✅ |
| **Fraud Detection** | ✅ Built-in | ✅ Advanced | ✅ Best-in-class | ✅ Basic |
| **Data Encryption** | ✅ | ✅ | ✅ | ✅ |
| **Your PCI Burden** | Minimal (SAQ A) | Minimal (SAQ A) | Minimal (SAQ A) | Minimal (SAQ A) |

**All are secure - your PCI burden is minimal with any of them**

---

## Use Case Fit

### Scenario 1: Bootstrapped Startup (That's You!)
- **Need:** Fast setup, low cost, simple
- **Best:** Square
- **Reason:** No monthly fees, instant sandbox, great docs

### Scenario 2: High Trust Needed
- **Need:** Customers nervous about paying unknown brand
- **Best:** PayPal
- **Reason:** Everyone knows PayPal, increases conversion

### Scenario 3: International Students
- **Need:** Multi-currency, global cards
- **Best:** Adyen
- **Reason:** Handles 135+ currencies, best international support

### Scenario 4: High Volume (1000+ students/year)
- **Need:** Lower per-transaction fees
- **Best:** Adyen (negotiate rates)
- **Reason:** Custom pricing, volume discounts

---

## Real-World Examples

### Who Uses What?

**Square:**
- Weebly (website builder)
- Caviar (food delivery)
- Thousands of small businesses
- **Good for:** SMBs, bootstrapped startups

**PayPal/Braintree:**
- Airbnb (uses Braintree)
- Uber (started with Braintree)
- GitHub (uses Braintree)
- **Good for:** Consumer-facing apps, trust-sensitive

**Adyen:**
- Microsoft
- Spotify
- Uber (switched from Braintree)
- Etsy
- **Good for:** Large scale, international

**Authorize.Net:**
- Many older e-commerce sites
- B2B companies
- **Good for:** Enterprise with existing Authorize.Net

---

## Decision Tree

```
START: Need payment processing (Stripe banned)
  │
  ├─ Need it working in < 1 day?
  │    └─ YES → Square ✅
  │
  ├─ Customers trust PayPal more?
  │    └─ YES → PayPal/Braintree ✅
  │
  ├─ Primarily international students?
  │    └─ YES → Adyen ✅
  │
  ├─ High volume (> 1000 transactions/mo)?
  │    └─ YES → Adyen (negotiate rates) ✅
  │
  └─ Default case → Square ✅
```

---

## Migration Path

If you start with Square and need to switch later:

### From Square to PayPal
- **Difficulty:** Medium
- **Time:** 1-2 days
- **Data:** Export customers, re-vault cards (requires user action)

### From Square to Adyen
- **Difficulty:** Medium-High
- **Time:** 3-5 days
- **Data:** Export, re-vault cards

### From Square to Stripe (when unbanned)
- **Difficulty:** Low (APIs are similar)
- **Time:** 1 day
- **Data:** Export, re-vault cards

**Key Point:** Abstract your payment logic behind an interface to make switching easier.

---

## Risk Assessment

| Risk | Square | PayPal | Adyen | Mitigation |
|------|--------|--------|-------|------------|
| **Account Ban** | Low | Medium | Low | Follow TOS, proper KYC |
| **Downtime** | Very Low | Low | Very Low | Have backup gateway ready |
| **Rate Changes** | Low | Medium | Low | Lock in rates in contract |
| **Integration Breaking** | Low | Low | Low | Pin SDK versions |

---

## Support Quality

### Response Times (Community + Official)

| Gateway | Community | Official Support | Phone Support |
|---------|-----------|------------------|---------------|
| Square | Active forum | 24-48 hours | ✅ Yes |
| PayPal | Very active | 12-24 hours | ✅ Yes |
| Adyen | Active | 4-12 hours (varies by tier) | ✅ Yes (enterprise) |
| Authorize.Net | Less active | 24-48 hours | ✅ Yes |

---

## The 80/20 Rule

**80% of startups should use Square because:**
1. ✅ Fastest to implement (literally today)
2. ✅ No monthly fees
3. ✅ Great docs = less frustration
4. ✅ Easy to understand pricing
5. ✅ Handles 90% of use cases perfectly

**Switch to something else ONLY if:**
- You need international multi-currency (→ Adyen)
- PayPal brand recognition is critical (→ Braintree)
- You have > $100k/month volume (→ negotiate with Adyen)
- You need advanced fraud tools (→ Adyen)

---

## Final Recommendation

### For Adava University: Use Square

**Reasons:**
1. ✅ You can implement it TODAY (literally in next 4 hours)
2. ✅ No monthly fees (Authorize.Net charges $25/mo)
3. ✅ Simple pricing (no hidden fees)
4. ✅ Great developer experience
5. ✅ Handles your exact use case perfectly (charge $10, save card, charge $580 later)
6. ✅ US-focused (most of your students likely US-based)
7. ✅ Can switch later if needed

**Next Steps:**
1. Read: `/docs/SQUARE-IMPLEMENTATION-GUIDE.md`
2. Sign up: https://developer.squareup.com/
3. Get sandbox credentials (5 minutes)
4. Follow implementation guide (4-6 hours)
5. Test with test cards
6. Go live

---

## Resources

- **Payment Gateway Alternatives:** `/docs/PAYMENT-GATEWAY-ALTERNATIVES.md`
- **Square Implementation Guide:** `/docs/SQUARE-IMPLEMENTATION-GUIDE.md`
- Square Docs: https://developer.squareup.com/docs
- PayPal Docs: https://developer.paypal.com/
- Adyen Docs: https://docs.adyen.com/
