# 🤖 AI_FEATURE — SMS & Email Notification Service (Module 14)

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> The Order Confirmation Modal feature (m14-order-confirmation-modal) must be complete before this one.
> This document describes the Spring Boot backend notification wiring for SMS and email.

---

## Feature Identity

- **Feature Name:** SMS & Email Notification Service
- **Related Area:** Backend — Spring Boot / Twilio / Vonage

---

## Feature Goal

When a customer places an order and checks "By Phone" and/or "By Email" in the Order Confirmation Modal, the Spring Boot API sends an SMS and/or email confirmation. The `sendSMS` and `sendEmail` booleans from the mobile app's POST payload trigger the notification calls after the order is successfully created.

---

## Feature Scope

### In Scope (Included)

- Accept `sendEmail` and `sendSMS` booleans from the POST `/api/orders` payload
- Send SMS via Vonage (primary) or Twilio (fallback — SDK already in pom.xml)
- Send email via Notify.eu REST API
- Wire notification calls in `OrderService.createOrder()` after the order is persisted
- Configuration via `application.properties`

### Out of Scope (Excluded)

- Any changes to the mobile app (handled in the modal feature)
- Notification on status updates (only on order creation)
- Retry logic for failed notifications

---

## Implementation Status

**All backend code is already written.** No code changes are needed — only credentials in `application.properties`.

| File | Status | Notes |
|---|---|---|
| `service/NotificationService.java` | ✅ Complete | Twilio SMS + Notify.eu email wiring |
| `service/OrderService.java` | ✅ Complete | Calls `notificationService.sendSms()` / `sendEmail()` after order created |
| `models/Order.java` | ✅ Complete | `send_email` and `send_sms` columns exist |
| `dtos/order/ApiCreateOrderDTO.java` | ✅ Fixed | `@JsonProperty` corrected (see critical fix below) |
| `application.properties` | ⚠️ Needs credentials | Placeholder values in place |

---

## Critical Fix Applied — `ApiCreateOrderDTO.java`

The original DTO had mismatched `@JsonProperty` annotations. Two fixes were made:

### Fix 1 — Notification flag field names
The mobile app sends camelCase (`sendEmail`, `sendSMS`), but the DTO originally expected snake_case (`send_email`, `send_sms`).

**Before:**
```java
@JsonProperty("send_email")
private boolean sendEmail = false;

@JsonProperty("send_sms")
private boolean sendSms = false;
```

**After (correct):**
```java
@JsonProperty("sendEmail")
private boolean sendEmail = false;

@JsonProperty("sendSMS")
private boolean sendSms = false;
```

### Fix 2 — Product item field name
The mobile app sends `product_id` but the `ProductItem` inner class had no `@JsonProperty`, defaulting to `id`.

**Before:**
```java
public static class ProductItem {
    private int id;
    private int quantity;
}
```

**After (correct):**
```java
public static class ProductItem {
    @JsonProperty("product_id")
    private int id;
    private int quantity;
}
```

---

## Configuration Required

Open `serverJAVA/src/main/resources/application.properties` and fill in the notification credentials.

### Vonage SMS (primary)

> ⚠️ **NOTE:** The `NotificationService.java` currently uses Twilio SDK for SMS (it was the first SDK installed). If switching to Vonage SDK for SMS, `NotificationService.sendSms()` needs to be rewritten — see the Vonage section below.

The Vonage SDK (`com.vonage:server-sdk:9.3.1`) is in `pom.xml`. To use it for SMS, update `NotificationService.sendSms()` to use the Vonage client instead of the Twilio client.

