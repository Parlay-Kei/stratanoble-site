export interface MessageAction {
  type: 'message_action';
  callback_id: string;
  trigger_id: string;
  user: {
    id: string;
    name: string;
  };
  channel: {
    id: string;
    name: string;
  };
  message: {
    type: string;
    user: string;
    text: string;
    ts: string;
  };
  response_url: string;
}

export interface SlashCommand {
  command: string;
  text: string;
  trigger_id: string;
  user_id: string;
  channel_id: string;
  channel_name: string;
}

export interface ViewSubmission {
  type: 'view_submission';
  user: {
    id: string;
    name: string;
  };
  view: {
    callback_id: string;
    state: {
      values: Record<string, Record<string, any>>;
    };
    private_metadata: string;
  };
}

export interface ModalMetadata {
  channel_id: string;
  message_ts: string;
}
