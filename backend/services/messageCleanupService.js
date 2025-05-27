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

    // Encontrar los mensajes a eliminar con un límite de tiempo
    const messagesToDelete = await Message.find(
      { createdAt: { $lt: cutoffDate } },
      { _id: 1 },
      { maxTimeMS: 30000 } // 30 segundos máximo para la búsqueda
    ).lean();

    if (!messagesToDelete || messagesToDelete.length === 0) {
      console.log('No messages found to delete');
      return { deletedMessages: 0, updatedConversations: 0 };
    }

    const messageIds = messagesToDelete.map(msg => msg._id);

    // Procesar en lotes para evitar timeouts
    const BATCH_SIZE = 1000;
    let totalDeleted = 0;
    let totalUpdated = 0;

    // Eliminar mensajes en lotes
    for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
      const batchIds = messageIds.slice(i, i + BATCH_SIZE);
      const deleteResult = await Message.deleteMany(
        { _id: { $in: batchIds } },
        { maxTimeMS: 30000 }
      );
      totalDeleted += deleteResult.deletedCount;

      // Actualizar conversaciones en el mismo lote
      const updateResult = await Conversation.updateMany(
        { messages: { $in: batchIds } },
        { $pullAll: { messages: batchIds } },
        { maxTimeMS: 30000 }
      );
      totalUpdated += updateResult.modifiedCount;

      console.log(`Processed batch ${i / BATCH_SIZE + 1}: Deleted ${deleteResult.deletedCount} messages, Updated ${updateResult.modifiedCount} conversations`);
    }

    console.log(`Total: Deleted ${totalDeleted} messages, Updated ${totalUpdated} conversations`);

    return {
      deletedMessages: totalDeleted,
      updatedConversations: totalUpdated
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