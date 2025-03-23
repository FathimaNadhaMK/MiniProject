import { CronJob } from 'cron';
import mongoose from 'mongoose';
import { fetchRSSNews } from './nlpServer.js';

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Scheduled job to refresh news every 30 minutes
new CronJob('0 */30 * * * *', async () => {
  console.log('⏰ Running scheduled news refresh');
  try {
    await fetchRSSNews();
    console.log('✅ News refresh completed');
  } catch (error) {
    console.error('❌ Scheduled refresh failed:', error);
  }
}).start();

console.log('⏰ News cron job initialized');