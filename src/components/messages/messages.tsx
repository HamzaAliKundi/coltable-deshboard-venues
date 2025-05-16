import React, { useState } from 'react';
import ChatBox from './ChatBox';
import MessageCard from './MessageCard';
import { useGetAllChatsQuery } from '../../apis/messages';
import { useGetVenueProfileQuery } from '../../apis/venues';
import { useNavigate } from 'react-router-dom';

interface Participant {
  _id: string;
  name: string;
  email: string;
  profilePhoto: string;
  userType: string;
}

interface Chat {
  _id: string;
  event: string;
  latestMessage: string;
  latestMessageSentAt: string;
  createdAt: string;
  updatedAt: string;
  participant: Participant;
}

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const { data, isLoading: isLoadingChats, error: chatsError, refetch: refetchChats } = useGetAllChatsQuery({});
  const { data: venueProfile, isLoading: isLoadingProfile, refetch: refetchProfile } = useGetVenueProfileQuery({});

  const navigate = useNavigate();

  const handleBack = async () => {
    setIsRefetching(true);
    try {
      await Promise.all([refetchChats(), refetchProfile()]);
      setSelectedChat(null);
      navigate('/messages', { replace: true });
    } finally {
      setIsRefetching(false);
    }
  };

  if (isLoadingChats || isLoadingProfile) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF00A2]"></div>
    </div>
  );

  if (chatsError) return (
    <div className="text-center text-white py-8">
      Failed to load messages
    </div>
  );

  if (!data?.chats?.length) return (
    <div className="text-center text-white py-8">
      No messages found
    </div>
  );

  if (selectedChat) {
    const chat = data.chats.find((c: Chat) => c._id === selectedChat);
    if (!chat) return null;
    
    return (
      <div className="p-4 md:px-8 py-8 md:py-16 bg-black">
        <ChatBox
          chatId={chat._id}
          recipientName={chat.participant.fullDragName}
          recipientImage={chat.participant.profilePhoto}
          onBack={handleBack}
          sender={venueProfile?.user}
          eventId={chat.event}
          recipientId={chat.participant._id}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:px-8 py-8 md:py-16 bg-black">
      <div className="space-y-4">
        {data.chats.map((chat: Chat) => (
          <MessageCard
            key={chat._id}
            senderName={chat.participant.fullDragName}
            lastMessage={chat.latestMessage}
            image={chat.participant.profilePhoto}
            onClick={() => setSelectedChat(chat._id)}
            isSelected={selectedChat === chat._id}
          />
        ))}
      </div>
    </div>
  );
};

export default Messages;