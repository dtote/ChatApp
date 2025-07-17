// services/messageCleanupService.js
import Message from '../models/message.model.js'; 
import Conversation from '../models/conversation.model.js';

const deleteMessagesByTime = async (timePeriod) => {
  try {
    const now = new Date();
    let cutoffDate;
    
    switch (timePeriod) {
      case '1day':
        cutoffDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        throw new Error('Invalid time period');
    }

    // Find messages to delete with a time limit
    const messagesToDelete = await Message.find({
      createdAt: { $lt: cutoffDate }
    }).limit(1000).select('_id');
    
    if (messagesToDelete.length === 0) {
      console.log('No old messages found to delete');
      return;
    }

    const messageIds = messagesToDelete.map(msg => msg._id);
    
    // Delete messages in batches
    const deleteResult = await Message.deleteMany({
      _id: { $in: messageIds }
    }, { maxTimeMS: 30000 }); // 30 seconds maximum for search

    // Update conversations in the same batch
    const updateResult = await Conversation.updateMany(
      { messages: { $in: messageIds } },
      { $pullAll: { messages: messageIds } },
      { maxTimeMS: 30000 }
    );

    console.log(`Processed batch: Deleted ${deleteResult.deletedCount} messages, Updated ${updateResult.modifiedCount} conversations`);

    return {
      deletedMessages: deleteResult.deletedCount,
      updatedConversations: updateResult.modifiedCount
    };
  } catch (error) {
    console.error('Error in deleteMessagesByTime:', error);
    if (error.name === 'MongooseError' && error.message.includes('timeout')) {
      throw new Error('Operation timed out. Please try again with a smaller time period.');
    }
    throw error;
  }
};

export default deleteMessagesByTime;