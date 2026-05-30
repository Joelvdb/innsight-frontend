"use client";

import { useState, useEffect } from "react";
import { Plan, Conversation, Message } from "@/types";
import dynamic from "next/dynamic";
import CenterPane from "./CenterPane";
import LeftPane from "./LeftPane";
import RightRail from "./RightRail";
import Navbar from "./Navbar";

const MapPane = dynamic(() => import("./MapPane"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">טוען מפה...</p>
      </div>
    </div>
  ),
});

export default function Dashboard() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [view, setView] = useState<"list" | "map">("list");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [savedPlanIds, setSavedPlanIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) setPlans(data.plans);
        else console.error("Plans API error:", data.error);
      })
      .catch((error) => console.error("Error loading plans:", error));
  }, []);

  const toggleSavePlan = (planId: string) => {
    setSavedPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setCurrentMessages((prev) => [...prev, newMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: data.answer,
        timestamp: new Date().toISOString(),
      };
      setCurrentMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setCurrentMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "מצטער, אירעה שגיאה בתקשורת עם השרת. אנא נסה שוב מאוחר יותר.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleNewChat = () => {
    if (currentMessages.length > 0) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        planId: "",
        planNumber: "",
        messages: [...currentMessages],
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) => [newConversation, ...prev]);
    }
    setCurrentMessages([]);
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setCurrentMessages(conv.messages);
      setActiveConversationId(id);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Navbar currentView={view} onViewChange={setView} />

      <div className="flex flex-1 overflow-hidden">
        <RightRail
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          activeConversationId={activeConversationId}
          savedPlans={plans.filter((p) => savedPlanIds.includes(p.id))}
          onSelectPlan={() => {}}
        />

        <div className="flex-[5] min-w-0 h-full relative z-10 overflow-auto border-l border-slate-200">
          {view === "list" ? (
            <CenterPane
              plans={plans}
              savedPlanIds={savedPlanIds}
              onToggleSave={toggleSavePlan}
            />
          ) : (
            <MapPane
              plans={plans}
              selectedPlanId={null}
              onSelectPlan={() => {}}
            />
          )}
        </div>

        <div className="flex-[3.5] min-w-0 h-full relative z-10">
          <LeftPane
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
          />
        </div>
      </div>
    </div>
  );
}
