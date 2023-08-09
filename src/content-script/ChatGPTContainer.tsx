import { useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import { fetchPromotion } from '../api'
import { TriggerMode } from '../config'
import ChatGPTCard from './ChatGPTCard'
import { QueryStatus } from './ChatGPTQuery'
import Promotion from './Promotion'

interface Props {
  triggerMode: TriggerMode
}

function ChatGPTContainer(props: Props) {
  const [queryStatus, setQueryStatus] = useState<QueryStatus>()
  const query = useSWRImmutable(
    queryStatus === 'success' ? 'promotion' : undefined,
    fetchPromotion,
    { shouldRetryOnError: false },
  )
  return (
    <>
      <div className="leading-10" style={{height:"200px",overflow:'scroll', backgroundColor:'green',padding:'1rem'}}>
        <ChatGPTCard
          triggerMode={props.triggerMode}
          onStatusChange={setQueryStatus}
        />
      </div>
      {query.data && <Promotion data={query.data} />}
      
    </>
  )
}

export default ChatGPTContainer
