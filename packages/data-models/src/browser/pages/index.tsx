import * as React from 'react';
import Page from '@loop/core/lib/browser/components/layout/Page';
import Container from '@loop/core/lib/browser/components/layout/Container';
import styled from '@loop/core/lib/browser/utils/styled';

function IndexPage() {
  return (
    <Page>
      <Container>
        <PageContent>
          <h1>Welcome!</h1>
          <p>
            Welcome to Loop example! This example site shows you the loop project structure.
          </p>
          <p>
            You can contribute to the different routes using a monorepository
          </p>
          <p>Enjoy your stay!</p>
        </PageContent>
      </Container>
    </Page>
  );
}

export default IndexPage;

const PageContent = styled('article')`
  max-width: ${props => props.theme.widths.md};
  margin: 0 auto;
  line-height: 1.6;

  a {
    color: ${props => props.theme.colors.brand};
  }

  h1,
  h2,
  h3,
  h4 {
    margin-bottom: 0.5rem;
    font-family: ${props => props.theme.fonts.headings};
    line-height: 1.25;
  }
`;
