import { GearIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { Answer } from '../messaging'
import { getTime, handleFreshChat, handleFreshTiket } from '../utils'
import { getUserConfig } from '../config'

export type QueryStatus = 'success' | 'error' | undefined

interface Props {
  onStatusChange?: (status: QueryStatus) => void
}

function ChatGPTQuery(props: Props) {
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [done, setDone] = useState(false)
  const [status, setStatus] = useState<QueryStatus>()
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props.onStatusChange?.(status)
  }, [props, status])

  useEffect(() => {
    setLoading(true);
    setDone(false);
    const port = Browser.runtime.connect()
    const listener = (msg: any) => {
      setLoading(false);
      if (msg.text) {
        setAnswer(msg)
        setStatus('success')
      } else if (msg.error) {
        if (msg.error !== 'QUESTION EMPTY') {
          setError(msg.error)
          setStatus('error')
        }
      } else if (msg.event === 'DONE') {
        setDone(true)
      }
    }

    port.onMessage.addListener(listener)
    port.postMessage({ question: question })
    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
  }, [question, retry])

  useEffect(() => {
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        setError('')
        setLoading(true)
        setRetry((r) => r + 1)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error])

  useEffect(() => {
    if (status === 'success') {
      captureEvent('show_answer', { host: location.host, language: navigator.language })
    }
  }, [question, status])

  const summarize =async () => {
    const config = await getUserConfig();   
    const require = config.query + "\n";
    const time = getTime();

    const qChat = handleFreshChat();
    if(qChat){
      const _q = time + "." + require + qChat;
      console.log("Chat" , _q)
      setQuestion(_q);
      return;
    }

    const qTicket = handleFreshTiket();
    if(qTicket){
      const _q = time + "." + require + qTicket;
      console.log("Ticket" , _q)
      setQuestion(_q);
      return;
    }

    console.log("Error", 'UNSUPPORT')
    setError('UNSUPPORT');
  }

  if (answer && question) {
    return (
      <div className="markdown-body gpt-markdown" id="gpt-answer" dir="auto">
        <div className="gpt-header">

        </div>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {answer.text}
        </ReactMarkdown>
        {done && (
          <button onClick={summarize} className='mt-4 bg-green-500 text-white'>Summarize</button>
        )}
      </div>
    )
  }

  if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE') {
    return (
      <p>
        Please login chatgpt
        <a href="https://chat.openai.com" target="_blank" rel="noreferrer">
          chat.openai.com
        </a>
        {retry > 0 &&
          (() => {
            return (
              <span className="italic block mt-2">
                OpenAI requires passing a security check every once in a while. If this keeps
                happening, change AI provider to OpenAI API in the extension options.
              </span>
            )
          })()}
      </p>
    )
  }


  if (error && error !== 'UNSUPPORT') {
    return (
      <p>
        Failed to load response from ChatGPT:
        <span className="break-all block">{error}</span>
      </p>
    )
  }

  if (loading) {
    return <p className="text-[#b6b8ba] animate-pulse">Waiting for ChatGPT response...</p>
  }
  return (
    <div className='flex flex-col justify-center'>
      {error === 'UNSUPPORT' ? <div>This website content browsing is not supported</div> : ""}
      <button onClick={summarize} className='mt-4 bg-green-500 text-white'>Summarize</button>
    </div>
  )
}

export default memo(ChatGPTQuery)
