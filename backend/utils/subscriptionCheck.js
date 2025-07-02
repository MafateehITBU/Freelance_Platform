import cron from 'node-cron';
import connectDB from '../config/database.js';
import Influencer from '../models/Influencer.js';

const runSubscriptionCheck = async () => {
    await connectDB();

    try {
        const today = new Date();

        const expired = await Influencer.updateMany(
            { subscriptionEndDate: { $lt: today }, subscriptionActive: true },
            { subscriptionActive: false }
        );

        console.log(`${expired.modifiedCount} influencer subscriptions expired and were deactivated.`);
    } catch (error) {
        console.error('Subscription check error:', error.message);
    }
};

// Schedule to run every day at midnight
cron.schedule('0 0 * * *', runSubscriptionCheck);