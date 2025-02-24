import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Message from "@/models/Message";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await DbConnect();
    const { chatId } = params;
    
    const messages = await Message.find({ conversation: chatId })
      .populate('sender', 'firstName image')
      .sort({ createdAt: 1 })
      .lean();

    const transformedMessages = messages.map(message => ({
      _id: message._id.toString(),
      content: message.messageType === 'voice' 
        ? message.audioUrl // Make sure this is the full public URL
        : message.text,
      messageType: message.messageType,
      duration: message.duration || 0, // Add default duration
      createdAt: message.createdAt,
      sender: {
        _id: message.sender._id.toString(),
        firstName: message.sender.firstName || '',
        image: message.sender.image || ''
      },
      readBy: message.readBy?.map(id => id.toString()) || []
    }));

    return Response.json(transformedMessages);
    
  } catch (error) {
    console.error('Error in GET messages:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await DbConnect();
    const { chatId } = params;
    const body = await req.json();

    const messageData = {
      conversation: chatId,
      sender: session.user.id,
      messageType: body.type || 'text',
      readBy: [session.user.id] // Only sender has read it initially
    };

    if (body.type === 'voice') {
      messageData.audioUrl = body.content;
      messageData.duration = body.duration || 0;
    } else {
      messageData.text = body.content;
    }

    // Create new message
    const newMessage = await Message.create(messageData);

    // Update chat's lastMessage and add to messages array
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: newMessage._id },
      $set: { lastMessage: newMessage._id }
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'firstName image')
      .lean();

    const transformedMessage = {
      _id: populatedMessage._id.toString(),
      content: populatedMessage.messageType === 'voice' 
        ? populatedMessage.audioUrl 
        : populatedMessage.text,
      messageType: populatedMessage.messageType,
      duration: populatedMessage.duration || 0,
      createdAt: populatedMessage.createdAt,
      sender: {
        _id: populatedMessage.sender._id.toString(),
        firstName: populatedMessage.sender.firstName || '',
        image: populatedMessage.sender.image || ''
      },
      readBy: [session.user.id]
    };

    return Response.json(transformedMessage);
  } catch (error) {
    console.error('Error in POST message:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}