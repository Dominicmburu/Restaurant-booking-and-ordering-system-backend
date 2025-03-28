// src/config/stripe.js
const Stripe = require('stripe');
const { logger } = require('../utils/logger');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Test Stripe connection
const testStripeConnection = async () => {
  try {
    await stripe.paymentIntents.list({ limit: 1 });
    logger.info('Stripe connection successful 💰');
    return true;
  } catch (error) {
    logger.error(`Stripe connection error: ${error.message}`);
    return false;
  }
};

module.exports = { stripe, testStripeConnection };