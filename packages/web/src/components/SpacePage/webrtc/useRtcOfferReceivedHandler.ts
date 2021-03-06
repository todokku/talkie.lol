import { useMutation } from "urql";

import { RemotePeer } from "../../../models/RemotePeer";
import { RemoteUser } from "../../../models/RemoteUser";
import { ConferenceViewModel } from "../../../viewmodels/ConferenceViewModel";
import { UserPayload } from "./types";
import {
  logSignaling,
  SEND_RTC_ANSWER,
  SEND_RTC_ICE_CANDIDATE,
  SEND_RTC_OFFER,
  SendRtcAnswerVariables,
  SendRtcIceCandidateVariables,
  SendRtcOfferVariables,
} from "./signaling";

export const useRtcOfferReceivedHandler = (conference: ConferenceViewModel) => {
  const [, sendRtcOffer] = useMutation<unknown, SendRtcOfferVariables>(
    SEND_RTC_OFFER
  );
  const [, sendRtcAnswer] = useMutation<unknown, SendRtcAnswerVariables>(
    SEND_RTC_ANSWER
  );
  const [, sendRtcIceCandidate] = useMutation<
    unknown,
    SendRtcIceCandidateVariables
  >(SEND_RTC_ICE_CANDIDATE);

  async function handleFirstConnection(remoteUser: RemoteUser) {
    const remotePeer = RemotePeer.createAnswerer(remoteUser, {
      rtcConfiguration: conference.localUser().rtcConfiguration(),
      onIceCandidate: (candidate) => {
        logSignaling(
          `[OUT] Ice Candidate | ${remoteUser.name()} ${remoteUser.id()}`
        );

        sendRtcIceCandidate({
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid!,
          sdpMLineIndex: candidate.sdpMLineIndex!,
          recipientId: remoteUser.id(),
        });
      },
      onNegociationNeeded: (offer) => {
        logSignaling(
          `[OUT] Offer (as answerer) | ${remoteUser.name()} ${remoteUser.id()}`
        );

        sendRtcOffer({
          offer: offer.sdp!,
          recipientId: remoteUser.id(),
        });
      },
      onDisconnected: () => conference.removeRemotePeer(remotePeer),
      onMessage: (message) => conference.addMessage(message),
    });

    conference.addRemotePeer(remotePeer);

    return remotePeer;
  }

  return async (sender: UserPayload, offer: RTCSessionDescriptionInit) => {
    logSignaling(`[IN] Offer | ${sender.name} ${sender.id}`);

    const remoteUser = RemoteUser.create(sender.id, sender.name);
    const remotePeerFromCache = conference.remotePeerByUser(remoteUser);
    let remotePeer: RemotePeer;

    if (remotePeerFromCache) {
      remotePeer = remotePeerFromCache;
    } else {
      remotePeer = await handleFirstConnection(remoteUser);
    }

    // Create an answer
    await remotePeer.setRemoteDescription(offer);
    const answer = await remotePeer.createAnswer();
    await remotePeer.setLocalDescription(answer);

    // Send the answer
    logSignaling(`[OUT] Answer | ${sender.name} ${sender.id}`);

    await sendRtcAnswer({
      answer: answer.sdp!,
      recipientId: sender.id,
    });
  };
};
