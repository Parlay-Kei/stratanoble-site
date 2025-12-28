import { WebSocket } from 'ws';
import { getSystemPrompt, type CampaignType } from './conversation-config';

export class RealtimeSession {
  private openaiWs: WebSocket | null = null;
  private twilioWs: WebSocket;
  private campaignType: CampaignType;
  private callSid: string;
  private twilioStreamSid: string | null = null;

  constructor(twilioWs: WebSocket, campaignType: CampaignType, callSid: string) {
    this.twilioWs = twilioWs;
    this.campaignType = campaignType;
    this.callSid = callSid;
  }

  setTwilioStreamSid(streamSid: string) {
    this.twilioStreamSid = streamSid;
  }

  async connect() {
    const model = process.env.OPENAI_REALTIME_MODEL || 'gpt-4o-realtime-preview';
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`;

    this.openaiWs = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    });

    this.openaiWs.on('open', () => {
      console.log(`[openai] Connected for ${this.campaignType} call:`, this.callSid);
      this.initializeSession();
    });

    this.openaiWs.on('message', (data) => {
      this.handleOpenAIMessage(data);
    });

    this.openaiWs.on('error', (error) => {
      console.error('[openai] Error:', error);
    });

    this.openaiWs.on('close', () => {
      console.log('[openai] Disconnected');
    });
  }

  private initializeSession() {
    const systemPrompt = this.getTestPrompt();

    this.openaiWs?.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: systemPrompt,
          voice: 'alloy',
          input_audio_format: 'g711_ulaw',
          output_audio_format: 'g711_ulaw',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
            create_response: true,  // ✅ CRITICAL FIX: Auto-generate responses after user speaks
          },
          temperature: 0.8,
          max_response_output_tokens: 4096,
        },
      })
    );
  }

  private getTestPrompt(): string {
    // Use campaign-specific system prompt from conversation-config
    return getSystemPrompt(this.campaignType);
  }

  handleTwilioAudio(audioData: Buffer) {
    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      this.openaiWs.send(
        JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: audioData.toString('base64'),
        })
      );
    }
  }

  private handleOpenAIMessage(data: any) {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case 'session.created':
        console.log('[openai] Session created:', message.session?.id);
        break;

      case 'response.audio.delta': {
        // Stream audio back to Twilio
        if (this.twilioWs && this.twilioWs.readyState === WebSocket.OPEN) {
          const twilioMessage = {
            event: 'media',
            // Use Twilio's streamSid if available
            streamSid: this.twilioStreamSid || undefined,
            media: {
              payload: message.delta,
            },
          } as any;
          this.twilioWs.send(JSON.stringify(twilioMessage));
        }
        break;
      }

      case 'response.audio_transcript.done':
        console.log('[openai] AI said:', message.transcript);
        break;

      case 'conversation.item.input_audio_transcription.completed':
        console.log('[openai] User said:', message.transcript);
        break;

      case 'error':
        console.error('[openai] Error:', message.error);
        break;

      default:
        // Uncomment to debug other event types
        // console.log('[openai] Event:', message.type);
        break;
    }
  }

  disconnect() {
    this.openaiWs?.close();
  }
}
