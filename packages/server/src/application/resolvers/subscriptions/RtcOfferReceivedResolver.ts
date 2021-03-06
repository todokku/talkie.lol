import { PubSub, withFilter } from "apollo-server-koa";
import debug from "debug";

import { RtcOfferReceivedEvent } from "../../../domain/events/RtcOfferReceivedEvent";
import { User } from "../../../domain/entities/User";
import { UserId } from "../../../domain/entities/UserId";
import { UserPort } from "../../../usecase/ports/UserPort";
import { SubscriptionResolver } from "./types";
import { SessionDescription } from "../../../domain/entities/SessionDescription";

interface Dependencies {
  userPort: UserPort;
  pubSub: PubSub;
  currentUser: User;
}

interface RtcOfferReceivedResult {
  sender: User;
  offer: {
    type: string;
    sdp: string;
  };
}

const log = debug("app:resolver:RtcfferReceivedResolver");

export class RtcOfferReceivedResolver
  implements
    SubscriptionResolver<RtcOfferReceivedEvent, void, RtcOfferReceivedResult> {
  private readonly userPort: UserPort;
  private readonly pubSub: PubSub;
  private readonly currentUser: User;

  constructor({ userPort, pubSub, currentUser }: Dependencies) {
    this.userPort = userPort;
    this.pubSub = pubSub;
    this.currentUser = currentUser;
  }

  subscribe = withFilter(
    () => this.pubSub.asyncIterator([RtcOfferReceivedEvent.TYPE]),
    (event: RtcOfferReceivedEvent) =>
      this.currentUser.id.is(UserId.fromString(event.recipientId))
  );

  async resolve(
    event: RtcOfferReceivedEvent
  ): Promise<{
    sender: User;
    offer: SessionDescription;
  }> {
    log("resolve");
    const sender = await this.userPort.findUserById(
      UserId.fromString(event.senderId)
    );

    return {
      sender,
      offer: event.offer,
    };
  }
}
