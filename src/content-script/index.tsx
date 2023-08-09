import { render } from 'preact'
import '../base.css'
import { getUserConfig, Language, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import { config, SearchEngine } from './search-engine-configs'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'
import Browser from 'webextension-polyfill'

async function mount() {
  const container = document.createElement('div')
  container.id = 'fresh-gpt-container'

  const userConfig = await getUserConfig()
  let theme: Theme
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container.classList.add('gpt-dark')
  } else {
    container.classList.add('gpt-light')
  }

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

  const clear = ()=>{
    container.remove();
  }

  render(
    <div>
      <div className='flex justify-between'>
        <div 
          className='w-8 h-8 cursor-move bg-red-500'
          onMouseDown={(e)=>{
              isDragging = true;
              offsetX = e.clientX - container.getBoundingClientRect().left;
              offsetY = e.clientY - container.getBoundingClientRect().top;
          }}></div>
        <div className='w-8 h-8 bg-blue-500 cursor-pointer' 
          onClick={clear}
        >
        </div>
      </div>
      <ChatGPTContainer triggerMode={userConfig.triggerMode || 'always'} />
    </div>,
    container,
  )
}


 Browser.runtime.onMessage.addListener((message)=>{
    if(!message) return;
    switch(message.type){
      case 'OPEN_APP':
        mount();
    }
 })

