# Refund Flow Integration Guide

This document outlines the recent updates to the Refund Mechanism in the backend and provides integration instructions for both the **Frontend Development Team** (Public Website / Guest flow) and the **Dashboard Development Team** (Customer Dashboard flow).

---

## 1. Overview: What, Why, and How?

### What was done?
We have enhanced the order refund mechanism to support **item-level granularity** and **image evidence**. Both Guest users and Registered Customers can now select specific products from their order when requesting a refund and attach multiple images as proof.

### Why was it done?
Previously, a refund request only captured a text "reason" and the request type (`REFUND` or `PARTIAL_REFUND`). For orders involving multiple sellers or multiple items, it was difficult for Admins and Sellers to determine exactly which items the customer was returning. By sending specific items and evidence images, support tickets become much clearer, expediting the resolution process.

### How is it done on the Backend?
We updated the existing endpoint controllers (`requestRefund` and `requestGuestRefund`). They now accept two new optional fields in the request body:
*   `items`: An array of objects containing the selected products (`title`, `productId`, `quantity`). These are automatically appended to the Support Ticket's textual message.
*   `images`: An array of strings (URLs). These are saved directly to the `attachments` array field in the Support ticket.

---

## 2. Customer Dashboard Team (Registered Users)

**Target Flow:** Registered customers initiating a refund from their Dashboard > "My Orders" tab.

### Required UI Implementations:
1.  **Refund Button:** Inside the Order Details page, add a "Request Refund" or "Request Partial Refund" button.
2.  **Item Selection Checkboxes:** Present the customer with a list of items from that order (fetched via `GET /api/orders/user/my-orders/:id`). Allow them to check which items they want to return.
3.  **Reason Textbox:** A mandatory text area for the customer to explain why they want a refund.
4.  **Image Upload (Multiple):** An upload component. 
    *   *Note:* The Frontend must first upload these images to your storage provider (e.g., Cloudinary, S3).
    *   Collect the resulting URLs to pass to the backend.

### API Integration:
**Endpoint:** `POST /api/orders/refund-request/:id`
**(Requires Bearer Token)**

*Path Parameter:*
*   `:id` = The Order's `displayId` (e.g., `ORD-123456`)

*Request Body:*
```json
{
  "requestType": "PARTIAL_REFUND", // or "REFUND" for full order
  "reason": "The mouse arrived with a broken scroll wheel.",
  "items": [
    { 
      "productId": "prod_xyz789", 
      "title": "Wireless Mouse", 
      "quantity": 1 
    }
  ],
  "images": [
    "https://res.cloudinary.com/your-app/image/upload/v1234567/broken-mouse.jpg"
  ]
}
```

---

## 3. Frontend Team (Guest Users)

**Target Flow:** A public-facing "Track Order" or "Guest Support" page where users without an account can request a return.

### Required UI Implementations:
1.  **Authentication Step (Order + Email):** A form asking for the `Order ID` (e.g., ORD-123456) and the `Email Address` used at checkout.
2.  **Fetch Order Details:** Use `GET /api/orders/guest/track?orderId={id}&customerEmail={email}` to retrieve the order payload.
3.  **Refund Interface:** Once verified, display the order details.
    *   Show the list of products in the order.
    *   Allow the guest to select specific items (checkboxes + quantity).
    *   Provide a textbox for the "Reason".
    *   Provide an image upload component (upload to Cloudinary/S3 first, then pass URLs).

### API Integration:
**Endpoint:** `POST /api/orders/guest/refund-request`
**(No Auth required, rate-limited via IP)**

*Request Body:*
```json
{
  "orderId": "ORD-123456",
  "customerEmail": "guest_user@example.com",
  "requestType": "PARTIAL_REFUND", // or "REFUND"
  "reason": "The shirt color is completely different from the pictures.",
  "items": [
    { 
      "productId": "prod_abc123", 
      "title": "Red Cotton T-Shirt", 
      "quantity": 1 
    }
  ],
  "images": [
    "https://res.cloudinary.com/your-app/image/upload/v1234567/wrong-color-shirt.jpg"
  ]
}
```

---

## 4. Key Considerations & Error Handling

1. **Status Restrictions:** The backend will block refund requests if the order is already in `CANCELLED`, `REFUND`, or `PARTIAL_REFUND` states. The UI should hide the "Request Refund" button for these statuses.
2. **Mandatory Fields:** The `reason`, `requestType`, and (for guests) `customerEmail`/`orderId` are explicitly required.
3. **Empty Arrays:** If a customer is requesting a full order refund without specifying items, `items: []` and `images: []` can be sent or omitted from the JSON payload safely.
4. **Cloudinary Uploads:** Ensure images are completely uploaded to your CDN/storage before compiling the final array of URLs and calling the refund endpoints. The backend does not handle `multipart/form-data` on these specific refund endpoints.