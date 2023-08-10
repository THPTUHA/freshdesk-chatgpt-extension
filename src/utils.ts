import Browser from 'webextension-polyfill'

export function getExtensionVersion() {
  return Browser.runtime.getManifest().version
}

export function getTime(){
  const d = new Date();
  return Math.floor(d.getTime()/1000);
}
function filterTextFromHtml(element: Element){
  return element.innerHTML.replace(/<[^>]*>/g, "").replace(/\n/g, ' ').trim();
}

export function handleFreshChat(){
  const chat = document.getElementById("aw-chat-wrapper");
  if(!chat)  return "";
  const messages = chat.getElementsByClassName("chat-container-wrap")
  const data = [];

  for (const message of messages) {
    console.log(message)
    let name = "", content = "";
    if (message.children.length == 2) {
      name = message.children[0].innerHTML.replace(/<[^>]*>/g, "").replace(/\n/g, ' ').trim();
      content = filterTextFromHtml(message.children[1].getElementsByClassName("user-messages")[0]);

    } else if (message.children.length == 1 && data.length) {
      content = filterTextFromHtml(message.children[0].getElementsByClassName("user-messages")[0]);
    }
    data.push({
      name: name,
      content: content
    })
  }

  return data.map(item => item.name + ": " + item.content).join("\n");
}

export function handleFreshTiket(){
  const tiket = document.getElementsByClassName("ticket-details-wrapper")[0];
  if(!tiket) return "";
  const data = [];
  const responses = document.getElementsByClassName("ticket-details__item");
  for(const res of responses){
    const _user = res.getElementsByClassName("user _ar_redact_")[0];
    const _content = res.getElementsByClassName("ticket-details__item__content")[0];
    let userName = "";
    let content = "";
    if(_user){
      userName = filterTextFromHtml(_user)
    }
    if(_content){
      const detail = _content.getElementsByClassName("ticket-details__conversation__content")[0];
      if(detail){
        content  = filterTextFromHtml(detail);
      }else{
        content  = filterTextFromHtml(_content);
      }
    }
    data.push({
      name: userName,
      content: content
    })

  }
  return data.map(item => item.name + ": " + item.content).join("\n");;

}