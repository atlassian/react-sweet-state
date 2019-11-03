// @flow
import React from 'react';

import { FormContainer, useForm } from '../components/form';
import { useMessages } from '../components/messages';
import { ThemeContainer, useTheme } from '../components/theme';

const ThemeWrapper = React.memo(({ children }: any) => {
  const [{ color }, { change }] = useTheme();
  return (
    <div style={{ background: color }}>
      <h3>With Hooks</h3>
      <button onClick={() => change('#DFF')}>Theme 1</button>
      <button onClick={() => change('#FDF')}>Theme 2</button>
      <button onClick={() => change('#FFD')}>Theme 3</button>
      {children}
    </div>
  );
});

const MessagesList = ({ messages }: any) => (
  <div>
    <ul>
      {messages.map((m, i) => (
        <li key={i}>{m}</li>
      ))}
    </ul>
  </div>
);

const FormComponent = ({ onSubmitSuccess }: any) => {
  const [{ isValid, message, isSending, toUsers }, { input, send }] = useForm();
  return (
    <form
      action="#"
      onSubmit={ev => {
        ev.preventDefault();
        send(message).then(() => onSubmitSuccess(message));
      }}
    >
      <textarea
        value={message}
        disabled={isSending}
        onChange={ev => input(ev.target.value)}
      />
      <button disabled={!isValid || isSending}>
        {isSending ? '...' : `Send to ${toUsers}`}
      </button>
    </form>
  );
};

export const ChatHook = React.memo<any>(
  ({ id, defaultColor, remoteUsers }: any) => {
    const [{ data }, { add }] = useMessages();
    return (
      <ThemeContainer scope={id} defaultColor={defaultColor}>
        <ThemeWrapper>
          <MessagesList messages={data} />
          <FormContainer remoteUsers={remoteUsers}>
            <FormComponent onSubmitSuccess={add} />
          </FormContainer>
        </ThemeWrapper>
      </ThemeContainer>
    );
  }
);
