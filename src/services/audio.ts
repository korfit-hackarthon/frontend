import api from '../utils/axios';

export interface AudioSession {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudioMessage {
  _id: string;
  sessionId: string;
  userAudioUrl: string;
  userTextFromSTT: string;
  aiResponseText: string;
  aiAudioUrl: string;
  processingStatus:
    | 'pending'
    | 'stt_processing'
    | 'llm_processing'
    | 'tts_processing'
    | 'completed'
    | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithMessages {
  session: AudioSession;
  messages: AudioMessage[];
}

export const audioService = {
  // 세션 관리
  async createSession(title?: string) {
    const response = await api.post('/api/audio/sessions', {
      title: title || '새로운 대화',
    });
    return response.data;
  },

  async getAllSessions(): Promise<{
    success: boolean;
    data: AudioSession[];
    count: number;
  }> {
    const response = await api.get('/api/audio/sessions');
    return response.data;
  },

  async getSessionById(
    sessionId: string
  ): Promise<{ success: boolean; data: SessionWithMessages }> {
    const response = await api.get(`/api/audio/sessions/${sessionId}`);
    return response.data;
  },

  async deleteSession(sessionId: string) {
    const response = await api.delete(`/api/audio/sessions/${sessionId}`);
    return response.data;
  },

  // Blob을 base64로 변환하는 헬퍼 함수
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // data:audio/wav;base64, 부분을 제거하고 순수 base64만 반환
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  // 메시지 처리
  async processAudioMessage(
    sessionId: string,
    audioBlob: Blob,
    systemPrompt?: string,
    voiceName?: string
  ) {
    // Blob을 base64로 변환
    const base64AudioData = await this.blobToBase64(audioBlob);

    const requestBody: any = {
      userAudioData: base64AudioData,
    };

    if (systemPrompt) requestBody.systemPrompt = systemPrompt;
    if (voiceName) requestBody.voiceName = voiceName;

    const response = await api.post(
      `/api/audio/sessions/${sessionId}/messages`,
      requestBody
    );
    return response.data;
  },

  // 텍스트 메시지 처리 (LLM -> TTS)
  async processTextMessage(
    sessionId: string,
    userText: string,
    systemPrompt?: string,
    voiceName?: string
  ) {
    const requestBody: any = {
      userText: userText.trim(),
    };

    if (systemPrompt) requestBody.systemPrompt = systemPrompt;
    if (voiceName) requestBody.voiceName = voiceName;

    const response = await api.post(
      `/api/audio/sessions/${sessionId}/text-messages`,
      requestBody
    );
    return response.data;
  },

  async getMessageStatus(
    messageId: string
  ): Promise<{ success: boolean; data: AudioMessage }> {
    const response = await api.get(`/api/audio/messages/${messageId}/status`);
    return response.data;
  },
};
