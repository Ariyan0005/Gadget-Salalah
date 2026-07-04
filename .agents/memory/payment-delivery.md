---
name: TechShop payment & delivery design
description: Payment method logic and Dhofar Governorate delivery zone design decisions for TechShop.
---

## Rules

**COD (Cash on Delivery):**
- Delivery charge must be paid upfront before the order is dispatched.
- Product amount is paid on delivery.
- Order total = product subtotal only (delivery charge stored separately in `delivery_charge` column).
- After order success, show orange warning: "Delivery charge of X OMR must be paid before dispatch."

**Online Payment:**
- Full payment upfront — product total + delivery charge combined.
- Order total = product subtotal + delivery charge OMR (mixed BDT + OMR, intentional).
- Show blue info box with breakdown at checkout.

**Delivery zones:**
- Only Dhofar Governorate, Oman (10 wilayats).
- Charges in OMR, stored in `artifacts/api-server/src/config/delivery-areas.ts`.
- Wilayat selection required to unlock "Place Order" button.
- Charge range: Salalah 1.5 OMR → Muqshin/Shaleem 5.0 OMR.

**Why mixed currency:**
- Product prices are in BDT (Bangladeshi store pricing).
- Delivery charges are in OMR (Omani reality).
- This is intentional — owner serves Bangladeshi expats in Oman.

**DB columns added to orders:**
- `delivery_charge` (numeric) — always the OMR delivery charge
- `payment_method` (text) — 'cod' | 'online'
- `delivery_area` (text) — wilayat name
- `cod_delivery_charge_paid` (boolean) — admin can mark when pre-pay received
