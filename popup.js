chrome.runtime.sendMessage({act: 'get_entry_count'}, (res) => {
  document.querySelector('#entry_count').innerHTML = res
})

document.querySelector('#download_btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({act: 'download'}, (chunks_num) => {
    let segments = []
    let waiting = chunks_num
    for(let c=0; c<chunks_num; ++c){
      chrome.runtime.sendMessage({act: 'chunk', index: c}, (blobAsText) => {
        let bytes = new Uint8Array(blobAsText.length)
        for(let i=0; i<bytes.length; ++i)
          bytes[i] = blobAsText.charCodeAt(i)
        segments[c] = bytes
        --waiting
        if( chunks_num )
          document.querySelector('#progress').innerHTML = ((chunks_num-waiting) / chunks_num * 100 + '').replace(/\..*/, '') + '%'
        if( !waiting ){
          chrome.runtime.sendMessage({act: 'clear'})

          let blob = new Blob(segments, {type: 'application/x-tar'})

          let $downloadElem = document.createElement('a');
          $downloadElem.href = URL.createObjectURL(blob);
          $downloadElem.download = 'book.tar';
          $downloadElem.style.display = "none";
          document.body.appendChild($downloadElem);
          $downloadElem.click();
          document.body.removeChild($downloadElem);
        }
      })
    }
  })
})
