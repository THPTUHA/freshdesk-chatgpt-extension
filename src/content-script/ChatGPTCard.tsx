import ChatGPTQuery, { QueryStatus } from './ChatGPTQuery'
interface Props {
  onStatusChange?: (status: QueryStatus) => void
}

function ChatGPTCard(props: Props) {
  return <ChatGPTQuery  onStatusChange={props.onStatusChange} />
}

export default ChatGPTCard
