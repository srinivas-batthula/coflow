"use client";

import React, { useEffect, useRef, useState } from "react";
import socket from "@/utils/socket";
import useMessageStore from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import EmojiPicker from "emoji-picker-react";

export default function ChatSection({ teamId, teamName, members_ids = [] }) {
  const { messages, setMessages, addMessage, setLoading, error, setError } =
    useMessageStore();
  const { user } = useAuthStore();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef();

  useEffect(() => {
    setLoading(true);
    socket.emit("message_history", { teamId });

    socket.on("message_history", ({ success, data }) => {
      if (success) {
        setMessages(data);
      } else {
        setError("Failed to load messages.");
      }
      setLoading(false);
    });

    socket.on("message_created", ({ data }) => {
      addMessage(data);
    });

    socket.emit("onlineUsers", { members_ids });

    return () => {
      socket.off("message_history");
      socket.off("message_created");
    };
  }, [teamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker when clicking outside
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSend = () => {
    const msg = inputRef.current?.value.trim();
    if (!msg) return;

    socket.emit("message_create", {
      message: msg,
      teamId,
      teamName,
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

  const renderMessage = (msg) => {
    const isMine = msg.sender._id === user._id;
    return (
      <div
        key={msg._id}
        className={`flex ${isMine ? "justify-end" : "justify-start"} my-2 px-2`}
      >
        {!isMine && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold mr-3 select-none">
            {msg?.sender?.name[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div
          className={`max-w-xs sm:max-w-sm px-5 py-3 rounded-xl shadow-md transition-colors duration-300 break-words whitespace-pre-wrap
            ${
              isMine
                ? "bg-purple-600 text-white rounded-br-none"
                : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
            }`}
        >
          {!isMine && (
            <div className="text-sm font-semibold mb-1 select-text">
              {msg.sender.name}
            </div>
          )}
          <div className="text-base leading-relaxed">{msg.message}</div>
          <div
            className={`text-xs mt-1 text-right ${
              isMine ? "text-white/70" : "text-gray-400"
            } select-none`}
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

  return (
    <div className="flex flex-col h-full border rounded-xl bg-white shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 text-lg font-semibold text-gray-700 select-none flex items-center gap-2">
        <span role="img" aria-label="chat">
          💬
        </span>
        {teamName} Chat
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-gray-200">
        {messages.length === 0 && !error && (
          <div className="text-center text-gray-400 mt-10 select-none">
            Start the conversation
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 mt-4 select-none">
            {error}
          </div>
        )}
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input and Emoji Picker */}
      <div className="relative p-4 border-t bg-white flex items-center gap-3">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-16 left-4 z-50 shadow-lg rounded-lg overflow-hidden"
          >
            <EmojiPicker onEmojiClick={handleAddEmoji} emojiStyle="apple" />
          </div>
        )}

        {/* Emoji Toggle Button */}
        <button
          id="emoji-toggle-btn"
          onClick={() => setShowEmojiPicker((v) => !v)}
          className="text-purple-600 hover:text-purple-700 text-2xl focus:outline-none transition-transform active:scale-90 select-none"
          aria-label="Toggle Emoji Picker"
          type="button"
        >
          😊
        </button>

        {/* Message Input */}
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Type a message..."
          onKeyDown={handleKeyPress}
          className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-shadow"
          spellCheck={false}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="bg-purple-600 text-white px-5 py-3 rounded-xl hover:bg-purple-700 transition-transform active:scale-95 focus:outline-none"
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  );
}
