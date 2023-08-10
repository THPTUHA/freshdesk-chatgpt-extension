import { useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import { fetchPromotion } from '../api'
import ChatGPTCard from './ChatGPTCard'
import { QueryStatus } from './ChatGPTQuery'
import Promotion from './Promotion'


function ChatGPTContainer() {
  const [queryStatus, setQueryStatus] = useState<QueryStatus>()
  const query = useSWRImmutable(
    queryStatus === 'success' ? 'promotion' : undefined,
    fetchPromotion,
    { shouldRetryOnError: false },
  )
  return (
    <>
      <div className="leading-10 drop-shadow-md" style={{height:"200px",overflowY:'scroll',overflowX:'hidden', backgroundColor:'white',padding:'1rem'}}>
        <ChatGPTCard
          onStatusChange={setQueryStatus}
        />
      </div>
      {query.data && <Promotion data={query.data} />}
      
    </>
  )
}

export default ChatGPTContainer
