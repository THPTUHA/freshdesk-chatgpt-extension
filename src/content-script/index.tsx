import { render } from 'preact'
import '../base.css'
import { getUserConfig } from '../config'
import ChatGPTContainer from './ChatGPTContainer'
import { config, SearchEngine } from './search-engine-configs'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'
import Browser from 'webextension-polyfill'
import { GearIcon, GrabberIcon, ThreeBarsIcon, XIcon } from '@primer/octicons-react'
import { useCallback, useState } from 'react'

const NavBar = ({ onMouseDown, clear }: { onMouseDown: any, clear: () => void }) => {
  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])


  return (
    <div className='flex justify-between'>
      <div
        className='h-8 w-8 flex '
        onMouseDown={onMouseDown}>
        <GrabberIcon size={16}
          className='cursor-move'

        />
      </div>
      <div className="cursor-pointer leading-[0] flex" onClick={openOptionsPage}>
        <GearIcon size={16} className='flex' />
      </div>
      <div className='cursor-pointer flex'
        onClick={clear}
      >
        <XIcon size={16} />
      </div>

    </div>
  )
}
async function mount() {
  const container = document.createElement('div')
  container.id = 'fresh-gpt-container'

  const userConfig = await getUserConfig()
  console.log("userConfig",userConfig)
  const siderbarContainer = document.getElementsByTagName("body")[0];
  if (siderbarContainer) {
    siderbarContainer.append(container)
  }

  let offsetX = 0, offsetY = 0, isDragging = false;

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;

    var x = e.clientX - offsetX;
    var y = e.clientY - offsetY;

    container.style.left = x + 'px';
    container.style.top = y + 'px';
  });

  document.addEventListener('mouseup', function () {
    isDragging = false;
  });

  const clear = () => {
    container.remove();
  }



  render(
    <div>
      <NavBar onMouseDown={(e: any) => {
        isDragging = true;
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;
      }}
        clear={clear}
      />
      <ChatGPTContainer />
    </div>,
    container,
  )
}


Browser.runtime.onMessage.addListener((message) => {
  if (!message) return;
  switch (message.type) {
    case 'OPEN_APP':
      mount();
  }
})

