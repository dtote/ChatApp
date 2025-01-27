// services/messageCleanupService.js
import Message from '../models/message.model.js'; // Asegúrate de que la ruta es correcta
import Conversation from '../models/conversation.model.js'; // Asegúrate de que la ruta es correcta


const deleteOldMessages = async () => {
  // Calcula la fecha de hace 7 días
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
      // Elimina los mensajes antiguos
      const oldMessages = await Message.find({ createdAt: { $lt: sevenDaysAgo } });

      // Extrae los IDs de los mensajes antiguos
      const oldMessageIds = oldMessages.map(message => message._id);

      // Eliminar los mensajes antiguos
      const result = await Message.deleteMany({ createdAt: { $lt: sevenDaysAgo } });
      console.log(`Deleted ${result.deletedCount} old messages.`);

      // Actualiza las conversaciones para eliminar los IDs de los mensajes antiguos
      if (oldMessageIds.length > 0) {
          await Conversation.updateMany(
              { messages: { $in: oldMessageIds } }, // Busca las conversaciones que tienen esos mensajes
              { $pull: { messages: { $in: oldMessageIds } } } // Elimina los IDs de los mensajes antiguos
          );
          console.log(`Removed message IDs from conversations.`);
      }
  } catch (error) {
      console.error('Error deleting old messages:', error);
  }
};

export default deleteOldMessages;