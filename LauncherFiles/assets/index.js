const sendMessage = () => {
  customMessage = 0;
  window.api.sendMsg(customMessage);
  document.getElementById('run').disabled = true;
  document.getElementById("loading").style.display = "block";
}