import { Button, CssBaseline, GeistProvider, Radio, Text, useToasts } from '@geist-ui/core'
import { useCallback, useEffect, useState } from 'preact/hooks'
import '../base.css'
import {
  ENGINE_TEXT,
  Engine,
  getUserConfig,
  updateUserConfig,
} from '../config'
import logo from '../logo.png'
import {getExtensionVersion } from '../utils'

function OptionsPage() {
  const [engine, setEngine] = useState<Engine>(Engine.Account)
  const [query, setQuery] = useState<string>("")
  const [queryDirty, setQueryDirty] = useState(false);

  const { setToast } = useToasts()

  useEffect(() => {
    getUserConfig().then((config) => {
      setEngine(config.engine);
      setQuery(config.query);
    })
  }, [])

  const onEngineChange = useCallback(
    (engine: Engine) => {
      setEngine(engine)
      updateUserConfig({ engine: engine })
      setToast({ text: 'Changes saved', type: 'success' })
    },
    [setToast],
  )

  const onQueryChange = useCallback(
    (query: string) => {
      setQuery(query)
      setQueryDirty(true);
    },
    [setToast],
  )

  return (
    <div className="container mx-auto">
      <nav className="flex flex-row justify-between items-center mt-5 px-2">
        <div className="flex flex-row items-center gap-2">
          <img src={logo} className="w-10 h-10 rounded-lg" />
          <span className="font-semibold">ChatGPT for Google (v{getExtensionVersion()})</span>
        </div>
      </nav>
      <main className="w-[500px] mx-auto mt-14">
        <Text h2>Options</Text>
        <Text h3 className="mt-5">
          Engine
        </Text>
        <Radio.Group
          value={engine}
          onChange={(val) => onEngineChange(val as Engine)}
        >
          {Object.entries(ENGINE_TEXT).map(([value, texts]) => {
            return (
              <Radio key={value} value={value}>
                {texts.title}
                <Radio.Description>{texts.desc}</Radio.Description>
              </Radio>
            )
          })}
        </Radio.Group>
        <Text>
          The default OpenAi api is not there yet. Features will be developed later! 
        </Text>
        <Text h3 className="mt-5">
          Query
        </Text>
        <input value={query} onChange={(val)=>onQueryChange(val.target.value)} style={{width: "100%"}}/>
        {
          queryDirty && <Button onClick={()=>{
            updateUserConfig({ query: query })
            setToast({ text: 'Changes saved', type: 'success' })
            setQueryDirty(false)
          }}
            style={{
              marginTop: "1rem"
            }}
          >Save</Button>
        }
      </main>
    </div>
  )
}

function App() {

  return (
    <GeistProvider >
      <CssBaseline />
      <OptionsPage />
    </GeistProvider>
  )
}

export default App
