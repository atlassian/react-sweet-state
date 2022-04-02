// @flow
import React, { Component, type Node } from 'react';

import { FormSubscriber, FormContainer } from '../components/form';
import { MessagesSubscriber } from '../components/messages';
import { ThemeContainer, ThemeSubscriber } from '../components/theme';

const IsolatedHeader = React.memo(() => (
  <ThemeSubscriber>
    {({ color }, { change }) => (
      <div style={{ background: color }}>
        <button onClick={() => change('#DFF')}>Theme 1</button>
        <button onClick={() => change('#FDF')}>Theme 2</button>
        <button onClick={() => change('#FFD')}>Theme 3</button>
      </div>
    )}
  </ThemeSubscriber>
));

export class ChatRpc extends Component<{
  id: string,
  remoteUsers: number,
  defaultColor: string,
}> {
  render(): Node {
    let { id, defaultColor, remoteUsers } = this.props;
    return (
      <ThemeContainer scope={id} defaultColor={defaultColor}>
        <ThemeSubscriber>
          {({ color }) => (
            <div style={{ background: color }}>
              <h3>With Render-props</h3>
              <IsolatedHeader />
              <MessagesSubscriber>
                {({ data }, { add }) => (
                  <div>
                    <ul>
                      {data.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                    <FormContainer remoteUsers={remoteUsers}>
                      <FormSubscriber>
                        {(
                          { isValid, message, isSending, toUsers },
                          { input, send }
                        ) => (
                          <form
                            action="#"
                            onSubmit={(ev) => {
                              ev.preventDefault();
                              send(message).then(() => add(message));
                            }}
                          >
                            <textarea
                              value={message}
                              disabled={isSending}
                              onChange={(ev) => input(ev.target.value)}
                            />
                            <button disabled={!isValid || isSending}>
                              {isSending ? '...' : `Send to ${toUsers}`}
                            </button>
                          </form>
                        )}
                      </FormSubscriber>
                    </FormContainer>
                  </div>
                )}
              </MessagesSubscriber>
            </div>
          )}
        </ThemeSubscriber>
      </ThemeContainer>
    );
  }
}
