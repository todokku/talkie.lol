import styled from "styled-components";

export const QrCodeVideoPreview = styled.video`
  display: block;
  box-sizing: border-box;
  object-fit: cover;
  width: 100%;
  max-width: 250px;
  border-radius: 1rem;
  margin-bottom: 2rem;
  background: rgba(0, 0, 0, 0.85);
  box-shadow: var(--box-shadow);
`;
