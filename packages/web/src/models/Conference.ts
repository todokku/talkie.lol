import debug from "debug";

import { RemotePeer } from "./RemotePeer";
import { CurrentUser } from "./CurrentUser";
import { RemoteUser } from "./RemoteUser";

const log = debug("app:Conference");

export class Conference {
  private _remotePeers: Set<RemotePeer> = new Set();

  private constructor(
    private _name: string,
    private _currentUser: CurrentUser
  ) {}

  name() {
    return this._name;
  }

  localUser() {
    return this._currentUser;
  }

  addRemotePeer(newRemotePeer: RemotePeer) {
    if (this._remotePeers.has(newRemotePeer)) return;

    log("Adding remote peer to conference");
    this._remotePeers.add(newRemotePeer);

    this._currentUser.startStreamingWithRemotePeer(newRemotePeer);
  }

  removeRemotePeer(remotePeer: RemotePeer) {
    log("Removing remote peer from conference");
    this._remotePeers.delete(remotePeer);
  }

  removeRemoteUser(user: RemoteUser) {
    log("Removing remote peer by user");
    const remotePeer = this.remotePeerByUser(user);

    if (!remotePeer) return;

    this.removeRemotePeer(remotePeer);
  }

  remotePeerByUser(user: RemoteUser): RemotePeer | null {
    return this.allRemotePeers().find((peer) => peer.isUser(user)) || null;
  }

  allRemotePeers(): RemotePeer[] {
    return Array.from(this._remotePeers);
  }

  startLocalAudio(audioTracks: MediaStreamTrack[]) {
    this.localUser().setAudioStream(audioTracks);
    this._startStreamingLocalMediaStreamWithAllPeers();
  }

  stopLocalAudio() {
    this.localUser().stopAudioStream();
    this._stopStreamingLocalMediaStreamWithAllPeers();
  }

  startLocalVideo(videoTracks: MediaStreamTrack[]) {
    this.localUser().setVideoStream(videoTracks);
    this._startStreamingLocalMediaStreamWithAllPeers();
  }

  stopLocalVideo() {
    this.localUser().stopVideoStream();
    this._stopStreamingLocalMediaStreamWithAllPeers();
  }

  leave() {
    this.localUser().stopVideoStream();
    this.localUser().stopAudioStream();

    this.allRemotePeers().forEach((peer) => peer.closeConnection());
  }

  static create(slug: string, currentUser: CurrentUser) {
    return new Conference(slug, currentUser);
  }

  private _startStreamingLocalMediaStreamWithAllPeers() {
    this.allRemotePeers().forEach((peer) =>
      this.localUser().startStreamingWithRemotePeer(peer)
    );
  }

  private _stopStreamingLocalMediaStreamWithAllPeers() {
    this.allRemotePeers().forEach((peer) =>
      this.localUser().stopStreamingWithRemotePeer(peer)
    );
  }
}