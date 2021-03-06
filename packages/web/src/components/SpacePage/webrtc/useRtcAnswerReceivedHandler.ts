import { RemoteUser } from "../../../models/RemoteUser";
import { ConferenceViewModel } from "../../../viewmodels/ConferenceViewModel";
import { UserPayload } from "./types";
import { logSignaling } from "./signaling";

export const useRtcAnswerReceivedHandler = (
  conference: ConferenceViewModel
) => {
  return async (sender: UserPayload, answer: RTCSessionDescriptionInit) => {
    logSignaling(`[IN] Answer | ${sender.name} ${sender.id}`);

    const remotePeer = conference.remotePeerByUser(
      RemoteUser.create(sender.id, sender.name)
    );

    if (!remotePeer) return;

    await remotePeer.setRemoteDescription(answer);
  };
};
