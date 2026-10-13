export interface ForumUser {
  id: string;
  full_name: string;
  role: "member" | "admin";
}
export interface ForumTopic {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  body: string;
  deleted: boolean;
  created_at: string;
}
export interface ForumReply {
  id: string;
  topic_id: string;
  author_id: string;
  author_name: string;
  body: string;
  deleted: boolean;
  created_at: string;
}
export interface ForumRepository {
  listTopics(): Promise<ForumTopic[]>;
  listReplies(topicId: string): Promise<ForumReply[]>;
  createTopic(title: string, body: string): Promise<ForumTopic>;
  reply(topicId: string, body: string): Promise<ForumReply>;
  remove(kind: "topic" | "reply", id: string): Promise<void>;
  report(kind: "topic" | "reply", id: string): Promise<void>;
}
