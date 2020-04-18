import styled from "styled-components";

export const PageLayout = styled.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  > :nth-child(2) {
    flex: 1;
    overflow-y: auto;
  }
`;

export const HeaderArea = styled.header`
  position: relative;
  z-index: 1;
  padding: 2rem;
  background: var(--background-darker);
  color: var(--color-text);
  box-shadow: var(--box-shadow-2);
`;