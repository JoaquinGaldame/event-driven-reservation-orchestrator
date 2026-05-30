export type ActorType = "BACKOFFICE_USER" | "CHANNEL" | "SERVICE";

export type ActorContext = {
  actorType: ActorType;
  actorId: string;
  email?: string;
  roles: string[];
};