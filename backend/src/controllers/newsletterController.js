const NewsletterSubscriber = require('../models/NewsletterSubscriber');

/**
 * Public Newsletter Subscription
 * POST /api/newsletter/subscribe
 */
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid university or personal email format (e.g. user@campusverse.edu).',
      });
    }

    // Check if already subscribed
    let subscriber = await NewsletterSubscriber.findOne({ email: trimmedEmail });
    if (subscriber) {
      if (subscriber.status === 'unsubscribed') {
        subscriber.status = 'active';
        subscriber.subscribedAt = new Date();
        await subscriber.save();
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription to CampusVerseAI updates has been reactivated.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to the CampusVerseAI newsletter and campus dispatches.',
      });
    }

    subscriber = new NewsletterSubscriber({ email: trimmedEmail });
    await subscriber.save();

    return res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! You will receive verified campus dispatches and academic updates.',
    });
  } catch (error) {
    console.error('[Newsletter Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process subscription. Please try again later.',
    });
  }
};
