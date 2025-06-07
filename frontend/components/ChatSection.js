"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useMessageStore from "@/store/useChatStore";
import EmojiPicker from "emoji-picker-react";
import { Users, Smile, CheckCheck as Eye, Send, X } from "lucide-react";

export default function ChatSection({ team, user, socket }) {
  const {
    messages,
    setMessages,
    addMessage,
    updateMessage,
    setLoading,
    error,
    setError,
  } = useMessageStore();

  const router = useRouter();
  const [typingUsers, setTypingUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [seenModalOpen, setSeenModalOpen] = useState(false);
  const [seenUsers, setSeenUsers] = useState([]);
  const [anchorRect, setAnchorRect] = useState(null);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const modalRef = useRef(null);
  const members_ids = team.member_details.map((member) => member._id);

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
        socket.emit("message_stop_typing", {
          teamId: team._id,
          userId: user._id,
        });
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

  useEffect(() => {
    const handleHistory = ({ success, data }) => {
      if (success) {
        setMessages(data);
      } else {
        setError("Failed to load messages.");
      }
      setLoading(false);
    };

    const handleCreated = ({ success, data }) => {
      if (success) {
        addMessage(data);
        if (user._id !== data.sender._id) {
          socket.emit("message_mark_seen", {
            message_id: data._id,
            sender_id: data.sender._id,
            sender_name: data.sender.name,
          });
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

    socket.off("message_history", handleHistory);
    if (!socket.hasListeners("message_history")) {
      socket.on("message_history", handleHistory);
    }
    socket.on("message_created", handleCreated);
    socket.on("message_updated", handleUpdated);

    return () => {
      socket.off("message_history", handleHistory);
      socket.off("message_created", handleCreated);
      socket.off("message_updated", handleUpdated);
    };
  }, [team?._id]);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) scroll.scrollTop = scroll.scrollHeight;
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

      if (
        seenModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setSeenModalOpen(false);
        setAnchorRect(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker, seenModalOpen]);

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

  const handleAddEmoji = (emojiObject) => {
    const emoji = emojiObject.emoji;
    inputRef.current.value += emoji;
    inputRef.current.focus();
  };

  const getAvatarStyle = (isTyping) =>
    `w-6 h-6 rounded-full ${
      isTyping
        ? "bg-purple-600 text-white animate-pulse"
        : "bg-indigo-200 text-indigo-800"
    } text-xs font-semibold flex items-center justify-center ring-1 ring-white shadow-sm transition-transform transform hover:scale-105`;

  const handleMessageClick = (msg, e) => {
    if (msg.sender._id !== user._id) return;

    const seenNames = (msg.seen_by || [])
      .map((id) => {
        const member = team.member_details.find((m) => m._id === id);
        return member ? member.fullName || member.name || "Unknown" : null;
      })
      .filter(Boolean);

    const rect = e.currentTarget.getBoundingClientRect();
    setAnchorRect(rect);
    setSeenUsers(seenNames);
    setSeenModalOpen(true);
  };

  const renderMessage = (msg, idx) => {
    const isMine = msg.sender._id === user._id;
    const key = `${msg._id}-${msg.createdAt || idx}`;
    const seenByAll = msg.seen_by?.length === team.member_details?.length - 1;

    return (
      <div
        key={key}
        className={`flex ${isMine ? "justify-end" : "justify-start"} my-1 px-1`}
      >
        {!isMine && (
          <div
            onClick={() => router.push(`/profile/${msg.sender._id}`)}
            className="cursor-pointer flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-semibold mr-2 select-none hover:ring-1 hover:ring-purple-400 hover:ring-offset-0 transition"
            title={msg.sender.name}
          >
            {msg?.sender?.name?.toUpperCase().slice(0, 2) || "U"}
          </div>
        )}

        <div
          onClick={(e) => handleMessageClick(msg, e)}
          className="relative flex flex-col max-w-xs sm:max-w-xs cursor-pointer"
        >
          <div
            className={`px-3 py-2 rounded-lg shadow break-words whitespace-pre-wrap transition-colors ${
              isMine
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none"
                : "bg-white text-gray-900 border border-gray-300 rounded-bl-none hover:shadow-md"
            }`}
            style={{ fontSize: "0.85rem", lineHeight: 1.2 }}
          >
            {!isMine && (
              <div
                onClick={() => router.push(`/profile/${msg.sender._id}`)}
                className="cursor-pointer text-xs font-semibold mb-0.5 select-text hover:underline text-indigo-700"
              >
                {msg.sender.name}
              </div>
            )}
            <div className="text-sm leading-snug">{msg.message}</div>
            <div
              className={`text-[0.65rem] mt-0.5 text-right select-none ${
                isMine ? "text-white/70" : "text-gray-400"
              }`}
            >
              {formatAMPM(msg.createdAt)}
            </div>
          </div>

          {isMine && (
            <div className="absolute -right-4 -bottom-1 text-purple-600">
              {seenByAll ? (
                <Eye className="w-3 h-3 opacity-90" title="Seen by all" />
              ) : (
                <Send className="w-3 h-3 opacity-70" title="Sent" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SeenByModal = () => {
    if (!seenModalOpen || !anchorRect) return null;

    const style = {
      position: "absolute",
      top: anchorRect.top + window.scrollY - 20,
      left: anchorRect.left + window.scrollX - 180,
    };

    return (
      <div
        ref={modalRef}
        className="z-50 w-44 bg-white rounded-md shadow-xl border border-purple-300 p-2"
        style={style}
      >
        <div className="flex justify-between items-center border-b pb-1 mb-1">
          <h3 className="text-sm font-semibold text-purple-700">Seen by</h3>
          <button
            onClick={() => {
              setSeenModalOpen(false);
              setAnchorRect(null);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {seenUsers.length === 0 ? (
          <p className="text-xs text-gray-500 select-none">
            No one has seen this yet.
          </p>
        ) : (
          <ul className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300">
            {seenUsers.map((name, i) => (
              <li
                key={i}
                className="text-sm text-gray-800 border-b border-purple-100 last:border-none"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-hidden">
      {/* Main container */}
      <div className="flex flex-col w-full h-full bg-white border rounded-xl shadow-xl origin-top">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b shadow-sm bg-gradient-to-r from-indigo-100 to-purple-100 rounded-t-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-indigo-700" />
            <span className="text-lg font-semibold text-indigo-800 truncate">
              {team.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
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
              <span className="text-xs text-purple-700 font-medium italic animate-pulse">
                Typing...
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 bg-indigo-50 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-indigo-200"
        >
          {messages.length === 0 && !error && (
            <div className="text-center text-indigo-300 mt-8 select-none font-semibold text-sm">
              Start the conversation
            </div>
          )}
          {error && (
            <div className="text-center text-red-600 mt-2 select-none font-semibold text-sm">
              {error}
            </div>
          )}
          {messages.map(renderMessage)}
        </div>

        {/* Input */}
        <div className="relative p-3 border-t bg-white flex items-center gap-3 rounded-b-xl shadow-inner flex-shrink-0">
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-14 left-4 z-50 shadow-2xl rounded-xl overflow-hidden ring-2 ring-purple-400"
            >
              <EmojiPicker onEmojiClick={handleAddEmoji} emojiStyle="apple" />
            </div>
          )}
          <button
            id="emoji-toggle-btn"
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="text-purple-600 hover:text-purple-700 text-xl focus:outline-none transition-transform active:scale-90 select-none"
          >
            <Smile className="w-6 h-6" />
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Type a message..."
            onKeyDown={handleKeyPress}
            className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent shadow-sm transition-shadow text-sm leading-tight"
            spellCheck={false}
          />
          <button
            onClick={handleSend}
            className="bg-purple-600 text-white px-5 py-2 rounded-2xl hover:bg-purple-700 active:scale-95 transition-transform shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          >
            Send
          </button>
        </div>
      </div>

      {/* Seen modal */}
      <SeenByModal />
    </div>
  );
}
