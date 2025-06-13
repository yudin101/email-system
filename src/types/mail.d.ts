export interface Mail {
  id: number;
  isReplyTo: number | null;
  senderEmail: string;
  receiverEmail: string;
  subject: string;
  body: string;
  time: string;
}
