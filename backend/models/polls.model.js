import mongoose, { mongo } from "mongoose";

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true }, 
  options: [
    {
      option: { type: String, required: true },  
      votes: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
          voteValue: { type: Number, enum: [0, 1], required: true },  
        }
      ],
    },
  ],
});

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;