**Vonage credentials** (from [dashboard.nexmo.com](https://dashboard.nexmo.com)):
```properties
vonage.api-key=your-vonage-api-key
vonage.api-secret=your-vonage-api-secret
vonage.from-number=your-vonage-virtual-number
```

> ⚠️ **Trial Account Note:** Vonage free trial accounts sometimes fail to provision a virtual number immediately. Error: *"Unfortunately there was a problem activating your phone number for the free trial. Usually this problem resolves itself within 24 hours."* — Wait 24 hours and retry if this happens.

### Twilio SMS (alternative)

Twilio SDK (`com.twilio.sdk:twilio:11.3.5`) is already in `pom.xml`. `NotificationService.sendSms()` is already written for Twilio.

**Twilio credentials** (from [console.twilio.com](https://console.twilio.com)):
```properties
twilio.account-sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
twilio.auth-token=your-auth-token
twilio.from-number=+1XXXXXXXXXX
```

> ⚠️ **Trial Account Note:** Twilio free trial cannot send SMS to unverified US numbers. You must either upgrade to a paid account or verify the recipient's number in the Twilio console under "Verified Caller IDs."

### Email (Notify.eu)

```properties
notify.api-url=https://api.notify.eu/notification/send
notify.client-id=your-notify-client-id
notify.secret-key=your-notify-secret-key
notify.template-id=your-template-notification-type-name
notify.language=en
```

---

## How NotificationService Works

### SMS (`sendSms`)
```java
// NotificationService.java — Twilio implementation
public void sendSms(Order order, Customer customer) {
    String phone = customer.getPhone();
    // Prepends +1 if number doesn't start with +
    String toPhone = phone.startsWith("+") ? phone : "+1" + phone;
    String body = "Your RocketFood order #" + order.getId() + " has been received!...";
    Message.creator(new PhoneNumber(toPhone), new PhoneNumber(twilioFromNumber), body).create();
}
```

### Email (`sendEmail`)
```java
// NotificationService.java — Notify.eu REST API implementation
// Sends a POST to notify.api-url with X-ClientId and X-SecretKey headers
// Uses customer email from customer.getEmail() or falls back to customer.getUser().getEmail()
// Sends order ID, restaurant name, and total cost in the template params
```

### Trigger point in OrderService
```java
// OrderService.createOrder() — after order is persisted and flushed
if (createOrderDTO.isSendEmail()) {
    notificationService.sendEmail(finalOrder, customer);
}
if (createOrderDTO.isSendSms()) {
    notificationService.sendSms(finalOrder, customer);
}
```

---

## Maven Setup (Required to Build)

Maven is not installed by default on macOS and Homebrew's formula requires full Xcode. Manual install:

```bash
# Download
curl -L -O https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz

# Extract and install
tar -xzf apache-maven-3.9.6-bin.tar.gz
sudo rm -rf /opt/maven
sudo mv apache-maven-3.9.6 /opt/maven

# Add to PATH (zsh)
echo 'export MAVEN_HOME=/opt/maven' >> ~/.zshrc
echo 'export PATH=$MAVEN_HOME/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Verify
mvn --version
```

Then build the project:
```bash
cd serverJAVA && mvn install
```

---

## Acceptance Criteria

- [ ] POST `/api/orders` with `sendSMS: true` triggers an SMS to the customer's phone number
- [ ] POST `/api/orders` with `sendEmail: true` triggers an email to the customer's email
- [ ] Notifications only fire after a successful order creation (not on failure)
- [ ] Missing phone/email is handled gracefully (logs a warning, does not crash)
- [ ] Failed notification (Twilio/Vonage/Notify.eu error) logs the error but does not fail the order response
- [ ] `mvn install` produces `BUILD SUCCESS`

---

## Notes

- The `Order` model has `send_email` and `send_sms` database columns — the flags are persisted with the order, not just used transiently.
- Phone number formatting: stored numbers like `727-867-5309` are automatically normalized to `+17278675309` by `NotificationService`.
- The Vonage SDK is in `pom.xml` but `NotificationService.sendSms()` currently uses Twilio. To switch to Vonage, rewrite that method using `VonageClient` and `SmsClient`.
- Both SDKs can coexist in `pom.xml` — no conflict.
