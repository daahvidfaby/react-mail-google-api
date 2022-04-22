const gapiService = {};
const gapiLoadTimer = setInterval(() => {
    console.log(gapiLoadTimer)
  if (window.gapi) {
      console.log(window.gapi)
    gapiService.gapi = window.gapi;
    clearInterval(gapiLoadTimer);
  }
}, 100);

export default gapiService;