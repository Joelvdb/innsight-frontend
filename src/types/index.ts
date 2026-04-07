export interface Nispach {
  name: string;
  url: string;
}

export interface Plan {
  id: string;
  planNumber: string;
  city: string;
  mahut: string;
  status: string;
  takanon_text: string;
  takanon_url: string;
  govMapUrl: string;
  nispachim: Nispach[];
}

export interface Message {
  id: string;
  role: "user" | "ai" | "system";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  planId: string;
  planNumber: string;
  messages: Message[];
  timestamp: string;
}
