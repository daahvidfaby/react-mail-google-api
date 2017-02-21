var MessagesHelper = (function() {
  var self= {

  }

  self.format = (messagesObjects) => {
    return messagesObjects.map(function (messageObject) {
      const formattedMessage=messageObject;
      formattedMessage.headers = messageObject.payload.headers.reduce(function (messageHeaders, header) {
        if (header.name === 'From') {
          let value=header.value.split(' <');
          messageHeaders[header.name.toLowerCase()] = [];
          messageHeaders.from.name=value[0];
          messageHeaders.from.email = '<' + value[1];
        } else {
          messageHeaders[header.name.toLowerCase()] = header.value;
        }
        return messageHeaders;
      }, {});
      if (messageObject.labelIds.indexOf('UNREAD')> -1) {
        formattedMessage.unread = true;
      }
      return formattedMessage;
    });
  }

  return self;
})();

export {MessagesHelper};
