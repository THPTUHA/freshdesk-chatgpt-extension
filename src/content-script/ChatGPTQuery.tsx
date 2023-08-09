import { GearIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { Answer } from '../messaging'

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
    const port = Browser.runtime.connect()
    const listener = (msg: any) => {
      setLoading(false);
      if (msg.text) {
        setAnswer(msg)
        setStatus('success')
      } else if (msg.error) {
        if(msg.error !== 'QUESTION EMPTY'){
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

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  const summarize = ()=>{
    const chat = document.getElementById("aw-chat-wrapper");
        if (chat) {
          const messages = chat.getElementsByClassName("chat-container-wrap")
          const data = [];

          for(const message of messages){
            console.log(message)
            let name = "", content = "";
            if(message.children.length == 2){
              name = message.children[0].innerHTML.replace(/<[^>]*>/g, "").replace(/\n/g, ' ').trim();
              content =  message.children[1].getElementsByClassName("user-messages")[0].innerHTML.replace(/<[^>]*>/g, "").replace(/\n/g, ' ').trim();
            }else if(message.children.length == 1 && data.length){
              content = message.children[0].getElementsByClassName("user-messages")[0].innerHTML.replace(/<[^>]*>/g, "").replace(/\n/g, ' ').trim();
            }
            data.push({
              name: name,
              content: content
            })
          }

          const require = "Tóm tắt ý chính cuộc hội thoại sau \n";
          const q = data.map(item=> item.name + ": "+ item.content).join("\n");
          console.log(require + q)
          setQuestion(require + q);
        }
  }
  
  if (answer && question) {
    return (
      <div className="markdown-body gpt-markdown" id="gpt-answer" dir="auto">
        <div className="gpt-header">
          <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
            <GearIcon size={14} />
          </span>
        </div>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {answer.text}
        </ReactMarkdown>
        {done  && (
          <button onClick={summarize}>Summarize</button>
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
  if (error) {
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
    <button onClick={summarize}>Summarize</button>
  )
}

export default memo(ChatGPTQuery)
