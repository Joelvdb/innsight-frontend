"use client";

import { useState } from "react";
import { Plan, Conversation, Message } from "@/types";
import plansData from "@/data/plans.json";
import CenterPane from "./CenterPane";
import LeftPane from "./LeftPane";
import RightRail from "./RightRail";
import Navbar from "./Navbar";

export default function Dashboard() {
  const [plans] = useState<Plan[]>(plansData as any[]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [savedPlanIds, setSavedPlanIds] = useState<string[]>([]);
  const [highlightChat, setHighlightChat] = useState(false);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setHighlightChat(true);
    setTimeout(() => setHighlightChat(false), 800);
    
    const systemMessage: Message = {
      id: `sys-${Date.now()}-${Math.random()}`,
      role: "system",
      text: `נטענו נתוני תכנית ${plan.planNumber} מ${plan.city}.`,
      timestamp: new Date().toISOString(),
    };
    setCurrentMessages((prev) => [...prev, systemMessage]);
  };

  const toggleSavePlan = (planId: string) => {
    setSavedPlanIds(prev => 
      prev.includes(planId) ? prev.filter(id => id !== planId) : [...prev, planId]
    );
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setCurrentMessages((prev) => [...prev, newMessage]);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: `ניתוח תכנית ${selectedPlan?.planNumber}...`,
        timestamp: new Date().toISOString(),
      };
      setCurrentMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleNewChat = () => {
    if (currentMessages.length > 0 && selectedPlan) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        planId: selectedPlan.id,
        planNumber: selectedPlan.planNumber,
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
      const plan = plans.find((p) => p.id === conv.planId);
      if (plan) setSelectedPlan(plan);
      setCurrentMessages(conv.messages);
      setActiveConversationId(id);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <RightRail
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          activeConversationId={activeConversationId}
          savedPlans={plans.filter(p => savedPlanIds.includes(p.id))}
          onSelectPlan={handleSelectPlan}
        />

        <div className="flex-[5] min-w-0 h-full relative z-10 overflow-auto">
          <CenterPane
            plans={plans}
            selectedPlanId={selectedPlan?.id || null}
            onSelectPlan={handleSelectPlan}
            savedPlanIds={savedPlanIds}
            onToggleSave={toggleSavePlan}
          />
        </div>

        <div className="flex-[3.5] min-w-0 h-full relative z-10">
          <LeftPane
            selectedPlan={selectedPlan}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
            isHighlighted={highlightChat}
          />
        </div>
      </div>
    </div>
  );
}
