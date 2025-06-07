"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useMessageStore from "@/store/useChatStore";
import EmojiPicker from "emoji-picker-react";
import { Users, Smile } from "lucide-react";

export default function ChatSection({ team, user, socket }) {
  const { messages, setMessages, addMessage, updateMessage, setLoading, error, setError } =
    useMessageStore();
  const router = useRouter();
  const [typingUsers, setTypingUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const members_ids = team.member_details.map((member) => member._id);

  // Typing emit
  useEffect(() => {
    let timeout;
    const handleTyping = () => {
      socket.emit("message_start_typing", {
        teamId: team._id,
        userId: user._id,
        name: user.fullName,
      });
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        socket.emit("message_stop_typing", { teamId: team._id, userId: user._id });
      }, 2000);
    };

    const input = inputRef.current;
    if (!input) return;

    input.addEventListener("input", handleTyping);
    return () => {
      input.removeEventListener("input", handleTyping);
      clearTimeout(timeout);
    };
  }, [socket, team._id, user._id, user.fullName]);

  // Typing receive
  useEffect(() => {
    const handleUserTyping = ({ userId, name }) => {
      if (userId !== user._id) {
        setTypingUsers((prev) => ({ ...prev, [userId]: name }));
      }
    };
    const handleUserStopTyping = ({ userId }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    };

    socket.on("message_started_typing", handleUserTyping);
    socket.on("message_stopped_typing", handleUserStopTyping);

    return () => {
      socket.off("message_started_typing", handleUserTyping);
      socket.off("message_stopped_typing", handleUserStopTyping);
    };
  }, [socket, user._id]);

  // Load messages
  useEffect(() => {
    const handleHistory = ({ success, data }) => {
      if (success) {
        setMessages(data);
        console.log('message_history: On reload');
      } else {
        setError("Failed to load messages.");
      }
      setLoading(false);
    };

    const handleCreated = ({ success, data }) => {
      if (success) {
        addMessage(data);
        if (user._id !== data.sender._id) {
          socket.emit('message_mark_seen', { message_id: data._id, sender_id: data.sender._id, sender_name: data.sender.name });
        }
      } else {
        setError("Failed to create message.");
      }
    };

    const handleUpdated = ({ success, data }) => {
      if (success) {
        updateMessage(data);
      }
    };

    setLoading(true);
    socket.emit("message_history", { teamId: team._id });

    // Attach listener ONCE
    socket.off("message_history", handleHistory); // Prevent duplication
    if (!socket.hasListeners("message_history")) {
      socket.on("message_history", handleHistory);
    }
    socket.on("message_created", handleCreated);
    socket.on('message_updated', handleUpdated);

    return () => {
      socket.off("message_history", handleHistory);
      socket.off("message_created", handleCreated);
      socket.off("message_updated", handleUpdated);
    };
  }, [team?._id]);

  // Auto-scroll
  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
  }, [messages]);

  // Emoji Picker outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest("#emoji-toggle-btn")
      ) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  const handleSend = () => {
    const msg = inputRef.current?.value.trim();
    if (!msg) return;
    socket.emit("message_create", {
      message: msg,
      teamId: team._id,
      teamName: team.name,
      members_ids,
      userId: user._id,
    });
    inputRef.current.value = "";
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatAMPM = (dateString) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours %= 12;
    hours = hours || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const renderMessage = (msg, idx) => {
    const isMine = msg.sender._id === user._id;
    const key = `${msg._id}-${msg.createdAt || idx}`;
    return (
      <div
        key={key}
        className={`flex ${isMine ? "justify-end" : "justify-start"} my-2 px-2`}
      >
        {!isMine && (
          <div
            onClick={() => router.push(`/profile/${msg.sender._id}`)}
            className="cursor-pointer flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-semibold mr-3 select-none hover:ring-2 hover:ring-purple-400 hover:ring-offset-1 transition"
            title={msg.sender.name}
          >
            {msg?.sender?.name?.toUpperCase().slice(0, 2) || "U"}
          </div>
        )}
        <div
          className={`max-w-xs sm:max-w-sm px-5 py-3 rounded-xl shadow-lg break-words whitespace-pre-wrap transition-colors ${isMine
            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none"
            : "bg-white text-gray-900 border border-gray-300 rounded-bl-none hover:shadow-md"
            }`}
        >
          {!isMine && (
            <div
              onClick={() => router.push(`/profile/${msg.sender._id}`)}
              className="cursor-pointer text-sm font-semibold mb-1 select-text hover:underline text-indigo-700"
            >
              {msg.sender.name}
            </div>
          )}
          <div className="text-base leading-relaxed">{msg.message}</div>

          {isMine && (
            <div style={{ color: 'greenyellow' }}>{msg.seen_by?.length > 0 ? 'Seen' : 'Sent'}</div>
          )}

          <div
            className={`text-xs mt-1 text-right select-none ${isMine ? "text-white/80" : "text-gray-400"
              }`}
          >
            {formatAMPM(msg.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  const handleAddEmoji = (emojiObject) => {
    const emoji = emojiObject.emoji;
    inputRef.current.value += emoji;
    inputRef.current.focus();
  };

  const getAvatarStyle = (isTyping) =>
    `w-8 h-8 rounded-full ${isTyping
      ? "bg-purple-600 text-white animate-pulse"
      : "bg-indigo-200 text-indigo-800"
    } text-sm font-bold flex items-center justify-center ring-2 ring-white shadow-sm transition-transform transform hover:scale-105`;

  return (
    <div className="flex flex-col h-full bg-white border rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b shadow-sm bg-gradient-to-r from-indigo-100 to-purple-100 rounded-t-2xl">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-indigo-700" />
          <span className="text-2xl font-semibold text-indigo-800 truncate">
            {team.name}
          </span>
        </div>

        {/* Avatar Section */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {(Object.keys(typingUsers).length > 0
              ? Object.entries(typingUsers)
              : team.member_details.map((m) => [m._id, m.fullName])
            ).map(([id, name]) => (
              <div
                key={id}
                className={getAvatarStyle(typingUsers[id])}
                title={name}
              >
                {name.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>

          {Object.keys(typingUsers).length > 0 && (
            <span className="text-sm text-purple-700 font-medium italic animate-pulse">
              Typing...
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-5 bg-indigo-50 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-indigo-200"
      >
        {messages.length === 0 && !error && (
          <div className="text-center text-indigo-300 mt-10 select-none font-semibold">
            Start the conversation
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 mt-4 select-none font-semibold">
            {error}
          </div>
        )}
        {messages.map(renderMessage)}
      </div>

      {/* Input */}
      <div className="relative p-5 border-t bg-white flex items-center gap-4 rounded-b-2xl shadow-inner">
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-16 left-5 z-50 shadow-2xl rounded-xl overflow-hidden ring-2 ring-purple-400"
          >
            <EmojiPicker onEmojiClick={handleAddEmoji} emojiStyle="apple" />
          </div>
        )}
        <button
          id="emoji-toggle-btn"
          onClick={() => setShowEmojiPicker((v) => !v)}
          className="text-purple-600 hover:text-purple-700 text-2xl focus:outline-none transition-transform active:scale-90 select-none"
        >
          <Smile className="w-7 h-7" />
        </button>
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Type a message..."
          onKeyDown={handleKeyPress}
          className="flex-1 resize-none border border-gray-300 rounded-3xl px-5 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent shadow-md transition-shadow"
          spellCheck={false}
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white px-7 py-3 rounded-3xl hover:bg-purple-700 active:scale-95 transition-transform shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}
