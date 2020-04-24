import React from "react";
import { Helmet } from "react-helmet";

import { createTitle } from "../../utils/html";
import { AuthenticatedClient } from "../AuthenticatedClient/AuthenticatedClient";
import { HomeLayout } from "../HomeLayout/HomeLayout";
import { SpacePage } from "../SpacePage/SpacePage";
import { useJoinSpace } from "./useJoinSpace";
import { JoinInputGroup, VideoLayout } from "./styles";
import { Button } from "../ui/Button";

export interface JoinSpacePageProps {
  spaceSlug: string;
}

export const JoinSpacePage: React.FC<JoinSpacePageProps> = ({ spaceSlug }) => {
  const {
    conference,
    userName,
    setUserName,
    isFetching,
    login,
    videoRef,
  } = useJoinSpace({
    slug: spaceSlug,
  });

  if (conference) {
    return (
      <AuthenticatedClient token={conference.localUser().token()}>
        <SpacePage conference={conference} />
      </AuthenticatedClient>
    );
  }

  return (
    <HomeLayout>
      <Helmet>
        <title>{createTitle(`Join space ${spaceSlug}`)}</title>
      </Helmet>

      <VideoLayout>
        <video ref={videoRef} autoPlay muted />

        <JoinInputGroup onSubmit={login}>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            aria-label="Your name. Leave blank for a funny name!"
            placeholder="Your name. Leave blank for a funny name!"
          />
          <Button type="submit" disabled={isFetching}>
            Join
          </Button>
        </JoinInputGroup>
      </VideoLayout>
    </HomeLayout>
  );
};
