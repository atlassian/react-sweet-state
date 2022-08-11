// @flow
import React, { type AbstractComponent } from 'react';

import { FormContainer, useForm } from '../components/form';
import { useMessagesActions, useMessagesValue } from '../components/messages';
import { ThemeContainer, useTheme } from '../components/theme';

const IsolatedHeader = React.memo(() => {
  const [{ color }, { change }] = useTheme();
  return (
    <div style={{ background: color }}>
      <button onClick={() => change('#DFF')}>Theme 1</button>
      <button onClick={() => change('#FDF')}>Theme 2</button>
      <button onClick={() => change('#FFD')}>Theme 3</button>
    </div>
  );
});

const ThemeWrapper = React.memo(({ children }: any) => {
  const [{ color }] = useTheme();
  return (
    <div style={{ background: color }}>
      <h3>With Hooks</h3>
      {children}
    </div>
  );
});

const MessagesList = () => {
  const { data } = useMessagesValue();
  return (
    <div>
      <ul>
        {data.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
};

const FormComponent = ({ onSubmitSuccess }: any) => {
  const [{ isValid, message, isSending, toUsers }, { input, send }] = useForm();
  return (
    <form
      action="#"
      onSubmit={(ev) => {
        ev.preventDefault();
        send(message).then(() => onSubmitSuccess(message));
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
  );
};

type Props = { id: string, defaultColor: string, remoteUsers: any };
export const ChatHook: AbstractComponent<Props> = React.memo(
  ({ id, defaultColor, remoteUsers }: Props) => {
    const { add } = useMessagesActions();
    return (
      <ThemeContainer scope={id} defaultColor={defaultColor}>
        <ThemeWrapper>
          <IsolatedHeader />
          <MessagesList />
          <FormContainer remoteUsers={remoteUsers}>
            <FormComponent onSubmitSuccess={add} />
          </FormContainer>
        </ThemeWrapper>
      </ThemeContainer>
    );
  }
);
