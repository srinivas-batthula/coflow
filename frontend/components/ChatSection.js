"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useMessageStore from "@/store/useChatStore";
import EmojiPicker from "emoji-picker-react";
import { Users } from "lucide-react"; // <-- import Users icon

export default function ChatSection({ team, user, socket }) {
  const { messages, setMessages, addMessage, setLoading, error, setError } =
    useMessageStore();
  const router = useRouter();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const members_ids = team.member_details.map((member) => member._id);

  useEffect(() => {
    setLoading(true);
    socket.emit("message_history", { teamId: team._id });

    socket.on("message_history", ({ success, data }) => {
      if (success) {
        setMessages(data);
      } else {
        setError("Failed to load messages.");
      }
      setLoading(false);
    });

    socket.on("message_created", ({ success, data }) => {
      if (success) {
        addMessage(data);
      } else {
        setError("Failed to create message.");
      }
    });

    return () => {
      socket.off("message_history");
      socket.off("message_created");
    };
  }, [team?._id]);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) {
      scroll.scrollTop = scroll.scrollHeight;
    }
  }, [messages]);

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

  const renderMessage = (msg) => {
    const isMine = msg.sender._id === user._id;
    return (
      <div
        key={msg._id}
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
          className={`max-w-xs sm:max-w-sm px-5 py-3 rounded-xl shadow-lg break-words whitespace-pre-wrap transition-colors ${
            isMine
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
          <div
            className={`text-xs mt-1 text-right select-none ${
              isMine ? "text-white/80" : "text-gray-400"
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

  return (
    <div className="flex flex-col h-full bg-white border rounded-2xl shadow-xl">
      {/* Header */}
      <div className="p-5 border-b bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 font-bold flex items-center gap-3 select-none shadow-md">
        {/* Lucide Users Icon */}
        <Users className="h-7 w-7 text-indigo-600" />

        <span className="text-xl truncate">{team.name}</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-5 bg-indigo-50 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-indigo-200 rounded-b-2xl"
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
          className="text-purple-600 hover:text-purple-700 text-3xl focus:outline-none transition-transform active:scale-90 select-none"
          aria-label="Toggle Emoji Picker"
          type="button"
          title="Toggle Emoji Picker"
        >
          😊
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
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  );
}
