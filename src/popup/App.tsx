import { GearIcon, GlobeIcon } from '@primer/octicons-react'
import { useCallback } from 'react'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import '../base.css'
import logo from '../logo.png'

const isChrome = /chrome/i.test(navigator.userAgent)

function App() {
  const hideShortcutsTipQuery = useSWR('hideShortcutsTip', async () => {
    const { hideShortcutsTip } = await Browser.storage.local.get('hideShortcutsTip')
    return !!hideShortcutsTip
  })

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  const openShortcutsPage = useCallback(() => {
    Browser.storage.local.set({ hideShortcutsTip: true })
    Browser.tabs.create({ url: 'chrome://extensions/shortcuts' })
  }, [])
  
  async function openSumnarize() {
    // const tabs = await Browser.tabs.query({ active: true, currentWindow: true })
    // const res = await Browser.scripting.executeScript({
    //   target: { tabId: tabs[0].id ?? 0 },
    //   func: () => {
    //     const chat = document.getElementById("aw-chat-wrapper");
    //     if (chat) {
    //       const messages = chat.getElementsByClassName("chat-container-wrap")
    //       const data = [];
    //       for(const message of messages){
    //         const name = message.children[0].innerHTML.replace(/<[^>]*>/g, "").replace(/\n/g, ' ').trim();
    //         const content =  message.children[1].getElementsByClassName("user-messages")[0].innerHTML.replace(/<[^>]*>/g, "").trim();
    //         data.push({
    //           name: name,
    //           content: content
    //         })
    //       }
    //       return data;
    //     }
    //   }
    // });
    
    // await Browser.runtime.sendMessage({
    //   type: 'SUMMARIZE',
    //   data: res[0].result
    // });

    const tabs = await Browser.tabs.query({ active: true, currentWindow: true })
    await Browser.tabs.sendMessage(tabs[0].id??0, {type: 'OPEN_APP'})
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-2 flex flex-row items-center px-1">
        <img src={logo} className="w-5 h-5 rounded-sm" />
        <p className="text-sm font-semibold m-0 ml-1">ChatGPT for Google</p>
        <div className="grow"></div>
        <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
          <GearIcon size={16} />
        </span>
      </div>
      {isChrome && !hideShortcutsTipQuery.isLoading && !hideShortcutsTipQuery.data && (
        <p className="m-0 mb-2">
          Tip:{' '}
          <a onClick={openShortcutsPage} className="underline cursor-pointer">
            setup shortcuts
          </a>{' '}
          for faster access.
        </p>
      )}
      <button onClick={() => {
              openSumnarize();
            }}>Open app</button>
    </div>
  )
}

export default App
